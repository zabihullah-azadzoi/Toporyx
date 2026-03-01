import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Square,
  Circle as CircleIcon,
  Diamond,
  Type,
  MousePointer2,
  Link as LinkIcon,
  Trash2,
  MoveRight,
  MoveLeft,
  ArrowLeftRight,
  Minus,
  Palette,
  Database,
  Server,
  Shield,
  Network,
  MonitorSmartphone,
  Cloud,
  BringToFront,
  SendToBack,
  Plus,
  Bold,
  Type as TypeIcon,
  Hand,
  Wand2,
  ZoomIn,
  ZoomOut,
  Layers,
  CheckCircle,
  XCircle,
  Zap,
  Ban,
  MoreHorizontal,
  FolderOpen,
  PlusCircle,
  Edit2,
  Check,
  Clock,
  Lock,
  Unlock,
  ArrowRightLeft,
  Radio,
  Repeat,
  Copy,
  ArrowDownUp,
  Activity,
  Monitor,
  Crop,
  Image as ImageIcon,
  ClipboardCopy,
  ArrowRight,
} from "lucide-react";

// --- THEMES & PALETTE ---
const COLORS = {
  cyan: {
    name: "cyan",
    hex: "#22d3ee",
    bg: "rgba(8, 27, 38, 0.6)",
    text: "text-cyan-200",
  },
  indigo: {
    name: "indigo",
    hex: "#818cf8",
    bg: "rgba(12, 16, 44, 0.6)",
    text: "text-indigo-200",
  },
  emerald: {
    name: "emerald",
    hex: "#34d399",
    bg: "rgba(2, 24, 16, 0.6)",
    text: "text-emerald-200",
  },
  red: {
    name: "red",
    hex: "#ef4444",
    bg: "rgba(38, 9, 9, 0.6)",
    text: "text-red-200",
  },
  amber: {
    name: "amber",
    hex: "#fbbf24",
    bg: "rgba(38, 24, 4, 0.6)",
    text: "text-amber-200",
  },
  slate: {
    name: "slate",
    hex: "#94a3b8",
    bg: "rgba(15, 23, 42, 0.6)",
    text: "text-slate-200",
  },
};

const BG_THEMES = [
  {
    id: "cyberpunk",
    bgClass: "bg-[#020617]",
    bgHex: "#020617",
    gridColor: "#4f46e5",
    glow1: "bg-indigo-900/10",
    glow2: "bg-red-900/10",
  },
  {
    id: "neon",
    bgClass: "bg-[#000000]",
    bgHex: "#000000",
    gridColor: "#22d3ee",
    glow1: "bg-cyan-900/10",
    glow2: "bg-fuchsia-900/10",
  },
  {
    id: "matrix",
    bgClass: "bg-[#051005]",
    bgHex: "#051005",
    gridColor: "#16a34a",
    glow1: "bg-green-900/10",
    glow2: "bg-emerald-900/10",
  },
  {
    id: "blueprint",
    bgClass: "bg-[#0a192f]",
    bgHex: "#0a192f",
    gridColor: "#3b82f6",
    glow1: "bg-blue-900/10",
    glow2: "bg-sky-900/10",
  },
];

const SYSTEM_ICONS = {
  database: Database,
  server: Server,
  proxy: Shield,
  lb: Network,
  client: MonitorSmartphone,
  queue: Layers,
};

const INITIAL_NODES = [
  {
    id: "n_1",
    type: "rect",
    x: 50,
    y: 50,
    w: 900,
    h: 600,
    color: "slate",
    zOffset: -10,
    text: "",
    labels: [
      {
        id: "l_1",
        text: "Production VPC",
        x: 450,
        y: 40,
        color: "slate",
        bold: true,
        size: 24,
      },
    ],
    rotation: 0,
  },
  {
    id: "n_cloud",
    type: "cloud",
    x: 250,
    y: -150,
    w: 500,
    h: 250,
    color: "cyan",
    zOffset: -5,
    text: "Internet / Edge",
    size: 20,
    bold: true,
    status: "healthy",
    labels: [],
    rotation: 0,
  },
  {
    id: "n_2",
    type: "client",
    x: 100,
    y: 300,
    w: 120,
    h: 100,
    color: "cyan",
    zOffset: 0,
    text: "Users",
    size: 14,
    bold: true,
    status: "healthy",
    rotation: 0,
  },
  {
    id: "n_3",
    type: "lb",
    x: 350,
    y: 300,
    w: 120,
    h: 100,
    color: "indigo",
    zOffset: 0,
    text: "Nginx LB",
    size: 14,
    bold: true,
    status: "healthy",
    rotation: 0,
  },
  {
    id: "n_4",
    type: "server",
    x: 600,
    y: 150,
    w: 120,
    h: 100,
    color: "emerald",
    zOffset: 0,
    text: "App Node 1",
    size: 14,
    bold: true,
    status: "healthy",
    rotation: 0,
  },
  {
    id: "n_5",
    type: "server",
    x: 600,
    y: 450,
    w: 120,
    h: 100,
    color: "red",
    zOffset: 0,
    text: "App Node 2\n(Crashed)",
    size: 14,
    bold: true,
    status: "down",
    rotation: 0,
  },
  {
    id: "n_queue",
    type: "queue",
    x: 800,
    y: 150,
    w: 120,
    h: 100,
    color: "amber",
    zOffset: 0,
    text: "Kafka Topic\n(Throttled)",
    size: 14,
    bold: true,
    status: "throttled",
    rotation: 0,
  },
  {
    id: "n_6",
    type: "database",
    x: 1050,
    y: 300,
    w: 140,
    h: 140,
    color: "red",
    zOffset: 0,
    text: "Primary DB",
    size: 14,
    bold: true,
    status: "healthy",
    rotation: 0,
  },
];

const INITIAL_EDGES = [
  {
    id: "e_0",
    source: "n_cloud",
    target: "n_3",
    color: "cyan",
    direction: "forward",
    flow: "default",
    sourcePort: "bottom",
    targetPort: "top",
    encrypted: true,
  },
  {
    id: "e_1",
    source: "n_2",
    target: "n_3",
    color: "cyan",
    direction: "forward",
    flow: "rest",
    sourcePort: "right",
    targetPort: "left",
  },
  {
    id: "e_2",
    source: "n_3",
    target: "n_4",
    color: "indigo",
    direction: "forward",
    flow: "grpc",
    sourcePort: "right",
    targetPort: "left",
  },
  {
    id: "e_3",
    source: "n_3",
    target: "n_5",
    color: "red",
    direction: "forward",
    flow: "dropped",
    sourcePort: "right",
    targetPort: "left",
  },
  {
    id: "e_q",
    source: "n_4",
    target: "n_queue",
    color: "amber",
    direction: "forward",
    flow: "pubsub",
    sourcePort: "right",
    targetPort: "left",
  },
  {
    id: "e_4",
    source: "n_queue",
    target: "n_6",
    color: "emerald",
    direction: "both",
    flow: "default",
    sourcePort: "right",
    targetPort: "top",
  },
];

const RESIZE_HANDLES = [
  { dir: "nw", cursor: "nwse-resize", top: -5, left: -5 },
  { dir: "n", cursor: "ns-resize", top: -5, left: "calc(50% - 5px)" },
  { dir: "ne", cursor: "nesw-resize", top: -5, right: -5 },
  { dir: "e", cursor: "ew-resize", top: "calc(50% - 5px)", right: -5 },
  { dir: "se", cursor: "nwse-resize", bottom: -5, right: -5 },
  { dir: "s", cursor: "ns-resize", bottom: -5, left: "calc(50% - 5px)" },
  { dir: "sw", cursor: "nesw-resize", bottom: -5, left: -5 },
  { dir: "w", cursor: "ew-resize", top: "calc(50% - 5px)", left: -5 },
];

// Prevents React crashes when coordinates momentarily drop to NaN
const safeVal = (val, fallback = 0) =>
  typeof val === "number" && Number.isFinite(val) ? val : fallback;

export default function App() {
  // --- LOCAL STORAGE ENGINE ---
  const [boards, setBoards] = useState(() => {
    try {
      const saved = localStorage.getItem("cyberBoardsV8");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Storage read error", e);
    }
    return [
      {
        id: "b_default",
        name: "Main Architecture",
        nodes: INITIAL_NODES,
        edges: INITIAL_EDGES,
        camera: { x: 0, y: 0, z: 1 },
      },
    ];
  });

  const [activeBoardId, setActiveBoardId] = useState(boards[0]?.id);
  const activeBoard = boards.find((b) => b.id === activeBoardId) || boards[0];

  const [nodes, setNodes] = useState(activeBoard.nodes || []);
  const [edges, setEdges] = useState(activeBoard.edges || []);
  const [camera, setCamera] = useState(
    activeBoard.camera || { x: 0, y: 0, z: 1 },
  );

  useEffect(() => {
    localStorage.setItem("cyberBoardsV8", JSON.stringify(boards));
  }, [boards]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setBoards((prev) =>
        prev.map((b) =>
          b.id === activeBoardId
            ? { ...b, nodes, edges, camera, updatedAt: Date.now() }
            : b,
        ),
      );
    }, 500);
    return () => clearTimeout(timeout);
  }, [nodes, edges, camera, activeBoardId]);

  // UI STATE
  const [tool, setTool] = useState("pointer");
  const [activeColor, setActiveColor] = useState("cyan");
  const [bgThemeIndex, setBgThemeIndex] = useState(0);
  const theme = BG_THEMES[bgThemeIndex];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingBoardNameId, setEditingBoardNameId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // SELECTION & INTERACTION STATE
  const [selectedId, setSelectedId] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [editingLabel, setEditingLabel] = useState(null);
  const [editingNodeTextId, setEditingNodeTextId] = useState(null);

  const [dragInfo, setDragInfo] = useState(null);
  const [panInfo, setPanInfo] = useState(null);
  const [dragLabelInfo, setDragLabelInfo] = useState(null);
  const [dragEdgeCpInfo, setDragEdgeCpInfo] = useState(null);
  const [dragPortInfo, setDragPortInfo] = useState(null);
  const [resizeInfo, setResizeInfo] = useState(null);
  const [linkStartNode, setLinkStartNode] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [screenshotArea, setScreenshotArea] = useState(null);

  // NEW: Drawing engines
  const [drawingInfo, setDrawingInfo] = useState(null);
  const [rotateInfo, setRotateInfo] = useState(null);

  const containerRef = useRef(null);
  const stateRef = useRef({ nodes, edges });
  useEffect(() => {
    stateRef.current = { nodes, edges };
  }, [nodes, edges]);

  const interRef = useRef({});
  useEffect(() => {
    interRef.current = {
      dragInfo,
      dragPortInfo,
      dragEdgeCpInfo,
      resizeInfo,
      tool,
      screenshotArea,
      drawingInfo,
      rotateInfo,
    };
  });

  const laserPointsRef = useRef([]);
  const laserGroupRef = useRef(null);
  const laserCoreRef = useRef(null);
  const laserRafRef = useRef(null);

  const handleSwitchBoard = (board) => {
    setActiveBoardId(board.id);
    setNodes(board.nodes || []);
    setEdges(board.edges || []);
    setCamera(board.camera || { x: 0, y: 0, z: 1 });
    setSelectedId(null);
    setSidebarOpen(false);
    setScreenshotArea(null);
  };

  const createNewBoard = () => {
    const newBoard = {
      id: `b_${Date.now()}`,
      name: `Diagram ${boards.length + 1}`,
      nodes: [],
      edges: [],
      camera: { x: 0, y: 0, z: 1 },
      updatedAt: Date.now(),
    };
    setBoards((prev) => [newBoard, ...prev]);
    handleSwitchBoard(newBoard);
  };

  const deleteBoard = (id, e) => {
    e.stopPropagation();
    if (boards.length <= 1) return;
    const remaining = boards.filter((b) => b.id !== id);
    setBoards(remaining);
    if (activeBoardId === id) handleSwitchBoard(remaining[0]);
  };

  const renameBoard = (id, newName) => {
    if (!newName.trim()) return;
    setBoards((prev) =>
      prev.map((b) => (b.id === id ? { ...b, name: newName.trim() } : b)),
    );
    setEditingBoardNameId(null);
  };

  const createFailover = (nodeId) => {
    const original = nodes.find((n) => n.id === nodeId);
    if (!original) return;

    let newY = original.y + original.h + 30;
    let overlap = true;
    while (overlap) {
      // eslint-disable-next-line no-loop-func
      overlap = nodes.some(
        (n) => Math.abs(n.x - original.x) < 10 && Math.abs(n.y - newY) < 10,
      );
      if (overlap) newY += original.h + 30;
    }

    const newNodeId = `n_${Date.now()}`;
    const newNode = {
      ...original,
      id: newNodeId,
      y: newY,
      text: original.text ? `${original.text}\n(Failover)` : "Failover",
      status: "standby",
      labels: [],
    };
    const newEdge = {
      id: `e_${Date.now()}_failover`,
      source: original.id,
      target: newNodeId,
      color: "slate",
      direction: "forward",
      flow: "default",
      sourcePort: "bottom",
      targetPort: "top",
      encrypted: false,
    };

    setNodes((prev) => [...prev, newNode]);
    setEdges((prev) => [...prev, newEdge]);
  };

  // --- HIGH FIDELITY EXPORT ENGINE ---
  const handleExport = async (format) => {
    if (!screenshotArea || isExporting) return;
    setIsExporting(true);

    try {
      const h2iUrl =
        "https://unpkg.com/html-to-image@1.11.11/dist/html-to-image.js";
      if (!window.htmlToImage) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = h2iUrl;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const uiElements = document.querySelectorAll(".no-capture");
      uiElements.forEach((el) => (el.style.opacity = "0"));

      const dataUrl = await window.htmlToImage.toPng(containerRef.current, {
        backgroundColor: theme.bgHex,
        pixelRatio: window.devicePixelRatio || 2,
      });

      uiElements.forEach((el) => (el.style.opacity = "1"));

      const img = new Image();
      img.src = dataUrl;
      await new Promise((r) => (img.onload = r));

      const scale = window.devicePixelRatio || 2;
      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = screenshotArea.w * scale;
      cropCanvas.height = screenshotArea.h * scale;
      const ctx = cropCanvas.getContext("2d");

      ctx.drawImage(
        img,
        screenshotArea.x * scale,
        screenshotArea.y * scale,
        screenshotArea.w * scale,
        screenshotArea.h * scale,
        0,
        0,
        cropCanvas.width,
        cropCanvas.height,
      );

      if (format === "copy") {
        try {
          const blob = await new Promise((resolve) =>
            cropCanvas.toBlob(resolve, "image/png"),
          );
          if (!blob) throw new Error("Canvas toBlob failed");

          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);
            alert("Image seamlessly copied to clipboard!");
            setScreenshotArea(null);
            setTool("pointer");
            setIsExporting(false);
          } else {
            throw new Error(
              "Clipboard API not fully available or insecure context",
            );
          }
        } catch (err) {
          console.warn(
            "Clipboard write error caught. Using fallback modal.",
            err,
          );
          setPreviewImage(cropCanvas.toDataURL("image/png"));
          setScreenshotArea(null);
          setTool("pointer");
          setIsExporting(false);
        }
      } else {
        const link = document.createElement("a");
        link.download = `architecture_${Date.now()}.png`;
        link.href = cropCanvas.toDataURL("image/png");
        link.click();
        setScreenshotArea(null);
        setTool("pointer");
        setIsExporting(false);
      }
    } catch (e) {
      console.error("Export failed:", e);
      alert("Failed to generate image. Please try again.");
      setScreenshotArea(null);
      setTool("pointer");
      setIsExporting(false);
      const uiElements = document.querySelectorAll(".no-capture");
      uiElements.forEach((el) => (el.style.opacity = "1"));
    }
  };

  // --- MATH HELPERS ---
  const getWorldPos = useCallback(
    (clientX, clientY) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      return {
        x: (clientX - rect.left - camera.x) / camera.z,
        y: (clientY - rect.top - camera.y) / camera.z,
      };
    },
    [camera],
  );

  const getConnectionPoint = (node, port, cx, cy, relPos) => {
    const hw = node.w / 2;
    const hh = node.h / 2;
    const center = { x: node.x + hw, y: node.y + hh };

    if (port === "custom" && relPos) {
      let nx = 0;
      let ny = 0;
      if (Math.abs(relPos.x) >= Math.abs(relPos.y)) nx = Math.sign(relPos.x);
      else ny = Math.sign(relPos.y);
      return {
        x: center.x + relPos.x * hw,
        y: center.y + relPos.y * hh,
        nx,
        ny,
      };
    }

    if (port === "top") return { x: center.x, y: node.y, nx: 0, ny: -1 };
    if (port === "bottom")
      return { x: center.x, y: node.y + node.h, nx: 0, ny: 1 };
    if (port === "left") return { x: node.x, y: center.y, nx: -1, ny: 0 };
    if (port === "right")
      return { x: node.x + node.w, y: center.y, nx: 1, ny: 0 };

    const dx = cx - center.x;
    const dy = cy - center.y;
    if (dx === 0 && dy === 0) return { x: center.x, y: center.y, nx: 0, ny: 0 };

    if (node.type === "circle") {
      const dist = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / dist;
      const ny = dy / dist;
      return {
        x: center.x + nx * (hw + 2),
        y: center.y + ny * (hh + 2),
        nx,
        ny,
      };
    } else if (node.type === "diamond") {
      const scale = 1 / (Math.abs(dx) / hw + Math.abs(dy) / hh);
      return {
        x: center.x + dx * scale,
        y: center.y + dy * scale,
        nx: dx > 0 ? 1 : -1,
        ny: dy > 0 ? 1 : -1,
      };
    } else if (node.type === "text") {
      return { x: center.x, y: center.y, nx: 0, ny: 0 };
    } else {
      const crossX = hw * dy;
      const crossY = hh * dx;
      let resX,
        resY,
        nx = 0,
        ny = 0;
      if (Math.abs(crossX) > Math.abs(crossY)) {
        resY = Math.sign(dy) * hh;
        resX = resY * (dx / dy);
        ny = Math.sign(dy);
      } else {
        resX = Math.sign(dx) * hw;
        resY = resX * (dy / dx);
        nx = Math.sign(dx);
      }
      return { x: center.x + resX, y: center.y + resY, nx, ny };
    }
  };

  const getEdgePathData = (source, target, edge, dragPortInfo) => {
    const sp = edge?.sourcePort || "auto";
    const tp = edge?.targetPort || "auto";

    let start = { x: 0, y: 0, nx: 0, ny: 0 };
    let end = { x: 0, y: 0, nx: 0, ny: 0 };

    if (dragPortInfo && dragPortInfo.edgeId === edge.id) {
      if (dragPortInfo.type === "source") {
        start = { x: dragPortInfo.x, y: dragPortInfo.y, nx: 0, ny: 0 };
        if (target)
          end = getConnectionPoint(
            target,
            tp,
            start.x,
            start.y,
            edge?.targetRel,
          );
      } else if (dragPortInfo.type === "target") {
        end = { x: dragPortInfo.x, y: dragPortInfo.y, nx: 0, ny: 0 };
        if (source)
          start = getConnectionPoint(source, sp, end.x, end.y, edge?.sourceRel);
      }
    } else {
      if (!source || !target) return null;
      start = getConnectionPoint(
        source,
        sp,
        target.x + target.w / 2,
        target.y + target.h / 2,
        edge?.sourceRel,
      );
      end = getConnectionPoint(
        target,
        tp,
        source.x + source.w / 2,
        source.y + source.h / 2,
        edge?.targetRel,
      );
    }

    if (!start || !end) return null;

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let pathD, midX, midY, cp1x, cp1y, cp2x, cp2y;

    if (edge && edge.cp && (!dragPortInfo || dragPortInfo.edgeId !== edge.id)) {
      midX = (start.x + end.x) / 2 + edge.cp.dx;
      midY = (start.y + end.y) / 2 + edge.cp.dy;
      pathD = `M ${start.x},${start.y} Q ${midX},${midY} ${end.x},${end.y}`;
      cp1x = midX;
      cp1y = midY;
      cp2x = midX;
      cp2y = midY;
    } else {
      let sNx = start.nx || 0;
      let sNy = start.ny || 0;
      let eNx = end.nx || 0;
      let eNy = end.ny || 0;

      if (sNx === 0 && sNy === 0 && eNx === 0 && eNy === 0) {
        sNx = dx / (dist || 1);
        sNy = dy / (dist || 1);
        eNx = -sNx;
        eNy = -sNy;
      } else if (sNx === 0 && sNy === 0) {
        sNx = -eNx;
        sNy = -eNy;
      } else if (eNx === 0 && eNy === 0) {
        eNx = -sNx;
        eNy = -sNy;
      }

      const offset = Math.min(dist * 0.4, 150);
      cp1x = start.x + sNx * offset;
      cp1y = start.y + sNy * offset;
      cp2x = end.x + eNx * offset;
      cp2y = end.y + eNy * offset;

      pathD = `M ${start.x},${start.y} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${end.x},${end.y}`;
      const b = cubicBezier(
        0.5,
        [start.x, start.y],
        [cp1x, cp1y],
        [cp2x, cp2y],
        [end.x, end.y],
      );
      midX = b.x;
      midY = b.y;
    }
    return { pathD, midX, midY, start, end, cp1x, cp1y, cp2x, cp2y };
  };

  const cubicBezier = (t, p0, p1, p2, p3) => {
    const u = 1 - t;
    return {
      x:
        u * u * u * p0[0] +
        3 * u * u * t * p1[0] +
        3 * u * t * t * p2[0] +
        t * t * t * p3[0],
      y:
        u * u * u * p0[1] +
        3 * u * u * t * p1[1] +
        3 * u * t * t * p2[1] +
        t * t * t * p3[1],
    };
  };

  const getZIndex = (node) => {
    if (node.zOffset) return 20 + node.zOffset;
    return node.w * node.h > 80000 ? 5 : 20;
  };

  // --- LASER POINTER ENGINE ---
  const startLaserRender = () => {
    if (laserRafRef.current) return;
    const render = () => {
      const now = Date.now();
      laserPointsRef.current = laserPointsRef.current.filter(
        (p) => now - p.time < 400,
      );

      if (
        laserPointsRef.current.length > 0 &&
        laserGroupRef.current &&
        laserCoreRef.current
      ) {
        const points = laserPointsRef.current;
        let glowHtml = "";
        let coreHtml = "";

        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          const age = now - p2.time;
          const life = Math.max(0, 1 - age / 400);
          const width = life * 12;
          const opacity = life;
          glowHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#ef4444" stroke-width="${width}" stroke-linecap="round" opacity="${opacity}" />`;
          coreHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#ffffff" stroke-width="${width * 0.3}" stroke-linecap="round" opacity="${opacity}" />`;
        }

        if (points.length > 0) {
          const head = points[points.length - 1];
          glowHtml += `<circle cx="${head.x}" cy="${head.y}" r="10" fill="#ef4444" opacity="0.8" />`;
          coreHtml += `<circle cx="${head.x}" cy="${head.y}" r="4" fill="#ffffff" />`;
        }

        laserGroupRef.current.innerHTML = glowHtml;
        laserCoreRef.current.innerHTML = coreHtml;
        laserRafRef.current = requestAnimationFrame(render);
      } else {
        if (laserGroupRef.current) laserGroupRef.current.innerHTML = "";
        if (laserCoreRef.current) laserCoreRef.current.innerHTML = "";
        laserRafRef.current = null;
      }
    };
    laserRafRef.current = requestAnimationFrame(render);
  };

  // --- EVENT HANDLERS ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleWheel = (e) => {
      e.preventDefault();
      const deltaY = e.deltaY;
      const deltaX = e.deltaX;
      const clientX = e.clientX;
      const clientY = e.clientY;
      if (e.ctrlKey || e.metaKey) {
        const zoomSensitivity = 0.002;
        setCamera((prev) => {
          let newZ = Math.max(
            0.05,
            Math.min(5, prev.z * Math.exp(-deltaY * zoomSensitivity)),
          );
          const rect = container.getBoundingClientRect();
          const mouseX = clientX - rect.left;
          const mouseY = clientY - rect.top;
          const worldX = (mouseX - prev.x) / prev.z;
          const worldY = (mouseY - prev.y) / prev.z;
          return {
            x: mouseX - worldX * newZ,
            y: mouseY - worldY * newZ,
            z: newZ,
          };
        });
      } else {
        setCamera((prev) => ({
          ...prev,
          x: prev.x - deltaX,
          y: prev.y - deltaY,
        }));
      }
    };
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      if (!containerRef.current) return;
      if (e.clientX === undefined || e.clientY === undefined) return;

      if (panInfo) {
        setCamera((prev) => ({
          ...prev,
          x: panInfo.startX + (e.clientX - panInfo.startMouseX),
          y: panInfo.startY + (e.clientY - panInfo.startMouseY),
        }));
        return;
      }

      const worldPos = getWorldPos(e.clientX, e.clientY);
      setMousePos(worldPos);

      if (tool === "laser") {
        laserPointsRef.current.push({
          x: worldPos.x,
          y: worldPos.y,
          time: Date.now(),
        });
        startLaserRender();
      }

      if (screenshotArea?.selecting) {
        const rect = containerRef.current.getBoundingClientRect();
        setScreenshotArea((prev) => ({
          ...prev,
          endX: e.clientX - rect.left,
          endY: e.clientY - rect.top,
        }));
      }

      if (interRef.current.drawingInfo) {
        const { id, startX, startY, type } = interRef.current.drawingInfo;
        if (type === "arrow") {
          const dx = worldPos.x - startX;
          const dy = worldPos.y - startY;
          const length = Math.max(20, Math.hypot(dx, dy));
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          setNodes((prev) =>
            prev.map((n) =>
              n.id === id
                ? {
                    ...n,
                    x: startX,
                    y: startY - 20,
                    w: length,
                    h: 40,
                    rotation: angle,
                  }
                : n,
            ),
          );
        } else {
          const newX = Math.min(startX, worldPos.x);
          const newY = Math.min(startY, worldPos.y);
          const newW = Math.abs(worldPos.x - startX);
          const newH = Math.abs(worldPos.y - startY);
          setNodes((prev) =>
            prev.map((n) =>
              n.id === id ? { ...n, x: newX, y: newY, w: newW, h: newH } : n,
            ),
          );
        }
      } else if (interRef.current.rotateInfo) {
        const { id, cx, cy } = interRef.current.rotateInfo;
        const dx = worldPos.x - cx;
        const dy = worldPos.y - cy;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const length = Math.max(20, Math.hypot(dx, dy));
        setNodes((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, rotation: angle, w: length } : n,
          ),
        );
      } else if (dragInfo) {
        const dx = worldPos.x - dragInfo.startMouseWorldX;
        const dy = worldPos.y - dragInfo.startMouseWorldY;
        setNodes((prev) =>
          prev.map((n) => {
            if (n.id === dragInfo.id)
              return { ...n, x: dragInfo.startX + dx, y: dragInfo.startY + dy };
            const childInfo = dragInfo.children.find((c) => c.id === n.id);
            if (childInfo)
              return {
                ...n,
                x: childInfo.startX + dx,
                y: childInfo.startY + dy,
              };
            return n;
          }),
        );
      } else if (dragPortInfo) {
        setDragPortInfo((prev) => ({ ...prev, x: worldPos.x, y: worldPos.y }));
      } else if (dragEdgeCpInfo) {
        setEdges((prev) =>
          prev.map((edge) => {
            if (edge.id === dragEdgeCpInfo.id) {
              const source = nodes.find((n) => n.id === edge.source);
              const target = nodes.find((n) => n.id === edge.target);
              if (source && target) {
                const start = getConnectionPoint(
                  source,
                  edge.sourcePort || "auto",
                  target.x + target.w / 2,
                  target.y + target.h / 2,
                  edge.sourceRel,
                );
                const end = getConnectionPoint(
                  target,
                  edge.targetPort || "auto",
                  source.x + source.w / 2,
                  source.y + source.h / 2,
                  edge.targetRel,
                );
                return {
                  ...edge,
                  cp: {
                    dx: worldPos.x - (start.x + end.x) / 2,
                    dy: worldPos.y - (start.y + end.y) / 2,
                  },
                };
              }
            }
            return edge;
          }),
        );
      } else if (dragLabelInfo) {
        const nodeElem = document.getElementById(
          `node_${dragLabelInfo.nodeId}`,
        );
        if (!nodeElem) return;
        const nodeRect = nodeElem.getBoundingClientRect();
        const scale = camera.z;
        setNodes((prev) =>
          prev.map((n) =>
            n.id === dragLabelInfo.nodeId
              ? {
                  ...n,
                  labels: n.labels.map((l) =>
                    l.id === dragLabelInfo.labelId
                      ? {
                          ...l,
                          x:
                            (e.clientX - nodeRect.left) / scale -
                            dragLabelInfo.offsetX,
                          y:
                            (e.clientY - nodeRect.top) / scale -
                            dragLabelInfo.offsetY,
                        }
                      : l,
                  ),
                }
              : n,
          ),
        );
      } else if (resizeInfo) {
        setNodes((prev) =>
          prev.map((n) => {
            if (n.id === resizeInfo.id) {
              let {
                startW,
                startH,
                startX,
                startY,
                startMouseX,
                startMouseY,
                dir,
              } = resizeInfo;
              let dx = worldPos.x - startMouseX;
              let dy = worldPos.y - startMouseY;
              let newW = startW;
              let newH = startH;
              let newX = startX;
              let newY = startY;

              if (dir.includes("e")) newW = startW + dx;
              if (dir.includes("w")) {
                newW = startW - dx;
                newX = startX + dx;
              }
              if (dir.includes("s")) newH = startH + dy;
              if (dir.includes("n")) {
                newH = startH - dy;
                newY = startY + dy;
              }

              const minSize = n.type === "text" ? 20 : 60;
              if (newW < minSize) {
                newX += newW - minSize;
                newW = minSize;
              }
              if (newH < minSize) {
                newY += newH - minSize;
                newH = minSize;
              }
              if (n.type === "circle") {
                const size = Math.max(newW, newH);
                newW = size;
                newH = size;
              }
              return { ...n, w: newW, h: newH, x: newX, y: newY };
            }
            return n;
          }),
        );
      }
    },
    [
      dragInfo,
      dragPortInfo,
      dragLabelInfo,
      dragEdgeCpInfo,
      resizeInfo,
      nodes,
      camera,
      panInfo,
      getWorldPos,
      tool,
      screenshotArea,
    ],
  );

  // ZERO-LAG POINTER UP using Refs to completely bypass async state batching
  const handlePointerUp = useCallback(
    (e) => {
      const inter = interRef.current;

      // Process drawing completion
      if (inter.drawingInfo) {
        setNodes((prev) =>
          prev.map((n) => {
            if (n.id === inter.drawingInfo.id) {
              let w = n.w;
              let h = n.h;
              if (inter.drawingInfo.type !== "arrow") {
                // Ensure shapes don't collapse to 0 if users just click instead of drag
                if (w < 20)
                  w =
                    inter.drawingInfo.type === "text"
                      ? 200
                      : inter.drawingInfo.type === "cloud"
                        ? 200
                        : 120;
                if (h < 20)
                  h =
                    inter.drawingInfo.type === "text"
                      ? 60
                      : inter.drawingInfo.type === "cloud"
                        ? 120
                        : 120;
                if (n.type === "circle") {
                  const size = Math.max(w, h);
                  w = size;
                  h = size;
                }
              }
              return { ...n, w, h };
            }
            return n;
          }),
        );
        setTool("pointer");
        setDrawingInfo(null);
        if (inter.drawingInfo.type === "text")
          setEditingNodeTextId(inter.drawingInfo.id);
      }

      if (inter.rotateInfo) {
        setRotateInfo(null);
      }

      // Process screenshot box completion
      if (inter.tool === "screenshot" && inter.screenshotArea?.selecting) {
        const area = inter.screenshotArea;
        const x = Math.min(area.startX, area.endX);
        const y = Math.min(area.startY, area.endY);
        const w = Math.abs(area.startX - area.endX);
        const h = Math.abs(area.startY - area.endY);

        if (w > 20 && h > 20) {
          setScreenshotArea({ ...area, x, y, w, h, selecting: false });
        } else {
          setScreenshotArea(null);
          setTool("pointer");
        }
      }

      if (e && e.clientX !== undefined) {
        const worldPos = getWorldPos(e.clientX, e.clientY);
        const { nodes: currentNodes, edges: currentEdges } = stateRef.current;

        // 1. Precise Re-linking edges securely
        if (inter.dragPortInfo) {
          const margin = 20;
          const hitNode = [...currentNodes]
            .sort((a, b) => getZIndex(b) - getZIndex(a))
            .find(
              (n) =>
                worldPos.x >= n.x - margin &&
                worldPos.x <= n.x + n.w + margin &&
                worldPos.y >= n.y - margin &&
                worldPos.y <= n.y + n.h + margin,
            );

          if (hitNode) {
            setEdges((prev) =>
              prev.map((edge) => {
                if (edge.id !== inter.dragPortInfo.edgeId) return edge;

                const center = {
                  x: hitNode.x + hitNode.w / 2,
                  y: hitNode.y + hitNode.h / 2,
                };
                const dx = worldPos.x - center.x;
                const dy = worldPos.y - center.y;
                let relX = dx / Math.max(1, hitNode.w / 2);
                let relY = dy / Math.max(1, hitNode.h / 2);

                if (Math.abs(relX) > Math.abs(relY)) {
                  relX = Math.sign(relX);
                  relY = Math.max(-1, Math.min(1, relY));
                } else {
                  relY = Math.sign(relY);
                  relX = Math.max(-1, Math.min(1, relX));
                }

                return inter.dragPortInfo.type === "source"
                  ? {
                      ...edge,
                      source: hitNode.id,
                      sourcePort: "custom",
                      sourceRel: { x: relX, y: relY },
                      cp: null,
                    }
                  : {
                      ...edge,
                      target: hitNode.id,
                      targetPort: "custom",
                      targetRel: { x: relX, y: relY },
                      cp: null,
                    };
              }),
            );
          } else {
            setEdges((prev) =>
              prev.filter((edge) => edge.id !== inter.dragPortInfo.edgeId),
            );
            setSelectedId(null);
          }
        }

        // 2. Advanced Node Hopping / Line Splitting
        if (inter.dragInfo && inter.dragInfo.id) {
          const draggedNode = currentNodes.find(
            (n) => n.id === inter.dragInfo.id,
          );

          if (
            draggedNode &&
            draggedNode.type !== "text" &&
            draggedNode.type !== "rect"
          ) {
            const dx = worldPos.x - inter.dragInfo.startMouseWorldX;
            const dy = worldPos.y - inter.dragInfo.startMouseWorldY;
            const nx = inter.dragInfo.startX + dx + draggedNode.w / 2;
            const ny = inter.dragInfo.startY + dy + draggedNode.h / 2;

            let edgeToSplit = null;
            for (let edge of currentEdges) {
              if (
                edge.source === draggedNode.id ||
                edge.target === draggedNode.id
              )
                continue;
              const sourceNode = currentNodes.find((n) => n.id === edge.source);
              const targetNode = currentNodes.find((n) => n.id === edge.target);
              if (!sourceNode || !targetNode) continue;

              const routing = getEdgePathData(
                sourceNode,
                targetNode,
                edge,
                null,
              );
              if (!routing) continue;

              let minD = Infinity;
              for (let t = 0; t <= 1; t += 0.05) {
                let pt = edge.cp
                  ? {
                      x:
                        (1 - t) ** 2 * routing.start.x +
                        2 * (1 - t) * t * routing.midX +
                        t ** 2 * routing.end.x,
                      y:
                        (1 - t) ** 2 * routing.start.y +
                        2 * (1 - t) * t * routing.midY +
                        t ** 2 * routing.end.y,
                    }
                  : cubicBezier(
                      t,
                      [routing.start.x, routing.start.y],
                      [routing.cp1x, routing.cp1y],
                      [routing.cp2x, routing.cp2y],
                      [routing.end.x, routing.end.y],
                    );
                const d = Math.sqrt((pt.x - nx) ** 2 + (pt.y - ny) ** 2);
                if (d < minD) minD = d;
              }
              if (minD < 60) {
                edgeToSplit = edge;
                break;
              }
            }

            if (edgeToSplit) {
              setEdges((prev) => {
                const filtered = prev.filter((e) => e.id !== edgeToSplit.id);
                const randSuffix1 = Math.random().toString(36).substr(2, 5);
                const randSuffix2 = Math.random().toString(36).substr(2, 5);
                const newEdge1 = {
                  id: `e_${Date.now()}_${randSuffix1}`,
                  source: edgeToSplit.source,
                  target: draggedNode.id,
                  color: edgeToSplit.color,
                  direction: edgeToSplit.direction,
                  flow: edgeToSplit.flow,
                  sourcePort: edgeToSplit.sourcePort || "auto",
                  sourceRel: edgeToSplit.sourceRel,
                  targetPort: "auto",
                  targetRel: null,
                  encrypted: edgeToSplit.encrypted,
                };
                const newEdge2 = {
                  id: `e_${Date.now()}_${randSuffix2}`,
                  source: draggedNode.id,
                  target: edgeToSplit.target,
                  color: edgeToSplit.color,
                  direction: edgeToSplit.direction,
                  flow: edgeToSplit.flow,
                  sourcePort: "auto",
                  sourceRel: null,
                  targetPort: edgeToSplit.targetPort || "auto",
                  targetRel: edgeToSplit.targetRel,
                  encrypted: edgeToSplit.encrypted,
                };
                return [...filtered, newEdge1, newEdge2];
              });
            }
          }
        }
      }

      setDragInfo(null);
      setDragPortInfo(null);
      setDragLabelInfo(null);
      setDragEdgeCpInfo(null);
      setResizeInfo(null);
      setPanInfo(null);
    },
    [getWorldPos],
  );

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (editingLabel || editingNodeTextId || editingBoardNameId) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedLabel) {
          setNodes((prev) =>
            prev.map((n) =>
              n.id === selectedLabel.nodeId
                ? {
                    ...n,
                    labels: n.labels.filter(
                      (l) => l.id !== selectedLabel.labelId,
                    ),
                  }
                : n,
            ),
          );
          setSelectedLabel(null);
        } else if (selectedId) {
          if (selectedId.startsWith("n_")) {
            setNodes((prev) => prev.filter((n) => n.id !== selectedId));
            setEdges((prev) =>
              prev.filter(
                (edge) =>
                  edge.source !== selectedId && edge.target !== selectedId,
              ),
            );
          } else
            setEdges((prev) => prev.filter((edge) => edge.id !== selectedId));
          setSelectedId(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedId,
    selectedLabel,
    editingLabel,
    editingNodeTextId,
    editingBoardNameId,
  ]);

  const handleCanvasPointerDown = (e) => {
    if (e.target.closest(".no-canvas-click") || e.target.closest(".no-capture"))
      return;
    if (e.button === 1 || tool === "pan") {
      setPanInfo({
        startX: camera.x,
        startY: camera.y,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
      });
      return;
    }

    if (tool === "screenshot") {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setScreenshotArea({
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        selecting: true,
      });
      return;
    }

    setEditingLabel(null);
    setEditingNodeTextId(null);
    setSelectedLabel(null);
    setSelectedId(null);
    setLinkStartNode(null);
    setSidebarOpen(false);
    setScreenshotArea(null);

    if (tool !== "pointer" && tool !== "link" && tool !== "laser") {
      const worldPos = getWorldPos(e.clientX, e.clientY);

      // Initialize the drawing node with 0 size
      const newNode = {
        id: `n_${Date.now()}`,
        type: tool,
        x: worldPos.x,
        y: worldPos.y,
        w: 0,
        h: 0,
        color: activeColor,
        zOffset: 0,
        text:
          tool === "text" || tool === "arrow"
            ? ""
            : SYSTEM_ICONS[tool] || tool === "cloud"
              ? tool.toUpperCase()
              : "Shape",
        size: tool === "text" ? 16 : 14,
        bold: tool !== "text",
        status: "healthy",
        labels: [],
        rotation: 0,
      };

      setNodes((prev) => [...prev, newNode]);
      setSelectedId(newNode.id);
      setDrawingInfo({
        id: newNode.id,
        startX: worldPos.x,
        startY: worldPos.y,
        type: tool,
      });
    }
  };

  const handleNodePointerDown = (e, node) => {
    // Allows drawing tools to pierce through nodes and draw directly on the canvas!
    if (tool !== "pointer" && tool !== "link") return;

    if (
      editingNodeTextId === node.id ||
      editingLabel ||
      tool === "pan" ||
      tool === "screenshot" ||
      e.button === 1
    )
      return;
    e.stopPropagation();
    setSelectedId(node.id);
    setSelectedLabel(null);
    setEditingLabel(null);
    setEditingNodeTextId(null);
    setSidebarOpen(false);
    setScreenshotArea(null);

    if (tool === "pointer") {
      const worldPos = getWorldPos(e.clientX, e.clientY);
      const childrenInside = nodes
        .filter(
          (n) =>
            n.id !== node.id &&
            n.zOffset >= node.zOffset &&
            n.x >= node.x &&
            n.y >= node.y &&
            n.x + n.w <= node.x + node.w &&
            n.y + n.h <= node.y + node.h,
        )
        .map((c) => ({ id: c.id, startX: c.x, startY: c.y }));
      setDragInfo({
        id: node.id,
        startX: node.x,
        startY: node.y,
        startMouseWorldX: worldPos.x,
        startMouseWorldY: worldPos.y,
        children: childrenInside,
      });
    } else if (tool === "link") {
      if (!linkStartNode) setLinkStartNode(node.id);
      else if (linkStartNode !== node.id) {
        setEdges((prev) => [
          ...prev,
          {
            id: `e_${Date.now()}`,
            source: linkStartNode,
            target: node.id,
            color: activeColor,
            direction: "forward",
            flow: "default",
            sourcePort: "auto",
            targetPort: "auto",
          },
        ]);
        setLinkStartNode(null);
        setTool("pointer");
      }
    }
  };

  const handleNodeDoubleClick = (e, node) => {
    if (tool !== "pointer" || node.type === "text") return;
    e.stopPropagation();
    const nodeRect = e.currentTarget.getBoundingClientRect();
    const scale = camera.z;
    const newLabel = {
      id: `l_${Date.now()}`,
      text: "",
      x: (e.clientX - nodeRect.left) / scale,
      y: (e.clientY - nodeRect.top) / scale,
      color: activeColor,
      bold: true,
      size: 14,
    };
    setNodes((prev) =>
      prev.map((n) =>
        n.id === node.id
          ? { ...n, labels: [...(n.labels || []), newLabel] }
          : n,
      ),
    );
    setSelectedId(node.id);
    setSelectedLabel({ nodeId: node.id, labelId: newLabel.id });
    setEditingLabel({ nodeId: node.id, labelId: newLabel.id });
  };

  const handleLabelPointerDown = (e, node, label) => {
    if (tool !== "pointer") return;
    e.stopPropagation();
    setSelectedId(node.id);
    setSelectedLabel({ nodeId: node.id, labelId: label.id });
    setEditingNodeTextId(null);
    if (editingLabel?.labelId !== label.id) {
      const rect = e.currentTarget.getBoundingClientRect();
      const scale = camera.z;
      setDragLabelInfo({
        nodeId: node.id,
        labelId: label.id,
        offsetX: (e.clientX - (rect.left + rect.width / 2)) / scale,
        offsetY: (e.clientY - (rect.top + rect.height / 2)) / scale,
      });
    }
  };

  const updateSelectedColor = (colorName) => {
    setActiveColor(colorName);
    if (selectedLabel)
      setNodes((prev) =>
        prev.map((n) =>
          n.id === selectedLabel.nodeId
            ? {
                ...n,
                labels: n.labels.map((l) =>
                  l.id === selectedLabel.labelId
                    ? { ...l, color: colorName }
                    : l,
                ),
              }
            : n,
        ),
      );
    else if (selectedId) {
      if (selectedId.startsWith("n_"))
        setNodes((prev) =>
          prev.map((n) =>
            n.id === selectedId ? { ...n, color: colorName } : n,
          ),
        );
      else if (selectedId.startsWith("e_"))
        setEdges((prev) =>
          prev.map((e) =>
            e.id === selectedId ? { ...e, color: colorName } : e,
          ),
        );
    }
  };

  let edgeMenuPos = null;
  let nodeMenuPos = null;

  return (
    <div
      className={`w-full h-screen font-sans overflow-hidden flex flex-col relative select-none transition-colors duration-500 ${theme.bgClass} ${COLORS[activeColor].text}`}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes dash { to { stroke-dashoffset: -120; } }
        @keyframes fast-dash { to { stroke-dashoffset: -40; } }
        @keyframes glitch { 0% { transform: translate(0) } 20% { transform: translate(-2px, 2px) } 40% { transform: translate(-2px, -2px) } 60% { transform: translate(2px, 2px) } 80% { transform: translate(2px, -2px) } 100% { transform: translate(0) } }
        .status-down { animation: glitch 0.3s infinite; filter: grayscale(1) sepia(1) hue-rotate(-50deg) saturate(3) brightness(0.6); }
        .status-standby { opacity: 0.6; filter: grayscale(0.6); }
        .status-standby > div { border-style: dashed !important; border-width: 2px; }
      `,
        }}
      />

      {/* --- MULTI-BOARD SIDEBAR UI --- */}
      <div className="absolute top-6 left-6 z-[999999] no-capture no-canvas-click">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-700 px-4 py-2 rounded-xl shadow-2xl hover:bg-slate-800 transition-colors text-slate-200 font-bold"
        >
          <FolderOpen size={18} className="text-indigo-400" />
          {activeBoard?.name || "My Diagrams"}
        </button>

        {sidebarOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-black/20">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Saved Files (Local)
              </span>
              <button
                onClick={() => createNewBoard()}
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
                title="New Diagram"
              >
                <PlusCircle size={18} />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {boards.map((board) => (
                <div
                  key={board.id}
                  className={`group flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${activeBoardId === board.id ? "bg-indigo-900/30 border-l-2 border-indigo-500" : "hover:bg-slate-800 border-l-2 border-transparent"}`}
                  onClick={() => handleSwitchBoard(board)}
                >
                  {editingBoardNameId === board.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        autoFocus
                        type="text"
                        defaultValue={board.name}
                        onBlur={(e) => renameBoard(board.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            renameBoard(board.id, e.currentTarget.value);
                        }}
                        className="w-full bg-black/50 border border-slate-600 rounded px-2 py-1 text-sm text-white outline-none focus:border-indigo-500"
                      />
                      <Check
                        size={16}
                        className="text-emerald-400 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          renameBoard(
                            board.id,
                            e.currentTarget.previousSibling.value,
                          );
                        }}
                      />
                    </div>
                  ) : (
                    <>
                      <span
                        className={`text-sm truncate ${activeBoardId === board.id ? "text-white font-bold" : "text-slate-300"}`}
                      >
                        {board.name}
                      </span>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingBoardNameId(board.id);
                          }}
                          className="text-slate-400 hover:text-white"
                        >
                          <Edit2 size={14} />
                        </button>
                        {boards.length > 1 && (
                          <button
                            onClick={(e) => deleteBoard(board.id, e)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className={`flex-1 relative overflow-hidden ${tool === "pan" || panInfo ? "cursor-grab active:cursor-grabbing" : tool === "screenshot" ? "cursor-crosshair" : tool === "pointer" ? "cursor-default" : "cursor-crosshair"}`}
        onPointerDown={handleCanvasPointerDown}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.15]"
          style={{
            backgroundImage: `linear-gradient(to right, ${theme.gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${theme.gridColor} 1px, transparent 1px)`,
            backgroundSize: `${40 * camera.z}px ${40 * camera.z}px`,
            backgroundPosition: `${camera.x}px ${camera.y}px`,
            transition: "background-color 0.5s ease",
          }}
        />
        <div
          className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] ${theme.glow1} blur-[150px] rounded-full pointer-events-none transition-colors duration-1000`}
        />
        <div
          className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] ${theme.glow2} blur-[150px] rounded-full pointer-events-none transition-colors duration-1000`}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.z})`,
            transformOrigin: "0 0",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            className="absolute inset-0 overflow-visible pointer-events-none"
            style={{ zIndex: 10 }}
          >
            <defs>
              {Object.values(COLORS).map((c) => (
                <filter
                  key={`glow-${c.name}`}
                  id={`glow-${c.name}`}
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
              {Object.values(COLORS).map((c) => (
                <marker
                  key={`arrow-${c.name}`}
                  id={`arrow-${c.name}`}
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill={c.hex} />
                </marker>
              ))}
            </defs>

            {edges.map((edge) => {
              const source = nodes.find((n) => n.id === edge.source);
              const target = nodes.find((n) => n.id === edge.target);

              if (
                !source &&
                !(
                  dragPortInfo?.edgeId === edge.id &&
                  dragPortInfo?.type === "source"
                )
              )
                return null;
              if (
                !target &&
                !(
                  dragPortInfo?.edgeId === edge.id &&
                  dragPortInfo?.type === "target"
                )
              )
                return null;

              const routing = getEdgePathData(
                source,
                target,
                edge,
                dragPortInfo,
              );
              if (!routing) return null;

              const { pathD, midX, midY, start, end } = routing;
              const themeColor = COLORS[edge.color];
              const isSelected = selectedId === edge.id;
              const pathId = `path-${edge.id}`;
              const flowType = edge.flow || "default";
              const isEncrypted = edge.encrypted;
              const isThrottled = target?.status === "throttled";

              if (
                isSelected &&
                !dragPortInfo &&
                !dragEdgeCpInfo &&
                !isNaN(midX) &&
                !isNaN(midY)
              ) {
                edgeMenuPos = {
                  x: midX * camera.z + camera.x,
                  y: midY * camera.z + camera.y,
                  edge,
                };
              }

              const dur = isThrottled ? "6s" : "3s";
              const fwdKP = isThrottled ? "0;0.8;0.95;1" : "0;1";
              const fwdKT = isThrottled ? "0;0.3;0.7;1" : "0;1";
              const revKP = isThrottled ? "1;0.2;0.05;0" : "1;0";
              const revKT = isThrottled ? "0;0.3;0.7;1" : "0;1";

              const restFwdKP = isThrottled ? "0;0.8;0.95;1;1" : "0;1;1";
              const restFwdKT = isThrottled ? "0;0.15;0.35;0.49;1" : "0;0.49;1";
              const restRevKP = isThrottled ? "1;1;0.95;0.8;0" : "1;1;0";
              const restRevKT = isThrottled ? "0;0.51;0.65;0.85;1" : "0;0.51;1";

              return (
                <g key={edge.id}>
                  {/* Invisible Hit Area */}
                  <path
                    d={pathD}
                    stroke="transparent"
                    strokeWidth="25"
                    fill="none"
                    className="pointer-events-auto cursor-pointer"
                    onPointerDown={(e) => {
                      if (tool !== "pointer") return;
                      e.stopPropagation();
                      setSelectedId(edge.id);
                      setEditingLabel(null);
                      setSelectedLabel(null);
                      setEditingNodeTextId(null);
                      setSidebarOpen(false);
                    }}
                  />

                  {/* Encrypted Tunnel Backdrops */}
                  {isEncrypted && (
                    <path
                      d={pathD}
                      stroke={themeColor.hex}
                      strokeWidth="16"
                      fill="none"
                      opacity="0.15"
                      strokeLinecap="round"
                      className="drop-shadow-2xl"
                    />
                  )}
                  {isEncrypted && (
                    <path
                      d={pathD}
                      stroke={themeColor.hex}
                      strokeWidth="2"
                      fill="none"
                      opacity="0.5"
                      strokeDasharray="4 4"
                      className="animate-[dash_5s_linear_infinite]"
                    />
                  )}

                  {/* Standard Base Line */}
                  <path
                    id={pathId}
                    d={pathD}
                    stroke={
                      flowType === "dropped" ? COLORS.red.hex : themeColor.hex
                    }
                    fill="none"
                    strokeWidth={isSelected ? "3" : "2"}
                    opacity={isSelected ? "0.9" : "0.4"}
                    strokeDasharray={
                      flowType === "beam" || isEncrypted ? "none" : "6 6"
                    }
                    className={
                      isSelected && flowType !== "beam" && !isEncrypted
                        ? "animate-[dash_10s_linear_infinite]"
                        : ""
                    }
                    markerEnd={
                      (edge.direction === "forward" ||
                        edge.direction === "both") &&
                      !isEncrypted
                        ? `url(#arrow-${flowType === "dropped" ? "red" : themeColor.name})`
                        : undefined
                    }
                    markerStart={
                      (edge.direction === "reverse" ||
                        edge.direction === "both") &&
                      !isEncrypted
                        ? `url(#arrow-${flowType === "dropped" ? "red" : themeColor.name})`
                        : undefined
                    }
                  />

                  {/* --- FLOW TYPES --- */}
                  {flowType === "beam" && (
                    <path
                      d={pathD}
                      stroke={themeColor.hex}
                      fill="none"
                      strokeWidth="4"
                      filter={`url(#glow-${themeColor.name})`}
                      strokeDasharray="15 15"
                      className="animate-[fast-dash_0.5s_linear_infinite]"
                    />
                  )}

                  {flowType === "default" && (
                    <>
                      {(edge.direction === "forward" ||
                        edge.direction === "both") &&
                        [0, 1.2, 2.4].map((delay, i) => (
                          <circle
                            key={`fwd-${i}`}
                            r="3.5"
                            fill={themeColor.hex}
                            filter={`url(#glow-${themeColor.name})`}
                          >
                            <animateMotion
                              dur={dur}
                              begin={`${delay}s`}
                              repeatCount="indefinite"
                              keyPoints={fwdKP}
                              keyTimes={fwdKT}
                              calcMode="linear"
                            >
                              <mpath href={`#${pathId}`} />
                            </animateMotion>
                          </circle>
                        ))}
                      {(edge.direction === "reverse" ||
                        edge.direction === "both") &&
                        [0.6, 1.8, 3.0].map((delay, i) => (
                          <circle
                            key={`rev-${i}`}
                            r="3.5"
                            fill={themeColor.hex}
                            filter={`url(#glow-${themeColor.name})`}
                          >
                            <animateMotion
                              dur={dur}
                              begin={`${delay}s`}
                              repeatCount="indefinite"
                              keyPoints={revKP}
                              keyTimes={revKT}
                              calcMode="linear"
                            >
                              <mpath href={`#${pathId}`} />
                            </animateMotion>
                          </circle>
                        ))}
                    </>
                  )}

                  {flowType === "rest" && (
                    <>
                      <circle
                        r="4.5"
                        fill={themeColor.hex}
                        filter={`url(#glow-${themeColor.name})`}
                      >
                        <animateMotion
                          dur={dur}
                          begin="0s"
                          repeatCount="indefinite"
                          keyPoints={restFwdKP}
                          keyTimes={restFwdKT}
                          calcMode="linear"
                        >
                          <mpath href={`#${pathId}`} />
                        </animateMotion>
                        <animate
                          attributeName="opacity"
                          values="1;1;0;0"
                          keyTimes="0;0.48;0.49;1"
                          dur={dur}
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle r="4.5" fill="#fbbf24" filter="url(#glow-amber)">
                        <animateMotion
                          dur={dur}
                          begin="0s"
                          repeatCount="indefinite"
                          keyPoints={restRevKP}
                          keyTimes={restRevKT}
                          calcMode="linear"
                        >
                          <mpath href={`#${pathId}`} />
                        </animateMotion>
                        <animate
                          attributeName="opacity"
                          values="0;0;1;1"
                          keyTimes="0;0.5;0.51;1"
                          dur={dur}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </>
                  )}

                  {flowType === "grpc" && (
                    <>
                      {[0, 0.4, 0.8, 1.2, 1.6, 2.0].map((delay, i) => (
                        <circle
                          key={`g-fwd-${i}`}
                          r="2.5"
                          fill={themeColor.hex}
                          filter={`url(#glow-${themeColor.name})`}
                        >
                          <animateMotion
                            dur="2.5s"
                            begin={`${delay}s`}
                            repeatCount="indefinite"
                            keyPoints="0;1"
                            keyTimes="0;1"
                            calcMode="linear"
                          >
                            <mpath href={`#${pathId}`} />
                          </animateMotion>
                        </circle>
                      ))}
                      {[0.2, 0.6, 1.0, 1.4, 1.8, 2.2].map((delay, i) => (
                        <circle
                          key={`g-rev-${i}`}
                          r="2.5"
                          fill="#f472b6"
                          filter="url(#glow-red)"
                        >
                          <animateMotion
                            dur="2.5s"
                            begin={`${delay}s`}
                            repeatCount="indefinite"
                            keyPoints="1;0"
                            keyTimes="0;1"
                            calcMode="linear"
                          >
                            <mpath href={`#${pathId}`} />
                          </animateMotion>
                        </circle>
                      ))}
                    </>
                  )}

                  {flowType === "websocket" && (
                    <>
                      {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((delay, i) => (
                        <circle
                          key={`ws-fwd-${i}`}
                          r="3"
                          fill={themeColor.hex}
                          filter={`url(#glow-${themeColor.name})`}
                        >
                          <animateMotion
                            dur="1.2s"
                            begin={`${delay}s`}
                            repeatCount="indefinite"
                            keyPoints="0;1"
                            keyTimes="0;1"
                            calcMode="linear"
                          >
                            <mpath href={`#${pathId}`} />
                          </animateMotion>
                        </circle>
                      ))}
                      {[0.1, 0.3, 0.5, 0.7, 0.9, 1.1].map((delay, i) => (
                        <circle
                          key={`ws-rev-${i}`}
                          r="3"
                          fill="#34d399"
                          filter="url(#glow-emerald)"
                        >
                          <animateMotion
                            dur="1.2s"
                            begin={`${delay}s`}
                            repeatCount="indefinite"
                            keyPoints="1;0"
                            keyTimes="0;1"
                            calcMode="linear"
                          >
                            <mpath href={`#${pathId}`} />
                          </animateMotion>
                        </circle>
                      ))}
                    </>
                  )}

                  {flowType === "pubsub" && (
                    <>
                      {[0, 0.1, 0.2].map((offset, i) => (
                        <circle
                          key={`ps-${i}`}
                          r={5 - i}
                          fill={themeColor.hex}
                          filter={`url(#glow-${themeColor.name})`}
                        >
                          <animateMotion
                            dur={dur}
                            begin={`${offset}s`}
                            repeatCount="indefinite"
                            keyPoints={fwdKP}
                            keyTimes={fwdKT}
                            calcMode="spline"
                            keySplines="0.1 0.8 0.3 1"
                          >
                            <mpath href={`#${pathId}`} />
                          </animateMotion>
                          <animate
                            attributeName="opacity"
                            values="1;0"
                            keyTimes="0;1"
                            dur={dur}
                            begin={`${offset}s`}
                            repeatCount="indefinite"
                          />
                        </circle>
                      ))}
                    </>
                  )}

                  {flowType === "dropped" && (
                    <>
                      {(edge.direction === "forward" ||
                        edge.direction === "both") &&
                        [0, 1.2, 2.4].map((delay, i) => (
                          <circle
                            key={`fwd-${i}`}
                            r="4"
                            fill={COLORS.red.hex}
                            filter="url(#glow-red)"
                          >
                            <animate
                              attributeName="opacity"
                              values="1;1;0;0"
                              keyTimes="0;0.4;0.5;1"
                              dur="3s"
                              begin={`${delay}s`}
                              repeatCount="indefinite"
                            />
                            <animateMotion
                              dur="3s"
                              begin={`${delay}s`}
                              repeatCount="indefinite"
                              keyPoints="0;1"
                              keyTimes="0;1"
                              calcMode="linear"
                            >
                              <mpath href={`#${pathId}`} />
                            </animateMotion>
                          </circle>
                        ))}
                    </>
                  )}

                  {/* Draggable Anchors */}
                  {isSelected && (
                    <>
                      <circle
                        cx={safeVal(midX)}
                        cy={safeVal(midY)}
                        r="8"
                        fill={themeColor.hex}
                        stroke="rgba(255,255,255,0.9)"
                        strokeWidth="2"
                        className="pointer-events-none drop-shadow-lg"
                      />
                      <circle
                        cx={safeVal(midX)}
                        cy={safeVal(midY)}
                        r="20"
                        fill="transparent"
                        className="pointer-events-auto cursor-move"
                        onPointerDown={(e) => {
                          if (tool !== "pointer") return;
                          e.stopPropagation();
                          setDragEdgeCpInfo({ id: edge.id });
                        }}
                      />

                      <circle
                        cx={safeVal(start.x)}
                        cy={safeVal(start.y)}
                        r="8"
                        fill={themeColor.hex}
                        stroke="rgba(255,255,255,0.9)"
                        strokeWidth="2"
                        className="pointer-events-none shadow-lg"
                      />
                      <circle
                        cx={safeVal(start.x)}
                        cy={safeVal(start.y)}
                        r="24"
                        fill="transparent"
                        className="pointer-events-auto cursor-crosshair"
                        onPointerDown={(e) => {
                          if (tool !== "pointer") return;
                          e.stopPropagation();
                          setDragPortInfo({
                            edgeId: edge.id,
                            type: "source",
                            x: start.x,
                            y: start.y,
                          });
                        }}
                      />

                      <circle
                        cx={safeVal(end.x)}
                        cy={safeVal(end.y)}
                        r="8"
                        fill={themeColor.hex}
                        stroke="rgba(255,255,255,0.9)"
                        strokeWidth="2"
                        className="pointer-events-none shadow-lg"
                      />
                      <circle
                        cx={safeVal(end.x)}
                        cy={safeVal(end.y)}
                        r="24"
                        fill="transparent"
                        className="pointer-events-auto cursor-crosshair"
                        onPointerDown={(e) => {
                          if (tool !== "pointer") return;
                          e.stopPropagation();
                          setDragPortInfo({
                            edgeId: edge.id,
                            type: "target",
                            x: end.x,
                            y: end.y,
                          });
                        }}
                      />
                    </>
                  )}
                </g>
              );
            })}

            {tool === "link" &&
              linkStartNode &&
              (() => {
                const start = nodes.find((n) => n.id === linkStartNode);
                if (!start) return null;
                return (
                  <path
                    d={`M ${start.x + start.w / 2},${start.y + start.h / 2} L ${mousePos.x},${mousePos.y}`}
                    stroke={COLORS[activeColor].hex}
                    strokeWidth="2"
                    strokeDasharray="5 5"
                    fill="none"
                    className="animate-pulse"
                  />
                );
              })()}
          </svg>

          {/* --- HTML NODES LAYER --- */}
          <div className="absolute inset-0 overflow-visible pointer-events-none">
            {nodes.map((node) => {
              const themeColor = COLORS[node.color];
              const isSelected = selectedId === node.id;
              const isTextNode = node.type === "text";
              const isCloudNode = node.type === "cloud";
              const isArrowNode = node.type === "arrow";
              const isEditingNodeText = editingNodeTextId === node.id;
              const isLinkingTarget =
                tool === "link" && linkStartNode && linkStartNode !== node.id;
              const SysIcon = SYSTEM_ICONS[node.type];
              const zIndex = getZIndex(node);

              // Calculate safe values
              const safeX = safeVal(node.x);
              const safeY = safeVal(node.y);
              const safeW = safeVal(node.w, 120);
              const safeH = isTextNode ? "auto" : safeVal(node.h, 120);

              if (
                isSelected &&
                !selectedLabel &&
                !isEditingNodeText &&
                !isNaN(node.x) &&
                !isNaN(node.y)
              ) {
                if (isArrowNode) {
                  nodeMenuPos = {
                    x: safeX * camera.z + camera.x,
                    y: safeY * camera.z + camera.y - 30,
                    node,
                  };
                } else {
                  nodeMenuPos = {
                    x: (safeX + safeW / 2) * camera.z + camera.x,
                    y: safeY * camera.z + camera.y,
                    node,
                  };
                }
              }

              let shapeClasses = `absolute flex flex-col items-center justify-center transition-all duration-200 ease-out pointer-events-auto `;
              let innerStyles = {
                backgroundColor: themeColor.bg,
                transform: node.rotation
                  ? `rotate(${node.rotation}deg)`
                  : undefined,
                transformOrigin: isArrowNode ? "0% 50%" : "50% 50%",
              };

              if (node.status === "down") shapeClasses += " status-down ";
              if (node.status === "standby") shapeClasses += " status-standby ";

              if (isCloudNode || isArrowNode) {
                shapeClasses += `backdrop-blur-none bg-transparent ${isSelected ? "drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]" : "drop-shadow-lg"}`;
                innerStyles.backgroundColor = "transparent";
              } else if (node.type === "rect" || SysIcon) {
                shapeClasses += `backdrop-blur-md rounded-2xl border-2 ${isSelected ? "shadow-[0_0_40px_rgba(255,255,255,0.15)] ring-2 ring-white/20" : "shadow-lg"}`;
                innerStyles.borderColor = themeColor.hex;
                if (isSelected)
                  innerStyles.boxShadow = `0 0 25px ${themeColor.hex}50`;
                if (node.status === "throttled")
                  innerStyles.boxShadow += `, 0 0 30px rgba(245, 158, 11, 0.4) inset`;
              } else if (node.type === "circle") {
                shapeClasses += `backdrop-blur-md rounded-full border-2 ${isSelected ? "shadow-[0_0_40px_rgba(255,255,255,0.15)] ring-2 ring-white/20" : "shadow-lg"}`;
                innerStyles.borderColor = themeColor.hex;
                if (isSelected)
                  innerStyles.boxShadow = `0 0 25px ${themeColor.hex}50`;
                if (node.status === "throttled")
                  innerStyles.boxShadow += `, 0 0 30px rgba(245, 158, 11, 0.4) inset`;
              } else if (node.type === "diamond") {
                shapeClasses += `backdrop-blur-md ${isSelected ? "drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" : "drop-shadow-lg"}`;
                innerStyles.clipPath =
                  "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
              }

              if (isTextNode) {
                shapeClasses = `absolute flex items-center justify-start pointer-events-auto bg-transparent ${isSelected && !isEditingNodeText ? "ring-1 ring-dashed ring-slate-400/50 hover:bg-white/5 rounded-lg" : ""}`;
                innerStyles.backgroundColor = "transparent";
              }

              if (isLinkingTarget)
                shapeClasses +=
                  " ring-4 ring-white/50 scale-[1.02] cursor-pointer";
              else if (tool === "pointer")
                shapeClasses +=
                  dragInfo?.id === node.id
                    ? " cursor-grabbing opacity-90"
                    : " cursor-grab";

              return (
                <div
                  id={`node_${node.id}`}
                  key={node.id}
                  className={shapeClasses}
                  style={{
                    left: safeX,
                    top: safeY,
                    width: safeW,
                    height: safeH,
                    minHeight: isTextNode ? safeVal(node.h, 40) : undefined,
                    ...innerStyles,
                    zIndex: dragInfo?.id === node.id ? 9999 : zIndex,
                  }}
                  onPointerDown={(e) => handleNodePointerDown(e, node)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (tool !== "pointer" || isTextNode) return;
                    const nodeRect = e.currentTarget.getBoundingClientRect();
                    const scale = camera.z;
                    const newLabel = {
                      id: `l_${Date.now()}`,
                      text: "",
                      x: (e.clientX - nodeRect.left) / scale,
                      y: (e.clientY - nodeRect.top) / scale,
                      color: activeColor,
                      bold: true,
                      size: 14,
                    };
                    setNodes((prev) =>
                      prev.map((n) =>
                        n.id === node.id
                          ? { ...n, labels: [...(n.labels || []), newLabel] }
                          : n,
                      ),
                    );
                    setSelectedId(node.id);
                    setSelectedLabel({ nodeId: node.id, labelId: newLabel.id });
                    setEditingLabel({ nodeId: node.id, labelId: newLabel.id });
                  }}
                >
                  {node.type === "diamond" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute inset-0 w-full h-full pointer-events-none"
                    >
                      <polygon
                        points={`${safeW / 2},2 ${safeW - 2},${safeVal(node.h, 120) / 2} ${safeW / 2},${safeVal(node.h, 120) - 2} 2,${safeVal(node.h, 120) / 2}`}
                        fill="none"
                        stroke={themeColor.hex}
                        strokeWidth={isSelected ? "4" : "2"}
                        opacity={isSelected ? "1" : "0.7"}
                      />
                    </svg>
                  )}

                  {node.type === "cloud" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      viewBox="5 10 100 65"
                      preserveAspectRatio="none"
                    >
                      <path
                        vectorEffect="non-scaling-stroke"
                        d="M 25,75 C 10,75 5,55 20,45 C 20,25 45,15 60,30 C 75,10 95,25 90,45 C 105,55 95,75 80,75 Z"
                        fill={themeColor.bg}
                        stroke={themeColor.hex}
                        strokeWidth={isSelected ? "3" : "2"}
                        opacity={isSelected ? "1" : "0.8"}
                      />
                    </svg>
                  )}

                  {node.type === "arrow" && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      style={{ overflow: "visible" }}
                    >
                      <defs>
                        <marker
                          id={`arrowhead-${node.id}`}
                          viewBox="0 0 10 10"
                          refX="8"
                          refY="5"
                          markerWidth="6"
                          markerHeight="6"
                          orient="auto-start-reverse"
                        >
                          <path
                            d="M 0 1 L 10 5 L 0 9 z"
                            fill={themeColor.hex}
                          />
                        </marker>
                      </defs>
                      <line
                        x1="0"
                        y1="50%"
                        x2="100%"
                        y2="50%"
                        stroke={themeColor.hex}
                        strokeWidth={isSelected ? "4" : "2"}
                        markerEnd={`url(#arrowhead-${node.id})`}
                        strokeDasharray={
                          node.status === "standby" ? "6 6" : "none"
                        }
                      />
                    </svg>
                  )}

                  {node.type === "queue" && (
                    <div className="absolute inset-0 flex flex-col justify-end p-3 pointer-events-none opacity-40">
                      <div className="w-full h-1/5 border-t border-b border-amber-400 mb-1 rounded-sm bg-amber-500/20" />
                      <div className="w-full h-1/5 border-t border-b border-amber-400 mb-1 rounded-sm bg-amber-500/20" />
                      <div className="w-full h-1/5 border-t border-b border-amber-400 rounded-sm bg-amber-500/20" />
                    </div>
                  )}

                  {/* UNIFIED TEXT NODE */}
                  {isTextNode && (
                    <div
                      contentEditable={isEditingNodeText}
                      suppressContentEditableWarning
                      onFocus={(e) => {
                        const el = e.currentTarget;
                        const range = document.createRange();
                        range.selectNodeContents(el);
                        range.collapse(false);
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);
                      }}
                      onBlur={(e) => {
                        const newText = e.currentTarget.textContent;
                        setNodes((prev) =>
                          prev
                            .map((n) =>
                              n.id === node.id ? { ...n, text: newText } : n,
                            )
                            .filter((n) => !(n.type === "text" && !n.text)),
                        );
                        setEditingNodeTextId(null);
                      }}
                      onInput={(e) => {
                        const el = e.currentTarget;
                        if (el.scrollHeight > node.h) {
                          setNodes((prev) =>
                            prev.map((n) =>
                              n.id === node.id
                                ? { ...n, h: el.scrollHeight }
                                : n,
                            ),
                          );
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          e.currentTarget.blur();
                        }
                      }}
                      className={`w-full outline-none break-words whitespace-pre-wrap tracking-wide flex flex-col items-center justify-center text-center ${COLORS[node.color].text} ${node.bold ? "font-bold" : "font-normal"} ${isEditingNodeText ? "cursor-text bg-black/80 ring-2 ring-white/50 rounded-lg shadow-2xl z-50 p-2" : "cursor-grab p-2"}`}
                      style={{
                        fontSize: `${node.size || 16}px`,
                        minHeight: "40px",
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingNodeTextId(node.id);
                        setTool("pointer");
                        setSelectedId(node.id);
                      }}
                      onPointerDown={(e) => {
                        if (isEditingNodeText) e.stopPropagation();
                      }}
                    >
                      {node.text}
                    </div>
                  )}

                  {/* STANDARD SHAPE RENDERING */}
                  {!isTextNode && !isArrowNode && (
                    <div className="flex flex-col items-center justify-center pointer-events-none w-full h-full p-2 relative">
                      {SysIcon && (
                        <div
                          className={`p-2 rounded-lg bg-black/30 ${themeColor.text} mb-1 z-30`}
                        >
                          <SysIcon size={32} color={themeColor.hex} />
                        </div>
                      )}
                      {(node.text !== undefined || isEditingNodeText) && (
                        <div
                          contentEditable={isEditingNodeText}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const text = e.currentTarget.textContent;
                            const el = e.currentTarget;
                            const expectedMinH = el.scrollHeight + 60;
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === node.id
                                  ? {
                                      ...n,
                                      text,
                                      h: Math.max(n.h, expectedMinH),
                                    }
                                  : n,
                              ),
                            );
                            setEditingNodeTextId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              e.currentTarget.blur();
                            }
                          }}
                          className={`outline-none break-words whitespace-pre-wrap tracking-wide ${COLORS[node.color].text} text-center ${node.bold ? "font-bold" : "font-normal"} ${isEditingNodeText ? "bg-black/80 ring-2 ring-white/50 rounded cursor-text p-1" : "cursor-text"} w-full pointer-events-auto`}
                          style={{
                            fontSize: `${node.size || 14}px`,
                            zIndex: 30,
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setEditingNodeTextId(node.id);
                            setTool("pointer");
                            setSelectedId(node.id);
                          }}
                          onPointerDown={(e) => {
                            if (isEditingNodeText) e.stopPropagation();
                          }}
                        >
                          {node.text}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ARROW TEXT RENDERING (Centered over arrow body) */}
                  {isArrowNode &&
                    (node.text !== undefined || isEditingNodeText) && (
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30"
                        style={{
                          transform:
                            node.rotation > 90 || node.rotation < -90
                              ? "rotate(180deg)"
                              : "none",
                        }}
                      >
                        <div
                          contentEditable={isEditingNodeText}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const text = e.currentTarget.textContent;
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === node.id ? { ...n, text } : n,
                              ),
                            );
                            setEditingNodeTextId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              e.currentTarget.blur();
                            }
                          }}
                          className={`outline-none break-words whitespace-pre-wrap tracking-wide ${COLORS[node.color].text} text-center ${node.bold ? "font-bold" : "font-normal"} ${isEditingNodeText ? "bg-black/80 ring-2 ring-white/50 rounded cursor-text p-1" : "cursor-text"} pointer-events-auto`}
                          style={{
                            fontSize: `${node.size || 14}px`,
                            marginTop: "-40px",
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setEditingNodeTextId(node.id);
                            setTool("pointer");
                            setSelectedId(node.id);
                          }}
                          onPointerDown={(e) => {
                            if (isEditingNodeText) e.stopPropagation();
                          }}
                        >
                          {node.text}
                        </div>
                      </div>
                    )}

                  {/* FLOATING LABELS */}
                  {node.labels?.map((label) => {
                    const isLabelSelected = selectedLabel?.labelId === label.id;
                    const isLabelEditing = editingLabel?.labelId === label.id;

                    return (
                      <div
                        key={label.id}
                        className="absolute flex flex-col items-center justify-center no-canvas-click"
                        style={{
                          left: safeVal(label.x),
                          top: safeVal(label.y),
                          transform: "translate(-50%, -50%)",
                          zIndex: 50,
                        }}
                        onPointerDown={(e) => {
                          if (tool !== "pointer") return;
                          e.stopPropagation();
                          setSelectedId(node.id);
                          setSelectedLabel({
                            nodeId: node.id,
                            labelId: label.id,
                          });
                          setEditingNodeTextId(null);
                          if (editingLabel?.labelId !== label.id) {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            const scale = camera.z;
                            setDragLabelInfo({
                              nodeId: node.id,
                              labelId: label.id,
                              offsetX:
                                (e.clientX - (rect.left + rect.width / 2)) /
                                camera.z,
                              offsetY:
                                (e.clientY - (rect.top + rect.height / 2)) /
                                camera.z,
                            });
                          }
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(node.id);
                          setSelectedLabel({
                            nodeId: node.id,
                            labelId: label.id,
                          });
                          setEditingLabel({
                            nodeId: node.id,
                            labelId: label.id,
                          });
                        }}
                      >
                        {isLabelSelected && !isLabelEditing && (
                          <div className="absolute bottom-full mb-1 flex items-center gap-1 bg-slate-900/95 border border-slate-700 p-1 rounded-lg shadow-2xl z-50 scale-[calc(1/var(--tw-scale-x))]">
                            <button
                              onClick={() =>
                                setNodes((prev) =>
                                  prev.map((n) =>
                                    n.id === node.id
                                      ? {
                                          ...n,
                                          labels: n.labels.map((l) =>
                                            l.id === label.id
                                              ? { ...l, bold: !l.bold }
                                              : l,
                                          ),
                                        }
                                      : n,
                                  ),
                                )
                              }
                              className={`p-1 rounded hover:bg-slate-700 ${label.bold ? "text-white" : "text-slate-400"}`}
                            >
                              <Bold size={12} />
                            </button>
                            <button
                              onClick={() =>
                                setNodes((prev) =>
                                  prev.map((n) =>
                                    n.id === node.id
                                      ? {
                                          ...n,
                                          labels: n.labels.map((l) =>
                                            l.id === label.id
                                              ? { ...l, size: l.size + 2 }
                                              : l,
                                          ),
                                        }
                                      : n,
                                  ),
                                )
                              }
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700"
                            >
                              <Plus size={12} />
                            </button>
                            <button
                              onClick={() =>
                                setNodes((prev) =>
                                  prev.map((n) =>
                                    n.id === node.id
                                      ? {
                                          ...n,
                                          labels: n.labels.map((l) =>
                                            l.id === label.id
                                              ? {
                                                  ...l,
                                                  size: Math.max(8, l.size - 2),
                                                }
                                              : l,
                                          ),
                                        }
                                      : n,
                                  ),
                                )
                              }
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700"
                            >
                              <Minus size={12} />
                            </button>
                            <div className="w-px h-3 bg-slate-600 mx-0.5" />
                            <button
                              onClick={() =>
                                setNodes((prev) =>
                                  prev.map((n) =>
                                    n.id === node.id
                                      ? {
                                          ...n,
                                          labels: n.labels.filter(
                                            (l) => l.id !== label.id,
                                          ),
                                        }
                                      : n,
                                  ),
                                )
                              }
                              className="p-1 rounded text-red-400 hover:bg-red-950/50"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}

                        <div
                          contentEditable={isLabelEditing}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const newText = e.currentTarget.textContent.trim();
                            setNodes((prev) =>
                              prev.map((n) =>
                                n.id === node.id
                                  ? {
                                      ...n,
                                      labels: newText
                                        ? n.labels.map((l) =>
                                            l.id === label.id
                                              ? { ...l, text: newText }
                                              : l,
                                          )
                                        : n.labels.filter(
                                            (l) => l.id !== label.id,
                                          ),
                                    }
                                  : n,
                              ),
                            );
                            setEditingLabel(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              e.currentTarget.blur();
                            }
                          }}
                          className={`outline-none break-words whitespace-pre-wrap tracking-wide ${COLORS[label.color].text} ${label.bold ? "font-bold" : "font-normal"} ${isLabelEditing ? "bg-black/80 ring-2 ring-white/50 cursor-text px-3 py-1.5 rounded-lg min-w-[30px] min-h-[1.5em] shadow-2xl" : "cursor-grab px-2 py-1"} ${isLabelSelected && !isLabelEditing ? "ring-1 ring-dashed ring-white/30 rounded" : ""}`}
                          style={{
                            fontSize: `${label.size}px`,
                            maxWidth: `300px`,
                          }}
                        >
                          {label.text}
                        </div>
                      </div>
                    );
                  })}

                  {/* 8-Way Node Resize Handles (Hidden for custom Arrow shape) */}
                  {isSelected &&
                    tool === "pointer" &&
                    !isEditingNodeText &&
                    !isArrowNode &&
                    RESIZE_HANDLES.map((handle, i) => (
                      <div
                        key={i}
                        className="absolute w-[10px] h-[10px] bg-white rounded-full shadow-[0_0_5px_rgba(0,0,0,0.8)] border border-slate-900 z-50 no-canvas-click no-capture"
                        style={{
                          top: handle.top,
                          left: handle.left,
                          right: handle.right,
                          bottom: handle.bottom,
                          cursor: handle.cursor,
                        }}
                        onPointerDown={(e) => {
                          if (tool !== "pointer") return;
                          e.stopPropagation();
                          setResizeInfo({
                            id: node.id,
                            dir: handle.dir,
                            startX: node.x,
                            startY: node.y,
                            startW: node.w,
                            startH: node.h,
                            startMouseX: getWorldPos(e.clientX, e.clientY).x,
                            startMouseY: getWorldPos(e.clientX, e.clientY).y,
                          });
                        }}
                      />
                    ))}

                  {/* Arrow Rotation / Length Extender Handle */}
                  {isArrowNode &&
                    isSelected &&
                    tool === "pointer" &&
                    !isEditingNodeText && (
                      <div
                        className="absolute w-6 h-6 bg-white/20 hover:bg-white/50 rounded-full border border-white/50 z-50 cursor-crosshair no-canvas-click flex items-center justify-center no-capture"
                        style={{
                          top: "50%",
                          left: "100%",
                          transform: "translate(10px, -50%)",
                        }}
                        onPointerDown={(e) => {
                          if (tool !== "pointer") return;
                          e.stopPropagation();
                          setRotateInfo({
                            id: node.id,
                            cx: node.x,
                            cy: node.y + node.h / 2,
                          });
                        }}
                      >
                        <div className="w-2 h-2 bg-white rounded-full pointer-events-none" />
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </div>

        {/* --- TOP-LEVEL LASER LAYER --- */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          className="absolute inset-0 overflow-visible pointer-events-none no-capture"
          style={{ zIndex: 99990 }}
        >
          <defs>
            <filter
              id="glow-laser"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g
            style={{
              transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.z})`,
              transformOrigin: "0 0",
            }}
          >
            <g
              ref={laserGroupRef}
              filter="url(#glow-laser)"
              className="drop-shadow-2xl"
            />
            <g ref={laserCoreRef} className="drop-shadow-lg" />
          </g>
        </svg>

        {/* --- SCREENSHOT SELECTOR UI (FIXED) --- */}
        {screenshotArea && (
          <div
            className="absolute border-2 border-dashed border-white bg-white/10 pointer-events-none z-[99999] no-capture"
            style={{
              left: safeVal(
                screenshotArea.selecting
                  ? Math.min(screenshotArea.startX, screenshotArea.endX)
                  : screenshotArea.x,
              ),
              top: safeVal(
                screenshotArea.selecting
                  ? Math.min(screenshotArea.startY, screenshotArea.endY)
                  : screenshotArea.y,
              ),
              width: safeVal(
                screenshotArea.selecting
                  ? Math.abs(screenshotArea.startX - screenshotArea.endX)
                  : screenshotArea.w,
              ),
              height: safeVal(
                screenshotArea.selecting
                  ? Math.abs(screenshotArea.startY - screenshotArea.endY)
                  : screenshotArea.h,
              ),
            }}
          />
        )}

        {screenshotArea && !screenshotArea.selecting && (
          <div
            className="absolute z-[99999] flex items-center gap-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-2 rounded-xl shadow-2xl no-capture"
            style={{
              left: safeVal(screenshotArea.x + screenshotArea.w / 2),
              top: safeVal(screenshotArea.y + screenshotArea.h + 10),
              transform: "translateX(-50%)",
            }}
          >
            <button
              onClick={() => handleExport("png")}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 font-bold text-sm disabled:opacity-50"
            >
              <ImageIcon size={14} />{" "}
              {isExporting ? "Processing..." : "Save PNG"}
            </button>
            <button
              onClick={() => handleExport("copy")}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 font-bold text-sm disabled:opacity-50"
            >
              <ClipboardCopy size={14} />{" "}
              {isExporting ? "Processing..." : "Copy"}
            </button>
            <button
              onClick={() => {
                setScreenshotArea(null);
                setTool("pointer");
              }}
              disabled={isExporting}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-50"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}
      </div>

      {/* --- IMAGE COPY FALLBACK MODAL --- */}
      {previewImage && (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/80 backdrop-blur-sm no-capture">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl max-w-[90vw] max-h-[90vh] flex flex-col items-center gap-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle className="text-emerald-400" /> Image Generated!
            </h3>
            <p className="text-slate-300 text-sm bg-slate-800 p-3 rounded-lg border border-slate-700">
              Right-click the image below and select <strong>Copy Image</strong>
            </p>
            <div className="overflow-auto border border-slate-700 rounded-lg max-h-[50vh] max-w-full shadow-inner bg-black/50">
              <img
                src={previewImage}
                alt="Exported Architecture"
                className="block max-w-full h-auto"
              />
            </div>
            <button
              onClick={() => setPreviewImage(null)}
              className="mt-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* --- EDGE POPUP MENU --- */}
      {selectedId?.startsWith("e_") &&
        edgeMenuPos &&
        !dragEdgeCpInfo &&
        !dragPortInfo && (
          <div
            className="absolute z-[999999] flex flex-col gap-2 bg-slate-900/95 backdrop-blur border border-slate-700 p-2 rounded-xl shadow-2xl transform -translate-x-1/2 -translate-y-[calc(100%+15px)] no-canvas-click no-capture"
            style={{
              left: safeVal(edgeMenuPos.x),
              top: safeVal(edgeMenuPos.y),
            }}
          >
            <div className="flex items-center gap-1">
              {[
                { id: "forward", icon: MoveRight },
                { id: "reverse", icon: MoveLeft },
                { id: "both", icon: ArrowLeftRight },
                { id: "none", icon: Minus },
              ].map((dir) => (
                <button
                  key={dir.id}
                  onClick={() =>
                    setEdges((prev) =>
                      prev.map((e) =>
                        e.id === edgeMenuPos.edge.id
                          ? { ...e, direction: dir.id }
                          : e,
                      ),
                    )
                  }
                  className={`p-1.5 rounded-lg transition-colors ${edgeMenuPos.edge.direction === dir.id ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
                  title={`Direction: ${dir.id}`}
                >
                  <dir.icon size={14} />
                </button>
              ))}
              <div className="w-px h-5 bg-slate-700 mx-1" />

              <button
                onClick={() =>
                  setEdges((prev) =>
                    prev.map((e) =>
                      e.id === edgeMenuPos.edge.id
                        ? { ...e, encrypted: !e.encrypted }
                        : e,
                    ),
                  )
                }
                className={`p-1.5 rounded-lg transition-colors ${edgeMenuPos.edge.encrypted ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
                title={
                  edgeMenuPos.edge.encrypted
                    ? "Disable VPN/Encryption"
                    : "Enable VPN/Encryption"
                }
              >
                {edgeMenuPos.edge.encrypted ? (
                  <Lock size={14} />
                ) : (
                  <Unlock size={14} />
                )}
              </button>

              <div className="w-px h-5 bg-slate-700 mx-1" />
              <button
                onClick={() => {
                  setEdges((prev) => prev.filter((e) => e.id !== selectedId));
                  setSelectedId(null);
                }}
                className="p-1.5 rounded-lg text-red-400 hover:text-red-200 hover:bg-red-950/50"
                title="Delete Link"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex items-center justify-center gap-1 border-t border-slate-800 pt-1.5">
              {[
                { id: "default", icon: MoreHorizontal, label: "Dots" },
                { id: "rest", icon: ArrowRightLeft, label: "REST" },
                { id: "grpc", icon: Radio, label: "gRPC" },
                { id: "websocket", icon: ArrowDownUp, label: "WS" },
                { id: "pubsub", icon: Repeat, label: "Burst" },
                { id: "beam", icon: Zap, label: "Beam" },
                { id: "dropped", icon: Ban, label: "Drop" },
              ].map((flow) => (
                <button
                  key={flow.id}
                  onClick={() =>
                    setEdges((prev) =>
                      prev.map((e) =>
                        e.id === edgeMenuPos.edge.id
                          ? { ...e, flow: flow.id }
                          : e,
                      ),
                    )
                  }
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-xs font-semibold ${edgeMenuPos.edge.flow === flow.id || (!edgeMenuPos.edge.flow && flow.id === "default") ? "bg-cyan-900/50 text-cyan-300" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"}`}
                  title={`Flow: ${flow.label}`}
                >
                  <flow.icon size={12} /> {flow.label}
                </button>
              ))}
            </div>
          </div>
        )}

      {/* --- NODE POPUP MENU --- */}
      {selectedId?.startsWith("n_") &&
        nodeMenuPos &&
        tool === "pointer" &&
        !dragInfo &&
        !resizeInfo &&
        !selectedLabel &&
        !editingNodeTextId && (
          <div
            className="absolute z-[999999] flex flex-col gap-2 bg-slate-900/95 backdrop-blur border border-slate-700 p-2 rounded-xl shadow-2xl transform -translate-x-1/2 -translate-y-[calc(100%+15px)] no-canvas-click no-capture"
            style={{
              left: safeVal(nodeMenuPos.x),
              top: safeVal(nodeMenuPos.y),
            }}
          >
            <div className="flex items-center gap-1">
              {(nodeMenuPos.node.type === "text" ||
                nodeMenuPos.node.text !== undefined) && (
                <>
                  <button
                    onClick={() =>
                      setNodes((prev) =>
                        prev.map((n) =>
                          n.id === selectedId ? { ...n, bold: !n.bold } : n,
                        ),
                      )
                    }
                    className={`p-1.5 rounded-lg hover:bg-slate-700 ${nodeMenuPos.node.bold ? "text-white" : "text-slate-400"}`}
                    title="Bold Text"
                  >
                    <Bold size={16} />
                  </button>
                  <button
                    onClick={() =>
                      setNodes((prev) =>
                        prev.map((n) =>
                          n.id === selectedId
                            ? { ...n, size: (n.size || 14) + 2 }
                            : n,
                        ),
                      )
                    }
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
                    title="Increase Text Size"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() =>
                      setNodes((prev) =>
                        prev.map((n) =>
                          n.id === selectedId
                            ? { ...n, size: Math.max(8, (n.size || 14) - 2) }
                            : n,
                        ),
                      )
                    }
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
                    title="Decrease Text Size"
                  >
                    <Minus size={16} />
                  </button>
                  <div className="w-px h-6 bg-slate-700 mx-1" />
                </>
              )}

              {nodeMenuPos.node.type !== "text" &&
                nodeMenuPos.node.type !== "arrow" && (
                  <>
                    <button
                      onClick={() => {
                        setNodes((prev) =>
                          prev.map((n) =>
                            n.id === nodeMenuPos.node.id
                              ? {
                                  ...n,
                                  labels: [
                                    ...(n.labels || []),
                                    {
                                      id: `l_${Date.now()}`,
                                      text: "",
                                      x: n.w / 2,
                                      y: n.h / 2,
                                      color: activeColor,
                                      bold: true,
                                      size: 14,
                                    },
                                  ],
                                }
                              : n,
                          ),
                        );
                      }}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                      title="Add Floating Text Label"
                    >
                      <TypeIcon size={16} />
                    </button>
                    <button
                      onClick={() => createFailover(selectedId)}
                      className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-900/30"
                      title="Create Failover (Standby Clone)"
                    >
                      <Copy size={16} />
                    </button>
                    <div className="w-px h-6 bg-slate-700 mx-1" />
                  </>
                )}

              <button
                onClick={() =>
                  setNodes((prev) =>
                    prev.map((n) =>
                      n.id === selectedId
                        ? { ...n, zOffset: (n.zOffset || 0) + 10 }
                        : n,
                    ),
                  )
                }
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                title="Bring to Front"
              >
                <BringToFront size={16} />
              </button>
              <button
                onClick={() =>
                  setNodes((prev) =>
                    prev.map((n) =>
                      n.id === selectedId
                        ? { ...n, zOffset: (n.zOffset || 0) - 10 }
                        : n,
                    ),
                  )
                }
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                title="Send to Back"
              >
                <SendToBack size={16} />
              </button>
              <div className="w-px h-6 bg-slate-700 mx-1" />
              <button
                onClick={() => {
                  setNodes((prev) => prev.filter((n) => n.id !== selectedId));
                  setEdges((prev) =>
                    prev.filter(
                      (e) => e.source !== selectedId && e.target !== selectedId,
                    ),
                  );
                  setSelectedId(null);
                }}
                className="p-1.5 rounded-lg text-red-400 hover:text-red-200 hover:bg-red-950/50"
                title="Delete Shape"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {nodeMenuPos.node.type !== "text" &&
              nodeMenuPos.node.type !== "rect" &&
              nodeMenuPos.node.type !== "cloud" &&
              nodeMenuPos.node.type !== "arrow" && (
                <div className="flex items-center justify-center gap-1 border-t border-slate-800 pt-1.5">
                  {[
                    {
                      id: "healthy",
                      icon: CheckCircle,
                      color: "text-emerald-400",
                      bg: "bg-emerald-900/30",
                    },
                    {
                      id: "throttled",
                      icon: Clock,
                      color: "text-amber-400",
                      bg: "bg-amber-900/30",
                    },
                    {
                      id: "down",
                      icon: XCircle,
                      color: "text-red-400",
                      bg: "bg-red-900/30",
                    },
                    {
                      id: "standby",
                      icon: Activity,
                      color: "text-slate-400",
                      bg: "bg-slate-800/80",
                    },
                  ].map((status) => (
                    <button
                      key={status.id}
                      onClick={() =>
                        setNodes((prev) =>
                          prev.map((n) =>
                            n.id === selectedId
                              ? { ...n, status: status.id }
                              : n,
                          ),
                        )
                      }
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-xs font-semibold ${nodeMenuPos.node.status === status.id ? `${status.bg} ${status.color}` : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"}`}
                      title={`Status: ${status.id}`}
                    >
                      <status.icon size={12} /> {status.id}
                    </button>
                  ))}
                </div>
              )}
          </div>
        )}

      {/* --- ZOOM & CAMERA HUD --- */}
      <div className="absolute top-6 right-6 z-[999999] flex items-center gap-1 bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-1.5 rounded-xl shadow-2xl no-canvas-click no-capture">
        <button
          onClick={() =>
            setCamera((prev) => ({ ...prev, z: Math.max(0.05, prev.z / 1.2) }))
          }
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={() => setCamera({ x: 0, y: 0, z: 1 })}
          className="px-2 text-xs font-mono text-slate-300 hover:text-white"
          title="Reset Camera"
        >
          {Math.round(camera.z * 100)}%
        </button>
        <button
          onClick={() =>
            setCamera((prev) => ({ ...prev, z: Math.min(5, prev.z * 1.2) }))
          }
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          <ZoomIn size={16} />
        </button>
      </div>

      {/* --- MAIN DOCK TOOLBAR --- */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[999999] flex flex-col gap-2 bg-[#0f172a]/95 backdrop-blur-xl border border-slate-700 p-3 rounded-2xl shadow-2xl no-canvas-click no-capture w-max max-w-[95vw]">
        <div className="flex flex-wrap justify-center items-center gap-2">
          <div className="flex bg-black/40 rounded-xl p-1">
            <button
              onClick={() => {
                setTool("pointer");
                setSelectedId(null);
                setLinkStartNode(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${tool === "pointer" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
              title="Select / Move"
            >
              <MousePointer2 size={16} />
            </button>
            <button
              onClick={() => {
                setTool("pan");
                setSelectedId(null);
                setLinkStartNode(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${tool === "pan" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
              title="Pan Canvas (Space/Middle Click)"
            >
              <Hand size={16} />
            </button>
            <button
              onClick={() => {
                setTool("laser");
                setSelectedId(null);
                setLinkStartNode(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${tool === "laser" ? "bg-red-600 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
              title="Laser Pointer"
            >
              <Wand2 size={16} />
            </button>
            <button
              onClick={() => {
                setTool("link");
                setSelectedId(null);
                setLinkStartNode(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${tool === "link" ? "bg-emerald-600 text-white shadow-lg animate-pulse" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
              title="Link Nodes"
            >
              <LinkIcon size={16} />
            </button>
            <button
              onClick={() => {
                setTool("screenshot");
                setSelectedId(null);
                setLinkStartNode(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${tool === "screenshot" ? "bg-amber-600 text-white shadow-lg animate-pulse" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
              title="Screenshot Crop Tool"
            >
              <Crop size={16} />
            </button>
          </div>

          <div className="w-px h-8 bg-slate-700/80 mx-1 hidden sm:block" />

          {/* General Shapes */}
          <div className="flex bg-black/40 rounded-xl p-1 gap-1">
            {[
              { id: "rect", icon: Square },
              { id: "circle", icon: CircleIcon },
              { id: "diamond", icon: Diamond },
              { id: "cloud", icon: Cloud },
              { id: "arrow", icon: ArrowRight },
              { id: "text", icon: Type },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTool(t.id);
                  setSelectedId(null);
                  setLinkStartNode(null);
                }}
                className={`p-2 rounded-lg transition-all ${tool === t.id ? "bg-white/20 text-white shadow-lg scale-110" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                title={`Add ${t.id}`}
              >
                <t.icon size={18} />
              </button>
            ))}
          </div>

          <div className="w-px h-8 bg-slate-700/80 mx-1 hidden sm:block" />

          {/* System Icons */}
          <div className="flex bg-black/40 rounded-xl p-1 gap-1">
            {Object.entries(SYSTEM_ICONS).map(([id, Icon]) => (
              <button
                key={id}
                onClick={() => {
                  setTool(id);
                  setSelectedId(null);
                  setLinkStartNode(null);
                }}
                className={`p-2 rounded-lg transition-all ${tool === id ? "bg-slate-600 text-white shadow-lg scale-110" : "text-slate-400 hover:text-cyan-300 hover:bg-cyan-900/30"}`}
                title={`Add ${id}`}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>

          <div className="w-px h-8 bg-slate-700/80 mx-1 hidden md:block" />

          {/* Color & Theme */}
          <div className="flex items-center gap-1.5 px-2 bg-black/20 rounded-xl py-1.5">
            <button
              onClick={() =>
                setBgThemeIndex((prev) => (prev + 1) % BG_THEMES.length)
              }
              className="p-1 mr-2 text-slate-400 hover:text-white transition-colors"
              title="Change Background Theme"
            >
              <Monitor size={18} />
            </button>
            <Palette
              size={16}
              className="text-slate-500 mr-1 hidden lg:block"
            />
            {Object.entries(COLORS).map(([name, c]) => (
              <button
                key={name}
                onClick={() => updateSelectedColor(name)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${activeColor === name ? "border-white scale-125 shadow-lg" : "border-transparent opacity-60 hover:opacity-100 hover:scale-110"}`}
                style={{ backgroundColor: c.hex }}
                title={name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
