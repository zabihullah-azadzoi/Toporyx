import React, { useState, useRef, useEffect } from "react";
import { toCanvas } from "html-to-image";
import {
  Square, Palette, Cloud, Layers,
  ArrowRight, Hexagon,
  Cylinder, FolderOpen, Cloud as CloudIcon,
  HardDrive,
  Monitor, Crop, ClipboardCopy, PenTool,
} from "lucide-react";

import {
  onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut
} from 'firebase/auth';
import { initFirebase } from "./config/firebase";
import { BG_THEMES, COLORS, RESIZE_HANDLES, SYSTEM_ICONS } from "./constants/ui";
import { ToporyxLogo } from "./components/branding/ToporyxLogo";
import { AuthModal } from "./components/auth/AuthModal";
import { DockToolbar } from "./components/editor/DockToolbar";
import { ExportPreviewModal } from "./components/editor/ExportPreviewModal";
import { TopLeftHud } from "./components/editor/TopLeftHud";
import { TopRightHud } from "./components/editor/TopRightHud";
import { CanvasScene } from "./components/editor/CanvasScene";
import { generateId, safeVal } from "./utils/ids";
import { reportError } from "./utils/monitoring";
import { useDiagramHistory } from "./hooks/useDiagramHistory";
import { useBoards } from "./hooks/useBoards";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useEdgeRouting } from "./hooks/useEdgeRouting";
import { useCanvasInteractions } from "./hooks/useCanvasInteractions";

const { auth, db, currentAppId } = initFirebase();

export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [diagram, setDiagram] = useState({ nodes: [], edges: [], drawings: [] });
  const [camera, setCamera] = useState({ x: 0, y: 0, z: 1 });

  useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsCloudSynced(!!currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    if (!auth) { setAuthError("Cloud synchronization is offline."); return; }
    try {
      if (isLoginMode) await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
      setShowAuthModal(false);
      setEmail(""); setPassword("");
    } catch (err) {
      let msg = err.message.replace("Firebase:", "").trim();
      if (msg.includes("auth/invalid-credential")) msg = "Invalid email or password.";
      if (msg.includes("auth/email-already-in-use")) msg = "This email is already registered.";
      if (msg.includes("auth/operation-not-allowed")) msg = "Email signup is disabled in this environment.";
      if (msg.includes("API key not valid")) msg = "Invalid Cloud API Key.";
      setAuthError(msg);
    }
  };

  const handleLogout = async () => {
    if (auth) await signOut(auth);
    setShowProfileMenu(false);
  };

  const clipboardRef = useRef({ nodes: [], edges: [] });

  const createFailover = (nodeId) => {
    const original = diagram.nodes.find((n) => n.id === nodeId);
    if (!original) return;

    let newY = original.y + original.h + 30;
    let overlap = true;
    while (overlap) {
      overlap = diagram.nodes.some((n) => Math.abs(n.x - original.x) < 10 && Math.abs(n.y - newY) < 10);
      if (overlap) newY += original.h + 30;
    }

    const newNode = { ...original, id: generateId("n"), y: newY, text: original.text ? `${original.text}\n(Failover)` : "Failover", status: "standby" };
    const newEdge = { id: generateId("e"), source: original.id, target: newNode.id, color: "slate", direction: "forward", flow: "default", sourcePort: "bottom", targetPort: "top", encrypted: false };

    const newState = { ...diagram, nodes: [...diagram.nodes, newNode], edges: [...diagram.edges, newEdge] };
    setDiagram(newState);
    pushToHistory(newState);
  };

  const [tool, setTool] = useState("pointer");
  const [activeColor, setActiveColor] = useState("cyan");
  const [bgThemeIndex, setBgThemeIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const theme = BG_THEMES[bgThemeIndex];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingBoardNameId, setEditingBoardNameId] = useState(null);

  const [isExporting, setIsExporting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [editingNodeTextId, setEditingNodeTextId] = useState(null);
  const [openNoteId, setOpenNoteId] = useState(null);

  const [dragInfo, setDragInfo] = useState(null);
  const [panInfo, setPanInfo] = useState(null);
  const [dragEdgeCpInfo, setDragEdgeCpInfo] = useState(null);
  const [dragPortInfo, setDragPortInfo] = useState(null);
  const [resizeInfo, setResizeInfo] = useState(null);
  const [linkStartNode, setLinkStartNode] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [screenshotArea, setScreenshotArea] = useState(null);
  const [drawingInfo, setDrawingInfo] = useState(null);

  const { historyRef, pushToHistory, undo, redo, resetHistory } = useDiagramHistory(diagram, setDiagram, setSelectedId);
  const {
    boards,
    activeBoardId,
    activeBoard,
    storageMode,
    saveState,
    createNewBoard,
    deleteBoard,
    renameBoard,
    handleSwitchBoard,
  } = useBoards({
    user,
    authReady,
    db,
    currentAppId,
    diagram,
    camera,
    generateId,
    setDiagram,
    setCamera,
    setSelectedId,
    setSidebarOpen,
    setScreenshotArea,
    setEditingBoardNameId,
    resetHistory,
  });

  const containerRef = useRef(null);
  const textInputRef = useRef(null);

  const stateRef = useRef(diagram);
  useEffect(() => { stateRef.current = diagram; }, [diagram]);

  const interRef = useRef({});
  interRef.current = { dragInfo, dragPortInfo, dragEdgeCpInfo, resizeInfo, tool, screenshotArea, drawingInfo, selectedId, linkStartNode, activeColor, camera, panInfo };

  const laserPointsRef = useRef([]);
  const laserGroupRef = useRef(null);
  const laserCoreRef = useRef(null);
  const laserRafRef = useRef(null);

  useKeyboardShortcuts({
    editingNodeTextId,
    editingBoardNameId,
    openNoteId,
    showAuthModal,
    undo,
    redo,
    selectedId,
    diagram,
    clipboardRef,
    generateId,
    pushToHistory,
    setSelectedId,
    setDiagram,
  });

  const handleExportPNG = async (format) => {
    if (!screenshotArea || isExporting || !containerRef.current) return;
    setIsExporting(true);
    let sourceCanvas;
    let cropCanvas;
    try {
      const captureEl = containerRef.current;

      document.querySelectorAll(".no-capture").forEach((el) => (el.style.opacity = "0"));
      const filterElements = captureEl.querySelectorAll('[filter]');
      const originalFilters = [];
      filterElements.forEach(el => {
        originalFilters.push({ el, filter: el.getAttribute('filter') });
        el.removeAttribute('filter');
      });

      await new Promise(r => setTimeout(r, 100));
      sourceCanvas = await toCanvas(captureEl, {
        backgroundColor: theme.bgHex,
        pixelRatio: window.devicePixelRatio || 2,
        skipFonts: false,
        cacheBust: true,
      });

      document.querySelectorAll(".no-capture").forEach((el) => (el.style.opacity = "1"));
      originalFilters.forEach(({ el, filter }) => el.setAttribute('filter', filter));

      const scale = window.devicePixelRatio || 2;
      cropCanvas = document.createElement("canvas");
      cropCanvas.width = screenshotArea.w * scale; cropCanvas.height = screenshotArea.h * scale;
      const ctx = cropCanvas.getContext("2d");
      ctx.drawImage(
        sourceCanvas,
        screenshotArea.x * scale,
        screenshotArea.y * scale,
        screenshotArea.w * scale,
        screenshotArea.h * scale,
        0,
        0,
        cropCanvas.width,
        cropCanvas.height,
      );

      const blob = await new Promise((resolve) => cropCanvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Failed to generate image blob");

      if (format === "copy") {
        if (!navigator.clipboard || !window.isSecureContext) {
          throw new Error("Clipboard API not fully available or insecure context");
        }

        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      } else {
        const link = document.createElement("a");
        link.download = `toporyx_${Date.now()}.png`;
        const url = URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      reportError("export.png", e, { format });
      if (cropCanvas) setPreviewImage(cropCanvas.toDataURL("image/png"));
    } finally {
      setScreenshotArea(null); setTool("pointer"); setIsExporting(false);
      document.querySelectorAll(".no-capture").forEach((el) => (el.style.opacity = "1"));
    }
  };

  const { getWorldPos, getConnectionPoint, getEdgePathData } = useEdgeRouting(containerRef, camera);

  useEffect(() => {
    if (editingNodeTextId && textInputRef.current) {
      textInputRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(textInputRef.current);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [editingNodeTextId]);

  const { handleCanvasPointerDown, handleNodePointerDown } = useCanvasInteractions({
    containerRef,
    interRef,
    stateRef,
    laserPointsRef,
    laserGroupRef,
    laserCoreRef,
    laserRafRef,
    tool,
    camera,
    diagram,
    activeColor,
    editingNodeTextId,
    setCamera,
    setMousePos,
    setDiagram,
    setScreenshotArea,
    setDragInfo,
    setDragPortInfo,
    setDragEdgeCpInfo,
    setResizeInfo,
    setPanInfo,
    setDrawingInfo,
    setTool,
    setEditingNodeTextId,
    setSelectedId,
    setLinkStartNode,
    setOpenNoteId,
    setSidebarOpen,
    setShowColorPicker,
    setShowProfileMenu,
    pushToHistory,
    generateId,
    getWorldPos,
    getConnectionPoint,
    getEdgePathData,
  });

  const updateSelectedColor = (colorName) => {
    setActiveColor(colorName);
    if (selectedId) {
      const newState = { ...diagram };
      if (selectedId.startsWith("n_") || selectedId.startsWith("l_")) {
        newState.nodes = newState.nodes.map(n => n.id === selectedId ? { ...n, color: colorName } : n);
      } else if (selectedId.startsWith("e_")) {
        newState.edges = newState.edges.map(e => e.id === selectedId ? { ...e, color: colorName } : e);
      } else if (selectedId.startsWith("d_")) {
        newState.drawings = newState.drawings.map(d => d.id === selectedId ? { ...d, color: colorName } : d);
      }
      setDiagram(newState); pushToHistory(newState);
    }
  };

  const activeColorObj = COLORS[activeColor] || COLORS.cyan;

  const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
  const getMenuLeft = (x) => Math.max(160, Math.min(winW - 160, safeVal(x)));
  const getMenuTop = (y) => Math.max(120, Math.min(winH - 50, safeVal(y)));

  return (
    <div className={`w-full h-screen font-sans overflow-hidden flex flex-col relative select-none transition-colors duration-500 ${theme.bgClass} ${activeColorObj.text}`}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes dash { to { stroke-dashoffset: -120; } }
        @keyframes fast-dash { to { stroke-dashoffset: -40; } }
        @keyframes glitch { 0% { transform: translate(0) } 20% { transform: translate(-2px, 2px) } 40% { transform: translate(-2px, -2px) } 60% { transform: translate(2px, 2px) } 80% { transform: translate(2px, -2px) } 100% { transform: translate(0) } }
        .status-down { animation: glitch 0.3s infinite; filter: grayscale(1) sepia(1) hue-rotate(-50deg) saturate(3) brightness(0.6); }
        .status-standby { opacity: 0.6; filter: grayscale(0.6); border-style: dashed !important; }
        textarea:focus { outline: none; border-color: ${activeColorObj.hex}; box-shadow: 0 0 15px ${activeColorObj.hex}80; }
      `}} />

      <TopLeftHud
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        theme={theme}
        activeBoard={activeBoard}
        isCloudSynced={isCloudSynced}
        storageMode={storageMode}
        saveState={saveState}
        undo={undo}
        redo={redo}
        canUndo={historyRef.current.past.length > 0}
        canRedo={historyRef.current.future.length > 0}
        setTool={setTool}
        setSelectedId={setSelectedId}
        setLinkStartNode={setLinkStartNode}
        createNewBoard={createNewBoard}
        boards={boards}
        activeBoardId={activeBoardId}
        handleSwitchBoard={handleSwitchBoard}
        editingBoardNameId={editingBoardNameId}
        renameBoard={renameBoard}
        setEditingBoardNameId={setEditingBoardNameId}
        deleteBoard={deleteBoard}
      />

      <TopRightHud
        theme={theme}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        setBgThemeIndex={setBgThemeIndex}
        setCamera={setCamera}
        camera={camera}
        user={user}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
        setShowAuthModal={setShowAuthModal}
        handleLogout={handleLogout}
      />

      <CanvasScene
        containerRef={containerRef}
        tool={tool}
        panInfo={panInfo}
        handleCanvasPointerDown={handleCanvasPointerDown}
        showGrid={showGrid}
        theme={theme}
        camera={camera}
        diagram={diagram}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        dragPortInfo={dragPortInfo}
        dragEdgeCpInfo={dragEdgeCpInfo}
        getEdgePathData={getEdgePathData}
        setEditingNodeTextId={setEditingNodeTextId}
        setSidebarOpen={setSidebarOpen}
        isExporting={isExporting}
        linkStartNode={linkStartNode}
        mousePos={mousePos}
        activeColorObj={activeColorObj}
        handleNodePointerDown={handleNodePointerDown}
        safeVal={safeVal}
        openNoteId={openNoteId}
        setOpenNoteId={setOpenNoteId}
        setDiagram={setDiagram}
        stateRef={stateRef}
        pushToHistory={pushToHistory}
        setTool={setTool}
        activeColor={activeColor}
        generateId={generateId}
        RESIZE_HANDLES={RESIZE_HANDLES}
        setResizeInfo={setResizeInfo}
        getWorldPos={getWorldPos}
        laserGroupRef={laserGroupRef}
        laserCoreRef={laserCoreRef}
        screenshotArea={screenshotArea}
        setScreenshotArea={setScreenshotArea}
        handleExportPNG={handleExportPNG}
        setDragEdgeCpInfo={setDragEdgeCpInfo}
        setDragPortInfo={setDragPortInfo}
        editingNodeTextId={editingNodeTextId}
        resizeInfo={resizeInfo}
        dragInfo={dragInfo}
        getMenuLeft={getMenuLeft}
        getMenuTop={getMenuTop}
        createFailover={createFailover}
        COLORS={COLORS}
        SYSTEM_ICONS={SYSTEM_ICONS}
        textInputRef={textInputRef}
      />

      <ExportPreviewModal previewImage={previewImage} onClose={() => setPreviewImage(null)} />

      <DockToolbar
        theme={theme}
        tool={tool}
        setTool={setTool}
        setSelectedId={setSelectedId}
        setLinkStartNode={setLinkStartNode}
        setShowColorPicker={setShowColorPicker}
        showColorPicker={showColorPicker}
        activeColor={activeColor}
        activeColorObj={activeColorObj}
        updateSelectedColor={updateSelectedColor}
      />

      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        authError={authError}
        handleAuthSubmit={handleAuthSubmit}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        isLoginMode={isLoginMode}
        setIsLoginMode={setIsLoginMode}
        setAuthError={setAuthError}
      />
    </div>
  );
}
