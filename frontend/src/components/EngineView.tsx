import React, { useEffect, useMemo, useRef } from "react";
import { Renderer, Entity } from "../engine/Renderer";

type FramePayload = {
  t: number;
  w: number;
  h: number;
  entities: Entity[];
};

type FieldPayload = {
  step: number;
  w: number;
  h: number;
  grid_w: number;
  grid_h: number;
  terrain: number[][];
  water: number[][];
  fertility: number[][];
  climate: number[][];
};

type Props = {
  mode: "2d" | "3d";
  apiBase?: string;
  initialFrame?: FramePayload | null;
  onFrame?: (payload: FramePayload) => void;
  onSelect?: (id: number | null) => void;
  fields?: FieldPayload | null;
  theme?: string;
};

const DEFAULT_API_BASE = "http://127.0.0.1:8000";

const normalizeApiBase = (value?: string) => {
  const raw = (value || "").trim();
  if (!raw) return DEFAULT_API_BASE;
  try {
    const candidate = raw.replace(/^ws/, "http");
    const parsed = new URL(candidate);
    if (parsed.port === "5173") {
      parsed.port = "8000";
    }
    if (!parsed.port && (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")) {
      parsed.port = "8000";
    }
    parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return DEFAULT_API_BASE;
  }
};

const normalizeWsUrl = (apiBase?: string) => {
  const base = normalizeApiBase(apiBase);
  if (!base) return "";
  try {
    const parsed = new URL(base);
    parsed.protocol = parsed.protocol === "https:" ? "wss:" : "ws:";
    parsed.pathname = "/ws/stream";
    return parsed.toString();
  } catch {
    return base.replace(/^http/, "ws").replace(/\/+$/, "") + "/ws/stream";
  }
};

export default function EngineView({
  mode,
  apiBase,
  initialFrame,
  onFrame,
  onSelect,
  fields,
  theme,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const worldRef = useRef({ w: 1, h: 1 });
  const pendingFrameRef = useRef<FramePayload | null>(null);
  const pointerRef = useRef({ down: false, x: 0, y: 0, moved: false });
  const [hasFrame, setHasFrame] = React.useState(false);
  const [rendererReady, setRendererReady] = React.useState(false);
  const [rendererError, setRendererError] = React.useState<string | null>(null);

  const normalizedWsUrl = useMemo(() => {
    return normalizeWsUrl(apiBase);
  }, [apiBase]);

  const httpBase = useMemo(() => {
    return normalizeApiBase(apiBase);
  }, [apiBase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: Renderer | null = null;
    try {
      renderer = new Renderer(canvas);
    } catch (err) {
      setRendererError((err as Error).message || "Failed to initialize WebGL.");
      return;
    }
    rendererRef.current = renderer;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      renderer.resize(rect.width, rect.height);
    };
    resize();
    window.addEventListener("resize", resize);
    setRendererReady(true);

    let raf = 0;
    const loop = () => {
      const r = rendererRef.current;
      if (r) r.render(worldRef.current.w, worldRef.current.h);
      raf = requestAnimationFrame(loop);
    };
    loop();
    const pending = pendingFrameRef.current;
    if (pending) {
      worldRef.current = { w: pending.w, h: pending.h };
      renderer.setEntities(pending.entities || []);
      setHasFrame(true);
      pendingFrameRef.current = null;
      onFrame?.(pending);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setMode(mode);
  }, [mode]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer || !fields) return;
    renderer.setFields(fields);
  }, [fields]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer || !theme) return;
    renderer.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const renderer = rendererRef.current;
    if (!canvas || !renderer) return;
    const onPointerDown = (ev: PointerEvent) => {
      pointerRef.current = { down: true, x: ev.clientX, y: ev.clientY, moved: false };
    };
    const onPointerMove = (ev: PointerEvent) => {
      if (!pointerRef.current.down) return;
      const dx = Math.abs(ev.clientX - pointerRef.current.x);
      const dy = Math.abs(ev.clientY - pointerRef.current.y);
      if (dx + dy > 6) pointerRef.current.moved = true;
    };
    const onPointerUp = (ev: PointerEvent) => {
      const { down, moved } = pointerRef.current;
      pointerRef.current.down = false;
      if (!down || moved) return;
      const rect = canvas.getBoundingClientRect();
      const id = renderer.pick(ev.clientX, ev.clientY, rect);
      onSelect?.(id);
    };
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
    };
  }, [onSelect]);

  useEffect(() => {
    setHasFrame(false);
    let ws: WebSocket | null = null;
    let timer: number | null = null;
    let pollTimer: number | null = null;
    let healthTimer: number | null = null;
    let lastMessage = 0;
    let closed = false;
    const hasWs = Boolean(normalizedWsUrl);

    const applyPayload = (payload: FramePayload) => {
      const renderer = rendererRef.current;
      if (!renderer || !rendererReady) {
        pendingFrameRef.current = payload;
        return;
      }
      worldRef.current = { w: payload.w, h: payload.h };
      renderer.setEntities(payload.entities || []);
      setHasFrame(true);
      onFrame?.(payload);
    };

    const fetchFrame = async () => {
      if (!httpBase) return;
      try {
        const res = await fetch(`${httpBase}/api/frame`);
        if (!res.ok) return;
        if (res.status === 204) return;
        const payload = (await res.json()) as FramePayload;
        applyPayload(payload);
      } catch {
        return;
      }
    };

    const startPolling = () => {
      if (pollTimer) return;
      pollTimer = window.setInterval(fetchFrame, 1000);
      void fetchFrame();
    };

    const stopPolling = () => {
      if (pollTimer) {
        window.clearInterval(pollTimer);
        pollTimer = null;
      }
    };

    const connect = () => {
      if (closed || !normalizedWsUrl) return;
      ws = new WebSocket(normalizedWsUrl);
      ws.onopen = () => {
        lastMessage = Date.now();
      };
      ws.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data) as { w: number; h: number; entities: Entity[] };
          lastMessage = Date.now();
          stopPolling();
          applyPayload(payload);
        } catch {
          return;
        }
      };
      ws.onclose = () => {
        if (closed) return;
        if (timer) window.clearTimeout(timer);
        startPolling();
        timer = window.setTimeout(connect, 1000);
      };
      ws.onerror = () => {
        ws?.close();
      };
    };

    startPolling();
    if (hasWs) {
      connect();
    }
    healthTimer = window.setInterval(() => {
      if (!hasWs) {
        startPolling();
        return;
      }
      if (lastMessage === 0) {
        startPolling();
        return;
      }
      if (Date.now() - lastMessage > 2000) {
        startPolling();
      }
    }, 1000);
    return () => {
      closed = true;
      if (timer) window.clearTimeout(timer);
      if (healthTimer) window.clearInterval(healthTimer);
      stopPolling();
      ws?.close();
    };
  }, [normalizedWsUrl, httpBase, rendererReady]);

  useEffect(() => {
    if (!initialFrame) return;
    pendingFrameRef.current = initialFrame;
    const renderer = rendererRef.current;
    if (renderer && rendererReady) {
      worldRef.current = { w: initialFrame.w, h: initialFrame.h };
      renderer.setEntities(initialFrame.entities || []);
      setHasFrame(true);
      pendingFrameRef.current = null;
      onFrame?.(initialFrame);
    }
  }, [initialFrame, rendererReady]);

  return (
    <div className="canvas-wrap">
      {rendererError && (
        <div className="overlay">
          <div className="small">Renderer error: {rendererError}</div>
        </div>
      )}
      {!hasFrame && (
        <div className="overlay">
          <div className="loading-bar" aria-label="Loading">
            <div className="loading-bar__fill" />
          </div>
          <div className="small">Waiting for frames...</div>
        </div>
      )}
      <canvas ref={canvasRef} />
    </div>
  );
}
