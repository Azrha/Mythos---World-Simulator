import React from "react";
import EngineView from "./EngineView";

export default function Viewer() {
  const raw = (import.meta.env.VITE_API_URL || window.location.origin || "").trim();
  let base = "http://127.0.0.1:8000";
  try {
    const parsed = new URL((raw || base).replace(/^ws/, "http"));
    if (parsed.port === "5173") {
      parsed.port = "8000";
    }
    if (!parsed.port && (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")) {
      parsed.port = "8000";
    }
    parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    base = parsed.toString().replace(/\/+$/, "");
  } catch {
    base = "http://127.0.0.1:8000";
  }
  return <EngineView mode="3d" apiBase={base} />;
}
