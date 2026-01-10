import * as THREE from "three";

export type Entity = {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
  size: number;
  energy?: number;
  wealth?: number;
  hardness?: number;
  kind?: string;
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

type RenderMode = "2d" | "3d";

type Rig = {
  id: number;
  kind: string;
  group: THREE.Group;
  body: THREE.Mesh;
  head?: THREE.Mesh;
  limbs: THREE.Mesh[];
  tail?: THREE.Mesh;
  crest?: THREE.Mesh;
  halo?: THREE.Mesh;
  pickables: THREE.Mesh[];
  baseScale: number;
  phase: number;
};

type Theme = {
  id: string;
  skyTop: string;
  skyBottom: string;
  fog: string;
  fogDensity: number;
  terrainLow: string;
  terrainMid: string;
  terrainHigh: string;
  terrainPeak: string;
  fertilityTint: string;
  waterColor: string;
  waterOpacity: number;
  waterLevel: number;
  heightScale: number;
  sunColor: string;
  sunIntensity: number;
  hemiTop: string;
  hemiBottom: string;
  fillColor: string;
  fillIntensity: number;
  stars: boolean;
};

const COLOR_MAP: Record<string, string> = {
  red: "#ff4646",
  blue: "#4678ff",
  green: "#46ff8c",
  metal: "#bebed2",
  gray: "#a0a0a0",
  gold: "#ffd25a",
  human: "#ffb28c",
  settler: "#f6b796",
  fae: "#d9c4ff",
  tribe: "#d58b6f",
  pilot: "#b9e2ff",
  animal: "#78c85a",
  fauna: "#4fc18b",
  beast: "#8bd96d",
  raptor: "#9bc34f",
  alien: "#78ffd4",
  outsider: "#6fe7ff",
  voidborn: "#9aa7ff",
  building: "#968ca0",
  habitat: "#b39b8f",
  obelisk: "#c6a8ff",
  station: "#7f8da6",
  tree: "#50a050",
  grove: "#2f8a5e",
  cycad: "#6f9e4e",
  dino: "#5ad28c",
  saurian: "#67c77b",
  wyrm: "#a97cff",
  synth: "#c3c7d6",
};

const KIND_MAP: Record<string, string> = {
  human: "humanoid",
  settler: "humanoid",
  fae: "humanoid",
  tribe: "humanoid",
  pilot: "humanoid",
  animal: "animal",
  fauna: "animal",
  beast: "animal",
  raptor: "animal",
  alien: "alien",
  outsider: "alien",
  voidborn: "alien",
  building: "building",
  habitat: "building",
  obelisk: "building",
  station: "building",
  tree: "tree",
  grove: "tree",
  cycad: "tree",
  dino: "dino",
  saurian: "dino",
  wyrm: "dino",
  metal: "machine",
  gold: "machine",
  synth: "machine",
};

const THEMES: Record<string, Theme> = {
  living: {
    id: "living",
    skyTop: "#8bb2d3",
    skyBottom: "#f3d6aa",
    fog: "#dbc6aa",
    fogDensity: 0.0045,
    terrainLow: "#b89e76",
    terrainMid: "#6f8b5b",
    terrainHigh: "#4d6b4b",
    terrainPeak: "#8a8074",
    fertilityTint: "#4b8d48",
    waterColor: "#3e7d92",
    waterOpacity: 0.55,
    waterLevel: 0.08,
    heightScale: 1.0,
    sunColor: "#ffe2b8",
    sunIntensity: 1.05,
    hemiTop: "#c8dcff",
    hemiBottom: "#4a3a2c",
    fillColor: "#7fd9ff",
    fillIntensity: 0.35,
    stars: false,
  },
  fantasy: {
    id: "fantasy",
    skyTop: "#5a8bb4",
    skyBottom: "#ffe9c1",
    fog: "#e3d3b9",
    fogDensity: 0.0036,
    terrainLow: "#d2b894",
    terrainMid: "#8fa76c",
    terrainHigh: "#587a62",
    terrainPeak: "#9a8f82",
    fertilityTint: "#5aa36b",
    waterColor: "#56a2a8",
    waterOpacity: 0.45,
    waterLevel: 0.05,
    heightScale: 1.25,
    sunColor: "#fff0c8",
    sunIntensity: 1.1,
    hemiTop: "#d6e6ff",
    hemiBottom: "#5b4a36",
    fillColor: "#a6f3ff",
    fillIntensity: 0.4,
    stars: false,
  },
  dino: {
    id: "dino",
    skyTop: "#a0643f",
    skyBottom: "#f0c48e",
    fog: "#d0a074",
    fogDensity: 0.0054,
    terrainLow: "#b07a45",
    terrainMid: "#8d6b3f",
    terrainHigh: "#6f5b3b",
    terrainPeak: "#a38f7c",
    fertilityTint: "#7b9c50",
    waterColor: "#4b6d7b",
    waterOpacity: 0.5,
    waterLevel: 0.1,
    heightScale: 1.1,
    sunColor: "#ffd0a0",
    sunIntensity: 1.0,
    hemiTop: "#f2c59a",
    hemiBottom: "#6a4c33",
    fillColor: "#f0b06a",
    fillIntensity: 0.25,
    stars: false,
  },
  space: {
    id: "space",
    skyTop: "#0b0f1f",
    skyBottom: "#0b0a12",
    fog: "#0b0a12",
    fogDensity: 0.0018,
    terrainLow: "#202634",
    terrainMid: "#2d394c",
    terrainHigh: "#3c4a62",
    terrainPeak: "#55627a",
    fertilityTint: "#3b567a",
    waterColor: "#1b2b4b",
    waterOpacity: 0.3,
    waterLevel: -0.2,
    heightScale: 0.55,
    sunColor: "#9bc0ff",
    sunIntensity: 0.7,
    hemiTop: "#4f6fa6",
    hemiBottom: "#10131c",
    fillColor: "#2f6e9f",
    fillIntensity: 0.2,
    stars: true,
  },
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const hash2 = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const noise2 = (x: number, y: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const n00 = hash2(xi, yi);
  const n10 = hash2(xi + 1, yi);
  const n01 = hash2(xi, yi + 1);
  const n11 = hash2(xi + 1, yi + 1);
  const nx0 = n00 * (1 - u) + n10 * u;
  const nx1 = n01 * (1 - u) + n11 * u;
  return nx0 * (1 - v) + nx1 * v;
};

const fbm = (x: number, y: number, octaves = 4) => {
  let value = 0;
  let amp = 0.5;
  let freq = 0.02;
  let norm = 0;
  for (let i = 0; i < octaves; i += 1) {
    value += noise2(x * freq, y * freq) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.0;
  }
  return value / norm;
};

const colorFrom = (value: string) => {
  const key = value.trim().toLowerCase();
  const mapped = COLOR_MAP[key] || value;
  return new THREE.Color(mapped);
};

const kindFrom = (entity: Entity) => {
  if (entity.kind) return entity.kind;
  const key = entity.color.trim().toLowerCase();
  return KIND_MAP[key] || "creature";
};

export class Renderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private orthoCamera: THREE.OrthographicCamera;
  private activeCamera: THREE.Camera;
  private mode: RenderMode = "3d";
  private rigs = new Map<number, Rig>();
  private entities: Entity[] = [];
  private w = 1;
  private h = 1;
  private terrain?: THREE.Mesh;
  private water?: THREE.Mesh;
  private sky?: THREE.Mesh;
  private starfield?: THREE.Points;
  private hemiLight?: THREE.HemisphereLight;
  private sunLight?: THREE.DirectionalLight;
  private fillLight?: THREE.PointLight;
  private fieldData?: FieldPayload;
  private clock = new THREE.Clock();
  private raycaster = new THREE.Raycaster();
  private pickables: THREE.Mesh[] = [];
  private orbit = { azimuth: 0.4, polar: 0.55, distance: 160, target: new THREE.Vector3() };
  private pointer = { down: false, x: 0, y: 0 };
  private heightScale = 6;
  private needsTerrainRebuild = true;
  private themeId = "living";
  private theme = THEMES.living;

  constructor(canvas: HTMLCanvasElement) {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
    });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    this.renderer = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(this.theme.skyBottom);
    scene.fog = new THREE.FogExp2(this.theme.fog, this.theme.fogDensity);
    this.scene = scene;

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 2000);
    camera.position.set(120, 90, 120);
    this.camera = camera;

    const orthoCamera = new THREE.OrthographicCamera(-80, 80, 80, -80, 0.1, 1000);
    orthoCamera.position.set(0, 140, 0);
    orthoCamera.lookAt(0, 0, 0);
    this.orthoCamera = orthoCamera;
    this.activeCamera = camera;

    this.setupLighting();
    this.setupEnvironment();
    this.bindControls(canvas);
  }

  private setupLighting() {
    const hemi = new THREE.HemisphereLight(this.theme.hemiTop, this.theme.hemiBottom, 0.6);
    this.scene.add(hemi);
    this.hemiLight = hemi;

    const dir = new THREE.DirectionalLight(this.theme.sunColor, this.theme.sunIntensity);
    dir.position.set(120, 180, 80);
    dir.castShadow = true;
    dir.shadow.mapSize.set(2048, 2048);
    dir.shadow.camera.near = 10;
    dir.shadow.camera.far = 400;
    dir.shadow.camera.left = -160;
    dir.shadow.camera.right = 160;
    dir.shadow.camera.top = 160;
    dir.shadow.camera.bottom = -160;
    this.scene.add(dir);
    this.sunLight = dir;

    const fill = new THREE.PointLight(this.theme.fillColor, this.theme.fillIntensity, 400, 2);
    fill.position.set(-120, 80, -60);
    this.scene.add(fill);
    this.fillLight = fill;
  }

  private setupEnvironment() {
    this.buildSky();
    this.buildTerrain(this.w, this.h);
    this.updateStars();
  }

  private buildSky() {
    if (this.sky) {
      this.scene.remove(this.sky);
    }
    const geom = new THREE.SphereGeometry(600, 32, 24);
    const material = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor: { value: new THREE.Color(this.theme.skyTop) },
        bottomColor: { value: new THREE.Color(this.theme.skyBottom) },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition).y * 0.5 + 0.5;
          vec3 color = mix(bottomColor, topColor, smoothstep(0.1, 0.9, h));
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
    this.sky = new THREE.Mesh(geom, material);
    this.scene.add(this.sky);
  }

  private updateStars() {
    if (this.starfield) {
      this.scene.remove(this.starfield);
      this.starfield.geometry.dispose();
      (this.starfield.material as THREE.Material).dispose();
      this.starfield = undefined;
    }
    if (!this.theme.stars) return;
    const stars = new THREE.BufferGeometry();
    const count = 700;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = 480 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    stars.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: "#c7d7ff",
      size: 1.6,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    });
    this.starfield = new THREE.Points(stars, material);
    this.scene.add(this.starfield);
  }

  private sampleField(u: number, v: number, field?: number[][]) {
    if (!field || !this.fieldData) return 0.0;
    const w = this.fieldData.grid_w;
    const h = this.fieldData.grid_h;
    const x = clamp(u * (w - 1), 0, w - 1);
    const y = clamp(v * (h - 1), 0, h - 1);
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = Math.min(x0 + 1, w - 1);
    const y1 = Math.min(y0 + 1, h - 1);
    const fx = x - x0;
    const fy = y - y0;
    const v00 = field[y0][x0];
    const v10 = field[y0][x1];
    const v01 = field[y1][x0];
    const v11 = field[y1][x1];
    const nx0 = v00 * (1 - fx) + v10 * fx;
    const nx1 = v01 * (1 - fx) + v11 * fx;
    return nx0 * (1 - fy) + nx1 * fy;
  }

  private buildTerrain(worldW: number, worldH: number) {
    if (this.terrain) {
      this.scene.remove(this.terrain);
      this.terrain.geometry.dispose();
      (this.terrain.material as THREE.Material).dispose();
    }
    if (this.water) {
      this.scene.remove(this.water);
      this.water.geometry.dispose();
      (this.water.material as THREE.Material).dispose();
    }

    const segX = clamp(Math.round(worldW / 4), 40, 180);
    const segZ = clamp(Math.round(worldH / 4), 40, 180);
    const geom = new THREE.PlaneGeometry(worldW, worldH, segX, segZ);
    geom.rotateX(-Math.PI / 2);
    const position = geom.attributes.position as THREE.BufferAttribute;
    const colors: number[] = [];
    this.heightScale = clamp(Math.min(worldW, worldH) * 0.03 * this.theme.heightScale, 2, 12);

    let waterSum = 0;
    let waterCount = 0;

    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const z = position.getZ(i);
      const u = clamp(x / worldW + 0.5, 0, 1);
      const v = clamp(z / worldH + 0.5, 0, 1);

      const terrainField = this.fieldData ? this.sampleField(u, v, this.fieldData.terrain) : fbm(x, z, 5);
      const waterField = this.fieldData ? this.sampleField(u, v, this.fieldData.water) : 0.0;
      const fertilityField = this.fieldData ? this.sampleField(u, v, this.fieldData.fertility) : 0.4;
      const climateField = this.fieldData ? this.sampleField(u, v, this.fieldData.climate) : 0.5;

      const terrainValue = clamp(terrainField, 0, 1);
      const elevation = (terrainValue - 0.5) * this.heightScale * 2.0;
      position.setY(i, elevation);

      const color = new THREE.Color();
      if (terrainValue < 0.32) {
        color.set(this.theme.terrainLow).lerp(new THREE.Color(this.theme.terrainMid), terrainValue / 0.32);
      } else if (terrainValue < 0.6) {
        color.set(this.theme.terrainMid).lerp(
          new THREE.Color(this.theme.terrainHigh),
          (terrainValue - 0.32) / 0.28
        );
      } else {
        color.set(this.theme.terrainHigh).lerp(
          new THREE.Color(this.theme.terrainPeak),
          (terrainValue - 0.6) / 0.4
        );
      }

      const fertility = clamp(fertilityField / 1.2, 0, 1);
      color.lerp(new THREE.Color(this.theme.fertilityTint), fertility * 0.35);

      const climate = clamp(climateField, 0, 1);
      color.lerp(new THREE.Color("#cbb28d"), (1 - climate) * 0.2);

      const waterDepth = clamp(waterField / 1.2, 0, 1);
      if (waterDepth > 0.15) {
        color.lerp(new THREE.Color(this.theme.waterColor), waterDepth * 0.5);
      }
      colors.push(color.r, color.g, color.b);

      waterSum += waterDepth;
      waterCount += 1;
    }
    geom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geom.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.9,
      metalness: 0.05,
    });
    const terrain = new THREE.Mesh(geom, mat);
    terrain.receiveShadow = true;
    this.terrain = terrain;
    this.scene.add(terrain);

    const waterVisible = waterCount ? waterSum / waterCount > 0.08 : false;
    const waterGeom = new THREE.PlaneGeometry(worldW * 1.02, worldH * 1.02, 1, 1);
    waterGeom.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: this.theme.waterColor,
      roughness: 0.18,
      metalness: 0.25,
      transparent: true,
      opacity: this.theme.waterOpacity,
      clearcoat: 0.35,
      transmission: 0.15,
    });
    const water = new THREE.Mesh(waterGeom, waterMat);
    water.position.y = this.theme.waterLevel * this.heightScale;
    water.receiveShadow = true;
    water.visible = waterVisible;
    this.water = water;
    this.scene.add(water);
  }

  private bindControls(canvas: HTMLCanvasElement) {
    canvas.style.touchAction = "none";
    canvas.addEventListener("pointerdown", (ev) => {
      this.pointer.down = true;
      this.pointer.x = ev.clientX;
      this.pointer.y = ev.clientY;
    });
    canvas.addEventListener("pointerup", () => {
      this.pointer.down = false;
    });
    canvas.addEventListener("pointerleave", () => {
      this.pointer.down = false;
    });
    canvas.addEventListener("pointermove", (ev) => {
      if (!this.pointer.down) return;
      const dx = ev.clientX - this.pointer.x;
      const dy = ev.clientY - this.pointer.y;
      this.pointer.x = ev.clientX;
      this.pointer.y = ev.clientY;
      this.orbit.azimuth -= dx * 0.004;
      this.orbit.polar = clamp(this.orbit.polar + dy * 0.004, 0.15, 1.25);
    });
    canvas.addEventListener(
      "wheel",
      (ev) => {
        ev.preventDefault();
        this.orbit.distance = clamp(this.orbit.distance + ev.deltaY * 0.15, 50, 500);
      },
      { passive: false }
    );
  }

  setMode(mode: RenderMode) {
    this.mode = mode;
    this.activeCamera = mode === "2d" ? this.orthoCamera : this.camera;
  }

  setTheme(themeId: string) {
    const nextTheme = THEMES[themeId] || THEMES.living;
    if (nextTheme.id === this.themeId) return;
    this.themeId = nextTheme.id;
    this.theme = nextTheme;
    if (this.scene.fog) {
      this.scene.fog.color = new THREE.Color(this.theme.fog);
      (this.scene.fog as THREE.FogExp2).density = this.theme.fogDensity;
    }
    this.scene.background = new THREE.Color(this.theme.skyBottom);
    if (this.hemiLight) {
      this.hemiLight.color = new THREE.Color(this.theme.hemiTop);
      this.hemiLight.groundColor = new THREE.Color(this.theme.hemiBottom);
    }
    if (this.sunLight) {
      this.sunLight.color = new THREE.Color(this.theme.sunColor);
      this.sunLight.intensity = this.theme.sunIntensity;
    }
    if (this.fillLight) {
      this.fillLight.color = new THREE.Color(this.theme.fillColor);
      this.fillLight.intensity = this.theme.fillIntensity;
    }
    this.buildSky();
    this.updateStars();
    this.needsTerrainRebuild = true;
  }

  setFields(fields: FieldPayload) {
    this.fieldData = fields;
    this.needsTerrainRebuild = true;
  }

  resize(w: number, h: number) {
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    const orthoSpan = Math.max(this.w, this.h) * 0.6;
    this.orthoCamera.left = -orthoSpan;
    this.orthoCamera.right = orthoSpan;
    this.orthoCamera.top = orthoSpan;
    this.orthoCamera.bottom = -orthoSpan;
    this.orthoCamera.updateProjectionMatrix();
  }

  setEntities(entities: Entity[]) {
    this.entities = entities;
    const liveIds = new Set(entities.map((e) => e.id));
    for (const [id, rig] of this.rigs.entries()) {
      if (!liveIds.has(id)) {
        rig.pickables.forEach((mesh) => {
          const index = this.pickables.indexOf(mesh);
          if (index >= 0) this.pickables.splice(index, 1);
        });
        this.scene.remove(rig.group);
        this.rigs.delete(id);
      }
    }
    for (const entity of entities) {
      if (!this.rigs.has(entity.id)) {
        const rig = this.createRig(entity);
        this.rigs.set(entity.id, rig);
        this.scene.add(rig.group);
      }
    }
  }

  private registerPickable(mesh: THREE.Mesh, id: number, list: THREE.Mesh[]) {
    mesh.userData.entityId = id;
    this.pickables.push(mesh);
    list.push(mesh);
  }

  private createRig(entity: Entity): Rig {
    const kind = kindFrom(entity);
    const baseColor = colorFrom(entity.color || "#f5d7b6");
    const accent = baseColor.clone().lerp(new THREE.Color("#ffffff"), 0.35);
    const metal = new THREE.Color("#e1e6ef");
    const scale = clamp(entity.size || 4, 2.5, 8) * 0.35;

    const bodyMat = new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: 0.55,
      metalness: kind === "machine" ? 0.6 : 0.15,
      emissive: baseColor.clone().multiplyScalar(0.2),
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: accent,
      roughness: 0.35,
      metalness: 0.2,
      emissive: accent.clone().multiplyScalar(0.15),
    });
    const metalMat = new THREE.MeshStandardMaterial({
      color: metal,
      roughness: 0.25,
      metalness: 0.8,
    });

    const group = new THREE.Group();
    const limbs: THREE.Mesh[] = [];
    const pickables: THREE.Mesh[] = [];

    const bodyGeom = new THREE.SphereGeometry(1, 20, 16);
    const headGeom = new THREE.SphereGeometry(0.55, 16, 12);
    const limbGeom = new THREE.CylinderGeometry(0.12, 0.2, 1.0, 10);
    const tailGeom = new THREE.ConeGeometry(0.25, 1.1, 12);

    let body = new THREE.Mesh(bodyGeom, bodyMat);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);
    this.registerPickable(body, entity.id, pickables);

    let head: THREE.Mesh | undefined;
    let tail: THREE.Mesh | undefined;
    let crest: THREE.Mesh | undefined;
    let halo: THREE.Mesh | undefined;

    if (kind === "building") {
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 1.4), bodyMat);
      base.position.y = 0.7;
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);
      this.registerPickable(base, entity.id, pickables);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.8, 4), accentMat);
      roof.position.y = 1.6;
      roof.rotation.y = Math.PI * 0.25;
      roof.castShadow = true;
      group.add(roof);
      this.registerPickable(roof, entity.id, pickables);

      body.visible = false;
    } else if (kind === "tree") {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.8, 12), metalMat);
      trunk.position.y = 0.9;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      group.add(trunk);
      this.registerPickable(trunk, entity.id, pickables);

      const canopy = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 12), bodyMat);
      canopy.position.y = 2.0;
      canopy.castShadow = true;
      group.add(canopy);
      this.registerPickable(canopy, entity.id, pickables);

      body.visible = false;
    } else {
      if (kind === "dino") {
        body.scale.set(1.4, 0.8, 2.0);
      } else if (kind === "humanoid") {
        body.scale.set(0.9, 1.4, 0.6);
      } else if (kind === "alien") {
        body.scale.set(1.2, 1.6, 1.0);
      } else {
        body.scale.set(1.2, 1.0, 1.3);
      }

      head = new THREE.Mesh(headGeom, accentMat);
      head.position.set(0, kind === "humanoid" ? 1.6 : 0.9, kind === "dino" ? 1.2 : 1.0);
      head.castShadow = true;
      group.add(head);
      this.registerPickable(head, entity.id, pickables);

      for (let i = 0; i < 4; i += 1) {
        const limb = new THREE.Mesh(limbGeom, metalMat);
        limb.position.set(i < 2 ? -0.45 : 0.45, 0.4, i % 2 === 0 ? -0.6 : 0.6);
        limb.castShadow = true;
        limbs.push(limb);
        group.add(limb);
        this.registerPickable(limb, entity.id, pickables);
      }

      if (kind !== "humanoid") {
        tail = new THREE.Mesh(tailGeom, accentMat);
        tail.position.set(0, 0.6, -1.4);
        tail.rotation.x = Math.PI * 0.6;
        tail.castShadow = true;
        group.add(tail);
        this.registerPickable(tail, entity.id, pickables);
      }

      if (kind === "alien") {
        crest = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.08, 10, 24), accentMat);
        crest.position.y = 1.2;
        crest.rotation.x = Math.PI / 2;
        group.add(crest);
        this.registerPickable(crest, entity.id, pickables);
      }

      if (kind === "machine") {
        halo = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.1, 10, 24), metalMat);
        halo.position.y = 1.2;
        halo.rotation.x = Math.PI / 2;
        group.add(halo);
        this.registerPickable(halo, entity.id, pickables);
      }
    }

    const phase = (entity.id * 0.37) % Math.PI;
    group.scale.setScalar(scale);

    return {
      id: entity.id,
      kind,
      group,
      body,
      head,
      limbs,
      tail,
      crest,
      halo,
      pickables,
      baseScale: scale,
      phase,
    };
  }

  pick(clientX: number, clientY: number, rect: DOMRect) {
    if (!this.pickables.length) return null;
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.activeCamera);
    const hits = this.raycaster.intersectObjects(this.pickables, false);
    if (!hits.length) return null;
    const id = hits[0].object.userData.entityId;
    return typeof id === "number" ? id : null;
  }

  render(worldW: number, worldH: number) {
    if (worldW !== this.w || worldH !== this.h || this.needsTerrainRebuild) {
      this.w = worldW;
      this.h = worldH;
      this.buildTerrain(worldW, worldH);
      this.needsTerrainRebuild = false;
      this.orbit.distance = clamp(Math.max(worldW, worldH) * 0.7, 90, 400);
      this.resize(this.renderer.domElement.clientWidth || 1, this.renderer.domElement.clientHeight || 1);
    }

    const elapsed = this.clock.getElapsedTime();
    const centerX = this.w * 0.5;
    const centerZ = this.h * 0.5;

    for (const entity of this.entities) {
      const rig = this.rigs.get(entity.id);
      if (!rig) continue;

      const u = clamp(entity.x / this.w, 0, 1);
      const v = clamp(entity.y / this.h, 0, 1);
      const terrainValue = this.fieldData ? this.sampleField(u, v, this.fieldData.terrain) : fbm(entity.x, entity.y, 4);
      const elevation = (clamp(terrainValue, 0, 1) - 0.5) * this.heightScale * 2.0;
      const height = elevation + (entity.z || 0) * 0.4;
      rig.group.position.set(entity.x - centerX, height, entity.y - centerZ);

      const speed = Math.hypot(entity.vx || 0, entity.vy || 0);
      const heading = Math.atan2(entity.vx || 0, entity.vy || 0);
      rig.group.rotation.y = heading + Math.PI;

      const pulse = Math.sin(elapsed * 2 + rig.phase) * 0.06;
      rig.group.position.y += pulse;

      const gait = Math.sin(elapsed * 4 + rig.phase) * 0.6 * (0.5 + clamp(speed, 0, 2));
      rig.limbs.forEach((limb, idx) => {
        limb.rotation.x = (idx % 2 === 0 ? 1 : -1) * gait;
      });
      if (rig.head) {
        rig.head.rotation.x = Math.sin(elapsed * 1.6 + rig.phase) * 0.2;
      }
      if (rig.tail) {
        rig.tail.rotation.y = Math.sin(elapsed * 2.2 + rig.phase) * 0.4;
      }
      if (rig.crest) {
        rig.crest.rotation.z = Math.sin(elapsed * 1.3 + rig.phase) * 0.2;
      }
      if (rig.halo) {
        rig.halo.rotation.z = elapsed * 0.5;
      }

      const energy = clamp(entity.energy ?? 0.6, 0.1, 2.0);
      const intensity = 0.15 + energy * 0.25;
      const mat = rig.body.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = intensity;

      if (rig.kind === "building") {
        rig.group.scale.setScalar(rig.baseScale * 1.3);
      } else if (rig.kind === "tree") {
        rig.group.scale.setScalar(rig.baseScale * 1.2);
      } else {
        rig.group.scale.setScalar(rig.baseScale * (0.9 + energy * 0.2));
      }
    }

    if (this.mode === "3d") {
      const radius = this.orbit.distance;
      const az = this.orbit.azimuth;
      const pol = this.orbit.polar;
      const target = this.orbit.target;
      target.set(0, 0, 0);
      const x = target.x + radius * Math.sin(pol) * Math.sin(az);
      const y = target.y + radius * Math.cos(pol);
      const z = target.z + radius * Math.sin(pol) * Math.cos(az);
      this.camera.position.set(x, y, z);
      this.camera.lookAt(target);
    } else {
      this.orthoCamera.position.set(0, 140, 0);
      this.orthoCamera.lookAt(0, 0, 0);
    }

    this.renderer.render(this.scene, this.activeCamera);
  }
}
