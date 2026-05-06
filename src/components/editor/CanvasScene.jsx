import React from 'react';
import { ClipboardCopy, Download, StickyNote, XCircle } from 'lucide-react';
import { EdgeContextMenu } from './EdgeContextMenu';
import { NodeContextMenu } from './NodeContextMenu';

export function CanvasScene(props) {
  const {
    containerRef,
    tool,
    panInfo,
    handleCanvasPointerDown,
    showGrid,
    theme,
    camera,
    diagram,
    selectedId,
    setSelectedId,
    dragPortInfo,
    dragEdgeCpInfo,
    getEdgePathData,
    setEditingNodeTextId,
    setSidebarOpen,
    isExporting,
    linkStartNode,
    mousePos,
    activeColorObj,
    handleNodePointerDown,
    safeVal,
    openNoteId,
    setOpenNoteId,
    setDiagram,
    stateRef,
    pushToHistory,
    setTool,
    activeColor,
    generateId,
    RESIZE_HANDLES,
    setResizeInfo,
    getWorldPos,
    laserGroupRef,
    laserCoreRef,
    screenshotArea,
    setScreenshotArea,
    handleExportPNG,
    setDragEdgeCpInfo,
    setDragPortInfo,
    editingNodeTextId,
    resizeInfo,
    dragInfo,
    getMenuLeft,
    getMenuTop,
    createFailover,
    COLORS,
    SYSTEM_ICONS,
    textInputRef,
  } = props;

  const selectedEdge = selectedId?.startsWith("e_")
    ? diagram.edges.find((edge) => edge.id === selectedId)
    : null;
  const edgeMenuPos = (() => {
    if (!selectedEdge || dragPortInfo || dragEdgeCpInfo) return null;
    const source = diagram.nodes.find((n) => n.id === selectedEdge.source);
    const target = diagram.nodes.find((n) => n.id === selectedEdge.target);
    if (!source && !(dragPortInfo?.edgeId === selectedEdge.id && dragPortInfo?.type === "source")) return null;
    if (!target && !(dragPortInfo?.edgeId === selectedEdge.id && dragPortInfo?.type === "target")) return null;
    const siblings = diagram.edges.filter((e) =>
      (e.source === selectedEdge.source && e.target === selectedEdge.target) ||
      (e.source === selectedEdge.target && e.target === selectedEdge.source)
    );
    siblings.sort((a, b) => a.id.localeCompare(b.id));
    const routing = getEdgePathData(
      source,
      target,
      selectedEdge,
      dragPortInfo,
      siblings.findIndex((e) => e.id === selectedEdge.id),
      siblings.length
    );
    if (!routing) return null;
    const { midX, midY } = routing;
    if (isNaN(midX) || isNaN(midY)) return null;
    return { x: midX * camera.z + camera.x, y: midY * camera.z + camera.y, edge: selectedEdge };
  })();

  const selectedNode = selectedId?.startsWith("n_") || selectedId?.startsWith("l_")
    ? diagram.nodes.find((node) => node.id === selectedId)
    : null;
  const nodeMenuPos = (() => {
    if (!selectedNode || editingNodeTextId) return null;
    const safeX = safeVal(selectedNode.x);
    const safeY = safeVal(selectedNode.y);
    const safeW = safeVal(selectedNode.w, 120);
    if (isNaN(selectedNode.x)) return null;
    return { x: (safeX + safeW / 2) * camera.z + camera.x, y: safeY * camera.z + camera.y, node: selectedNode };
  })();

  return (
    <>
      {/* --- CANVAS --- */}
      <div ref={containerRef} className={`flex-1 relative overflow-hidden ${tool === "pan" || panInfo ? "cursor-grab active:cursor-grabbing" : tool === "screenshot" ? "cursor-crosshair" : tool === "pencil" ? "cursor-crosshair" : "cursor-default"}`} onPointerDown={handleCanvasPointerDown}>

        {showGrid && (
          <div className="absolute inset-0 pointer-events-none opacity-[0.15]" style={{ backgroundImage: `linear-gradient(to right, ${theme.gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${theme.gridColor} 1px, transparent 1px)`, backgroundSize: `${40 * camera.z}px ${40 * camera.z}px`, backgroundPosition: `${camera.x}px ${camera.y}px` }} />
        )}
        <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] ${theme.glow1} blur-[150px] rounded-full pointer-events-none transition-colors duration-1000`} />
        <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] ${theme.glow2} blur-[150px] rounded-full pointer-events-none transition-colors duration-1000`} />

        <div className="absolute inset-0 pointer-events-none" style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.z})`, transformOrigin: "0 0" }}>

          <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" style={{ zIndex: 10 }}>
            <defs>
              {Object.values(COLORS).map((c) => (
                <React.Fragment key={c.name}>
                  <filter id={`glow-${c.name}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <marker id={`arrow-${c.name}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill={c.hex} />
                  </marker>
                </React.Fragment>
              ))}
            </defs>

            {diagram.drawings.map(d => {
              const pts = d.points.map(p => `${p.x},${p.y}`).join(" ");
              const isSelected = selectedId === d.id;
              const dColor = COLORS[d.color] || COLORS.cyan;
              return (
                <polyline key={d.id} points={pts} fill="none" stroke={dColor.hex} strokeWidth={isSelected ? 3 : 1.5} strokeLinecap="round" strokeLinejoin="round"
                  className="pointer-events-auto cursor-pointer"
                  onPointerDown={(e) => { if (tool === 'pointer') { e.stopPropagation(); setSelectedId(d.id); } }}
                />
              )
            })}

            {diagram.edges.map((edge) => {
              const source = diagram.nodes.find((n) => n.id === edge.source);
              const target = diagram.nodes.find((n) => n.id === edge.target);
              if (!source && !(dragPortInfo?.edgeId === edge.id && dragPortInfo?.type === "source")) return null;
              if (!target && !(dragPortInfo?.edgeId === edge.id && dragPortInfo?.type === "target")) return null;

              const siblings = diagram.edges.filter(e =>
                (e.source === edge.source && e.target === edge.target) ||
                (e.source === edge.target && e.target === edge.source)
              );
              siblings.sort((a, b) => a.id.localeCompare(b.id));
              const siblingCount = siblings.length;
              const siblingIndex = siblings.findIndex(e => e.id === edge.id);

              const routing = getEdgePathData(source, target, edge, dragPortInfo, siblingIndex, siblingCount);
              if (!routing) return null;

              const { pathD, start, end } = routing;
              const themeColor = COLORS[edge.color] || COLORS.cyan;
              const isSelected = selectedId === edge.id;
              const isEncrypted = edge.encrypted;
              const flowType = edge.flow || "default";

              return (
                <g key={edge.id}>
                  <path d={pathD} stroke="transparent" strokeWidth="35" fill="none" className="pointer-events-auto cursor-pointer" onPointerDown={(e) => { if (tool !== "pointer") return; e.stopPropagation(); setSelectedId(edge.id); setEditingNodeTextId(null); setSidebarOpen(false); }} />

                  {isEncrypted && <path d={pathD} stroke={themeColor.hex} strokeWidth="16" fill="none" opacity="0.15" strokeLinecap="round" />}
                  {isEncrypted && <path d={pathD} stroke={themeColor.hex} strokeWidth="2" fill="none" opacity="0.5" strokeDasharray="4 4" className="animate-[dash_5s_linear_infinite]" />}

                  <path id={`path-${edge.id}`} d={pathD} stroke={flowType === "dropped" ? COLORS.red.hex : themeColor.hex} fill="none" strokeWidth={isSelected ? "3" : "2"} opacity={isSelected ? "1" : theme.light ? "0.6" : "0.5"} strokeDasharray={flowType === "beam" || isEncrypted ? "none" : "6 6"}
                    className={isSelected && flowType !== "beam" && !isEncrypted && !isExporting ? "animate-[dash_10s_linear_infinite]" : ""}
                    markerEnd={(edge.direction === "forward" || edge.direction === "both") && !isEncrypted ? `url(#arrow-${flowType === "dropped" ? "red" : themeColor.name})` : undefined}
                    markerStart={(edge.direction === "reverse" || edge.direction === "both") && !isEncrypted ? `url(#arrow-${flowType === "dropped" ? "red" : themeColor.name})` : undefined}
                  />

                  {edge.sourcePortLabel && <text x={start.x + (start.nx || 0) * 15} y={start.y + (start.ny || 0) * 15} fill={theme.light ? "#333" : "#fff"} fontSize="10" textAnchor="middle" dominantBaseline="middle" className="font-mono bg-black/50 pointer-events-none">{edge.sourcePortLabel}</text>}
                  {edge.targetPortLabel && <text x={end.x + (end.nx || 0) * 15} y={end.y + (end.ny || 0) * 15} fill={theme.light ? "#333" : "#fff"} fontSize="10" textAnchor="middle" dominantBaseline="middle" className="font-mono bg-black/50 pointer-events-none">{edge.targetPortLabel}</text>}

                  {isExporting && ['default', 'rest', 'grpc', 'websocket', 'pubsub'].includes(flowType) && (
                    <path d={pathD} stroke={flowType === 'rest' ? COLORS.amber.hex : themeColor.hex} fill="none" strokeWidth={flowType === 'grpc' ? "6" : "5"} strokeDasharray={flowType === 'grpc' ? "2 20" : "5 20"} strokeLinecap="round" opacity="0.8" />
                  )}

                  {!isExporting && (
                    <>
                      {flowType === "beam" && <path d={pathD} stroke={themeColor.hex} fill="none" strokeWidth="4" filter={!theme.light ? `url(#glow-${themeColor.name})` : ""} strokeDasharray="15 15" className="animate-[fast-dash_0.5s_linear_infinite]" />}

                      {flowType === "default" && (edge.direction === "forward" || edge.direction === "both") && [0, 1.2, 2.4].map(d => (
                        <circle key={`fwd-${d}`} r="4" fill={themeColor.hex} filter={!theme.light ? `url(#glow-${themeColor.name})` : ""}>
                          <animateMotion dur="3s" begin={`${d}s`} repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear"><mpath href={`#path-${edge.id}`} /></animateMotion>
                        </circle>
                      ))}
                      {flowType === "default" && (edge.direction === "reverse" || edge.direction === "both") && [0.6, 1.8, 3.0].map(d => (
                        <circle key={`rev-${d}`} r="4" fill={themeColor.hex} filter={!theme.light ? `url(#glow-${themeColor.name})` : ""}>
                          <animateMotion dur="3s" begin={`${d}s`} repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear"><mpath href={`#path-${edge.id}`} /></animateMotion>
                        </circle>
                      ))}

                      {flowType === "rest" && (
                        <>
                          <circle r="4.5" fill={themeColor.hex} filter={!theme.light ? `url(#glow-${themeColor.name})` : ""}>
                            <animateMotion dur="2.5s" begin="0s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;0.5;1" calcMode="linear"><mpath href={`#path-${edge.id}`} /></animateMotion>
                            <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.48;0.5;1" dur="2.5s" repeatCount="indefinite" />
                          </circle>
                          <circle r="4.5" fill={COLORS.amber.hex} filter={!theme.light ? "url(#glow-amber)" : ""}>
                            <animateMotion dur="2.5s" begin="0s" repeatCount="indefinite" keyPoints="1;1;0" keyTimes="0;0.5;1" calcMode="linear"><mpath href={`#path-${edge.id}`} /></animateMotion>
                            <animate attributeName="opacity" values="0;0;1;1" keyTimes="0;0.5;0.52;1" dur="2.5s" repeatCount="indefinite" />
                          </circle>
                        </>
                      )}

                      {flowType === "grpc" && (
                        <>
                          {[0, 0.3, 0.6, 0.9, 1.2].map(d => (
                            <circle key={`grpc-f-${d}`} r="2.5" fill={themeColor.hex} filter={!theme.light ? `url(#glow-${themeColor.name})` : ""}>
                              <animateMotion dur="2s" begin={`${d}s`} repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear"><mpath href={`#path-${edge.id}`} /></animateMotion>
                            </circle>
                          ))}
                          {[0.15, 0.45, 0.75, 1.05, 1.35].map(d => (
                            <circle key={`grpc-r-${d}`} r="2.5" fill={COLORS.fuchsia.hex} filter={!theme.light ? "url(#glow-fuchsia)" : ""}>
                              <animateMotion dur="2s" begin={`${d}s`} repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear"><mpath href={`#path-${edge.id}`} /></animateMotion>
                            </circle>
                          ))}
                        </>
                      )}

                      {flowType === "websocket" && (
                        <>
                          {[0, 0.5, 1.0].map(d => (
                            <circle key={`ws-fwd-${d}`} r="3.5" fill={themeColor.hex} filter={!theme.light ? `url(#glow-${themeColor.name})` : ""}>
                              <animateMotion dur="1.5s" begin={`${d}s`} repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear"><mpath href={`#path-${edge.id}`} /></animateMotion>
                            </circle>
                          ))}
                          {[0.25, 0.75, 1.25].map(d => (
                            <circle key={`ws-rev-${d}`} r="3.5" fill={COLORS.emerald.hex} filter={!theme.light ? "url(#glow-emerald)" : ""}>
                              <animateMotion dur="1.5s" begin={`${d}s`} repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear"><mpath href={`#path-${edge.id}`} /></animateMotion>
                            </circle>
                          ))}
                        </>
                      )}

                      {flowType === "pubsub" && [0, 0.2, 0.4].map(d => (
                        <circle key={`ps-${d}`} r="4" fill={themeColor.hex} filter={!theme.light ? `url(#glow-${themeColor.name})` : ""}>
                          <animateMotion dur="2.5s" begin={`${d}s`} repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.1 0.8 0.3 1"><mpath href={`#path-${edge.id}`} /></animateMotion>
                          <animate attributeName="r" values="8;2" dur="2.5s" begin={`${d}s`} repeatCount="indefinite" />
                          <animate attributeName="opacity" values="1;0" dur="2.5s" begin={`${d}s`} repeatCount="indefinite" />
                        </circle>
                      ))}

                      {flowType === "tcp" && (
                        <>
                          <path d={pathD} stroke={themeColor.hex} fill="none" strokeWidth="4" strokeDasharray="10 30" opacity="0.8">
                            <animate attributeName="stroke-dashoffset" values="40;0" dur="1s" repeatCount="indefinite" />
                          </path>
                          <path d={pathD} stroke={theme.light ? "#666" : "#fff"} fill="none" strokeWidth="2" strokeDasharray="5 40" opacity="0.4">
                            <animate attributeName="stroke-dashoffset" values="0;45" dur="1.5s" repeatCount="indefinite" />
                          </path>
                        </>
                      )}

                      {flowType === "udp" && (
                        <path d={pathD} stroke={themeColor.hex} fill="none" strokeWidth="3" strokeDasharray="3 50" opacity="0.9">
                          <animate attributeName="stroke-dashoffset" values="53;0" dur="0.4s" repeatCount="indefinite" />
                        </path>
                      )}

                      {flowType === "dropped" && [0, 1.2].map(d => (
                        <circle key={`drop-${d}`} r="5" fill={COLORS.red.hex} filter={!theme.light ? "url(#glow-red)" : ""}>
                          <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.4;0.5;1" dur="2s" begin={`${d}s`} repeatCount="indefinite" />
                          <animateMotion dur="2s" begin={`${d}s`} repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear"><mpath href={`#path-${edge.id}`} /></animateMotion>
                        </circle>
                      ))}
                    </>
                  )}
                </g>
              );
            })}

            {tool === "link" && linkStartNode && (() => {
              const start = diagram.nodes.find(n => n.id === linkStartNode);
              if (!start) return null;
              return <path d={`M ${start.x + start.w / 2},${start.y + start.h / 2} L ${mousePos.x},${mousePos.y}`} stroke={activeColorObj.hex} strokeWidth="3" strokeDasharray="5 5" fill="none" className="animate-pulse drop-shadow-lg" />
            })()}
          </svg>

          <div className="absolute inset-0 overflow-visible pointer-events-none z-20">
            {diagram.nodes.map((node) => {
              const themeColor = COLORS[node.color] || COLORS.cyan;
              const isSelected = selectedId === node.id;
              const isEditing = editingNodeTextId === node.id;
              const isLinkingTarget = tool === "link" && linkStartNode && linkStartNode !== node.id;
              const SysIcon = SYSTEM_ICONS[node.type];

              const isText = node.type === "text" || node.type === "label";
              const isCloud = node.type === "cloud";

              const safeX = safeVal(node.x); const safeY = safeVal(node.y);
              const safeW = safeVal(node.w, 120); const safeH = isText ? "auto" : safeVal(node.h, 120);

              let shapeClasses = `absolute flex flex-col transition-transform ease-out pointer-events-auto `;

              let alignClass = node.align === 'left' ? 'items-start text-left' : node.align === 'right' ? 'items-end text-right' : 'items-center text-center';
              let valignClass = node.valign === 'top' ? 'justify-start' : node.valign === 'bottom' ? 'justify-end' : 'justify-center';

              let innerStyles = {
                backgroundColor: node.transparent ? 'transparent' : (theme.light ? themeColor.hex + "20" : themeColor.bg),
                transform: node.rotation ? `rotate(${node.rotation}deg)` : undefined
              };

              let boxShadows = [];
              if (isSelected && !theme.light) boxShadows.push(`0 0 12px ${themeColor.hex}60`);
              if (node.status === "throttled") boxShadows.push(`0 0 20px ${COLORS.amber.hex} inset`);
              if (boxShadows.length > 0) innerStyles.boxShadow = boxShadows.join(', ');

              if (node.status === "down") shapeClasses += " status-down ";
              if (node.status === "standby") shapeClasses += " status-standby ";

              if (isCloud || node.type === "diamond" || node.type === "hexagon" || node.type === "cylinder") {
                innerStyles.backgroundColor = "transparent";
                delete innerStyles.boxShadow;
              }

              if (isCloud) {
                shapeClasses += `bg-transparent ${isSelected ? "drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] z-50" : "drop-shadow-sm"}`;
              } else if (node.type === "rect" || SysIcon) {
                shapeClasses += `backdrop-blur-md rounded-xl border-2 ${isSelected ? "ring-2 ring-white/50 z-50" : "shadow-md"}`;
                innerStyles.borderColor = themeColor.hex;
              } else if (node.type === "circle") {
                shapeClasses += `backdrop-blur-md rounded-full border-2 ${isSelected ? "ring-2 ring-white/50 z-50" : "shadow-md"}`;
                innerStyles.borderColor = themeColor.hex;
              } else if (node.type === "diamond" || node.type === "hexagon" || node.type === "cylinder") {
                shapeClasses += `bg-transparent ${isSelected ? "drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] z-50" : "drop-shadow-sm"}`;
              }

              if (isText) {
                shapeClasses = `absolute flex pointer-events-auto bg-transparent ${isSelected && !isEditing ? "ring-1 ring-dashed ring-slate-400/50 hover:bg-white/5 rounded-lg z-50" : ""}`;
                innerStyles.backgroundColor = "transparent";
                delete innerStyles.boxShadow;
              }

              if (isLinkingTarget) shapeClasses += " ring-4 ring-white/50 scale-[1.02] cursor-pointer z-50";
              else if (tool === "pointer") shapeClasses += dragInfo?.id === node.id ? " cursor-grabbing opacity-90 z-[9999]" : " cursor-grab";

              return (
                <div id={`node_${node.id}`} key={node.id} className={`${shapeClasses} ${alignClass} ${valignClass}`} style={{ left: safeX, top: safeY, width: safeW, height: safeH, minHeight: isText ? safeVal(node.h, 40) : undefined, ...innerStyles, zIndex: dragInfo?.id === node.id ? 9999 : (node.zOffset || 20) }}
                  onPointerDown={(e) => { if (node.type === "rect" || node.type === "circle" || SysIcon || isText) handleNodePointerDown(e, node); }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (tool !== "pointer") return;
                    const scale = camera.z;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const newNode = { id: generateId("l"), type: "label", x: (e.clientX - rect.left) / scale + node.x, y: (e.clientY - rect.top) / scale + node.y, w: 100, h: 40, color: activeColor, text: "", size: 14, bold: true, align: 'center', valign: 'center', zOffset: 50 };
                    pushToHistory({ ...diagram, nodes: [...diagram.nodes, newNode] });
                    setSelectedId(newNode.id); setEditingNodeTextId(newNode.id);
                  }}
                >
                  {node.notes && !isEditing && (
                    <div className="absolute top-1 right-1 z-50 cursor-pointer text-amber-400 drop-shadow-md hover:scale-110 transition-transform no-canvas-click" onPointerDown={(e) => { e.stopPropagation(); setOpenNoteId(node.id); }}>
                      <StickyNote size={14} />
                    </div>
                  )}

                  {node.type === "diamond" && (
                    <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                      <polygon onPointerDown={(e) => handleNodePointerDown(e, node)} className="pointer-events-auto" points={`${safeW / 2},0 ${safeW},${safeH / 2} ${safeW / 2},${safeH} 0,${safeH / 2}`} fill={node.transparent ? "transparent" : (theme.light ? themeColor.hex + "20" : themeColor.bg)} stroke={themeColor.hex} strokeWidth="2" />
                    </svg>
                  )}
                  {node.type === "hexagon" && (
                    <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                      <polygon onPointerDown={(e) => handleNodePointerDown(e, node)} className="pointer-events-auto" points={`${safeW * 0.25},0 ${safeW * 0.75},0 ${safeW},${safeH / 2} ${safeW * 0.75},${safeH} ${safeW * 0.25},${safeH} 0,${safeH / 2}`} fill={node.transparent ? "transparent" : (theme.light ? themeColor.hex + "20" : themeColor.bg)} stroke={themeColor.hex} strokeWidth="2" />
                    </svg>
                  )}
                  {node.type === "cloud" && (
                    <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path onPointerDown={(e) => handleNodePointerDown(e, node)} className="pointer-events-auto" vectorEffect="non-scaling-stroke" d="M 25,90 C 5,90 0,70 15,50 C 15,20 40,10 60,30 C 80,5 100,20 95,50 C 100,70 90,90 75,90 Z" fill={node.transparent ? "transparent" : (theme.light ? themeColor.hex + "20" : themeColor.bg)} stroke={themeColor.hex} strokeWidth="2" />
                    </svg>
                  )}
                  {node.type === "cylinder" && (
                    <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                      <path onPointerDown={(e) => handleNodePointerDown(e, node)} className="pointer-events-auto" d={`M 0,15 A ${safeW / 2},15 0 0,0 ${safeW},15 L ${safeW},${safeH - 15} A ${safeW / 2},15 0 0,1 0,${safeH - 15} Z`} fill={node.transparent ? "transparent" : (theme.light ? themeColor.hex + "20" : themeColor.bg)} stroke={themeColor.hex} strokeWidth="2" />
                      <ellipse onPointerDown={(e) => handleNodePointerDown(e, node)} className="pointer-events-auto" cx={safeW / 2} cy="15" rx={safeW / 2} ry="15" fill={node.transparent ? "transparent" : (theme.light ? themeColor.hex + "20" : themeColor.bg)} stroke={themeColor.hex} strokeWidth="2" />
                    </svg>
                  )}

                  {SysIcon && (
                    <div className={`p-2 rounded-lg bg-black/30 mb-1 z-30 flex-shrink-0`}><SysIcon size={32} color={themeColor.hex} /></div>
                  )}

                  {(node.text !== undefined || isEditing) && (
                    <div
                      ref={isEditing ? textInputRef : null}
                      contentEditable={isEditing} suppressContentEditableWarning
                      onBlur={(e) => {
                        const val = e.currentTarget.textContent;
                        const ns = { ...stateRef.current, nodes: stateRef.current.nodes.map(n => n.id === node.id ? { ...n, text: val } : n).filter(n => !(n.type === 'text' && !n.text)) };
                        setDiagram(ns);
                        setEditingNodeTextId(null);
                        pushToHistory(ns);
                      }}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.currentTarget.blur(); } }}
                      className={`outline-none break-words whitespace-pre-wrap w-full pointer-events-auto ${theme.light && !isEditing ? "text-slate-800" : themeColor.text} ${node.bold ? "font-bold" : "font-normal"} ${isEditing ? "bg-black/90 ring-2 ring-indigo-500 rounded p-1 text-white z-[9999]" : "bg-transparent p-0 m-0"}`}
                      style={{ fontSize: `${node.size || 14}px`, zIndex: 30 }}
                      onDoubleClick={(e) => { e.stopPropagation(); setEditingNodeTextId(node.id); setTool("pointer"); setSelectedId(node.id); }}
                      onPointerDown={(e) => { if (isEditing) e.stopPropagation(); }}
                    >
                      {node.text}
                    </div>
                  )}

                  {openNoteId === node.id && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-amber-100 p-2 rounded shadow-xl border border-amber-300 z-[99999] no-canvas-click text-slate-800 text-sm">
                      <textarea autoFocus value={node.notes || ""} placeholder="Add description..."
                        className="w-full bg-transparent outline-none resize-none h-24 font-mono text-xs"
                        onPointerDown={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDiagram(prev => ({ ...prev, nodes: prev.nodes.map(n => n.id === node.id ? { ...n, notes: val } : n) }));
                        }}
                        onBlur={() => {
                          setOpenNoteId(null);
                          pushToHistory(stateRef.current);
                        }}
                      />
                    </div>
                  )}

                  {isSelected && tool === "pointer" && !isEditing && RESIZE_HANDLES.map((handle, i) => (
                    <div key={i} className="absolute w-[12px] h-[12px] bg-white rounded-sm shadow-[0_0_5px_rgba(0,0,0,0.8)] border border-indigo-500 z-[9999] no-canvas-click"
                      style={{ top: handle.top, left: handle.left, right: handle.right, bottom: handle.bottom, cursor: handle.cursor }}
                      onPointerDown={(e) => {
                        if (tool !== "pointer") return; e.stopPropagation();
                        const childrenInside = diagram.nodes
                          .filter(n => n.id !== node.id && n.x >= node.x && n.y >= node.y && n.x + n.w <= node.x + node.w && n.y + n.h <= node.y + node.h)
                          .map(c => ({ id: c.id, startX: c.x, startY: c.y, startW: c.w, startH: c.h }));

                        setResizeInfo({ id: node.id, dir: handle.dir, startX: node.x, startY: node.y, startW: node.w, startH: node.h, startMouseX: getWorldPos(e.clientX, e.clientY).x, startMouseY: getWorldPos(e.clientX, e.clientY).y, children: childrenInside });
                      }}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {selectedId?.startsWith('e_') && (() => {
          const edge = diagram.edges.find(e => e.id === selectedId);
          if (!edge) return null;
          const source = diagram.nodes.find(n => n.id === edge.source);
          const target = diagram.nodes.find(n => n.id === edge.target);
          if (!source && !(dragPortInfo?.edgeId === edge.id && dragPortInfo?.type === "source")) return null;
          if (!target && !(dragPortInfo?.edgeId === edge.id && dragPortInfo?.type === "target")) return null;

          const siblings = diagram.edges.filter(e => (e.source === edge.source && e.target === edge.target) || (e.source === edge.target && e.target === edge.source));
          siblings.sort((a, b) => a.id.localeCompare(b.id));
          const routing = getEdgePathData(source, target, edge, dragPortInfo, siblings.findIndex(e => e.id === edge.id), siblings.length);
          if (!routing) return null;

          const { midX, midY, start, end } = routing;
          const themeColor = COLORS[edge.color] || COLORS.cyan;

          return (
            <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none no-capture" style={{ zIndex: 99990, transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.z})`, transformOrigin: "0 0" }}>
              <circle cx={safeVal(midX)} cy={safeVal(midY)} r="15" fill="transparent" className="pointer-events-auto cursor-move" onPointerDown={(e) => { if (tool === 'pointer') { e.stopPropagation(); setDragEdgeCpInfo({ id: edge.id }); } }} />
              <circle cx={safeVal(start.x)} cy={safeVal(start.y)} r="15" fill="transparent" className="pointer-events-auto cursor-crosshair" onPointerDown={(e) => { if (tool === 'pointer') { e.stopPropagation(); setDragPortInfo({ edgeId: edge.id, type: "source" }); } }} />
              <circle cx={safeVal(end.x)} cy={safeVal(end.y)} r="15" fill="transparent" className="pointer-events-auto cursor-crosshair" onPointerDown={(e) => { if (tool === 'pointer') { e.stopPropagation(); setDragPortInfo({ edgeId: edge.id, type: "target" }); } }} />

              <circle cx={safeVal(midX)} cy={safeVal(midY)} r="6" fill={themeColor.hex} stroke="#fff" strokeWidth="2" className="pointer-events-none drop-shadow-md" />
              <circle cx={safeVal(start.x)} cy={safeVal(start.y)} r="8" fill={themeColor.hex} stroke="#fff" strokeWidth="2" className="pointer-events-none drop-shadow-md" />
              <circle cx={safeVal(end.x)} cy={safeVal(end.y)} r="8" fill={themeColor.hex} stroke="#fff" strokeWidth="2" className="pointer-events-none drop-shadow-md" />
            </svg>
          );
        })()}

        <svg className="absolute inset-0 w-full h-full pointer-events-none no-capture z-[99990]"><g style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.z})`, transformOrigin: "0 0" }}><g ref={laserGroupRef} filter="url(#glow-red)" className="drop-shadow-2xl" /><g ref={laserCoreRef} className="drop-shadow-lg" /></g></svg>

        {screenshotArea && (
          <div className="absolute border-2 border-dashed border-white bg-white/10 pointer-events-none z-[99999] no-capture" style={{
            left: safeVal(screenshotArea.selecting ? Math.min(screenshotArea.startX, screenshotArea.endX) : screenshotArea.x),
            top: safeVal(screenshotArea.selecting ? Math.min(screenshotArea.startY, screenshotArea.endY) : screenshotArea.y),
            width: safeVal(screenshotArea.selecting ? Math.abs(screenshotArea.startX - screenshotArea.endX) : screenshotArea.w),
            height: safeVal(screenshotArea.selecting ? Math.abs(screenshotArea.startY - screenshotArea.endY) : screenshotArea.h),
          }} />
        )}
        {screenshotArea && !screenshotArea.selecting && (
          <div className="absolute z-[99999] flex items-center gap-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-2 rounded-xl shadow-2xl no-capture" style={{ left: safeVal(screenshotArea.x + screenshotArea.w / 2), top: safeVal(screenshotArea.y + screenshotArea.h + 10), transform: "translateX(-50%)" }}>
            <button onClick={() => handleExportPNG("png")} disabled={isExporting} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 font-bold text-sm"><Download size={14} /> PNG</button>
            <button onClick={() => handleExportPNG("copy")} disabled={isExporting} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 font-bold text-sm"><ClipboardCopy size={14} /> Copy</button>
            <button onClick={() => { setScreenshotArea(null); setTool("pointer"); }} className="p-1.5 text-slate-400 hover:text-white"><XCircle size={18} /></button>
          </div>
        )}
      </div>

      {!dragEdgeCpInfo && !dragPortInfo && (
        <EdgeContextMenu
          selectedId={selectedId}
          edgeMenuPos={edgeMenuPos}
          getMenuLeft={getMenuLeft}
          getMenuTop={getMenuTop}
          diagram={diagram}
          setDiagram={setDiagram}
          pushToHistory={pushToHistory}
          setSelectedId={setSelectedId}
        />
      )}

      {tool === "pointer" && !dragInfo && !resizeInfo && !editingNodeTextId && (
        <NodeContextMenu
          selectedId={selectedId}
          nodeMenuPos={nodeMenuPos}
          getMenuLeft={getMenuLeft}
          getMenuTop={getMenuTop}
          diagram={diagram}
          setDiagram={setDiagram}
          pushToHistory={pushToHistory}
          setOpenNoteId={setOpenNoteId}
          createFailover={createFailover}
          setSelectedId={setSelectedId}
        />
      )}
    </>
  );
}
