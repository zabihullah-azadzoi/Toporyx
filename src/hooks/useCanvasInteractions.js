import { useCallback, useEffect } from 'react';

export function useCanvasInteractions({
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
}) {
  const startLaserRender = useCallback(() => {
    if (laserRafRef.current) return;
    const render = () => {
      const now = Date.now();
      laserPointsRef.current = laserPointsRef.current.filter((p) => now - p.time < 400);
      if (laserPointsRef.current.length > 0 && laserGroupRef.current && laserCoreRef.current) {
        let glowHtml = '';
        let coreHtml = '';
        for (let i = 0; i < laserPointsRef.current.length - 1; i += 1) {
          const p1 = laserPointsRef.current[i];
          const p2 = laserPointsRef.current[i + 1];
          const life = Math.max(0, 1 - (now - p2.time) / 400);
          glowHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#ef4444" stroke-width="${life * 12}" stroke-linecap="round" opacity="${life}" />`;
          coreHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#ffffff" stroke-width="${life * 4}" stroke-linecap="round" opacity="${life}" />`;
        }
        laserGroupRef.current.innerHTML = glowHtml;
        laserCoreRef.current.innerHTML = coreHtml;
        laserRafRef.current = requestAnimationFrame(render);
      } else {
        if (laserGroupRef.current) laserGroupRef.current.innerHTML = '';
        if (laserCoreRef.current) laserCoreRef.current.innerHTML = '';
        laserRafRef.current = null;
      }
    };
    laserRafRef.current = requestAnimationFrame(render);
  }, [laserCoreRef, laserGroupRef, laserPointsRef, laserRafRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const handleWheel = (e) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        setCamera((prev) => {
          const newZ = Math.max(0.05, Math.min(5, prev.z * Math.exp(-e.deltaY * 0.002)));
          const rect = container.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          return { x: mouseX - ((mouseX - prev.x) / prev.z) * newZ, y: mouseY - ((mouseY - prev.y) / prev.z) * newZ, z: newZ };
        });
      } else {
        setCamera((prev) => ({ ...prev, x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
      }
    };
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [containerRef, setCamera]);

  const handlePointerMove = useCallback((e) => {
    if (!containerRef.current || e.clientX === undefined) return;
    const inter = interRef.current;

    if (inter.panInfo) {
      setCamera((prev) => ({ ...prev, x: inter.panInfo.startX + (e.clientX - inter.panInfo.startMouseX), y: inter.panInfo.startY + (e.clientY - inter.panInfo.startMouseY) }));
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const worldX = (e.clientX - rect.left - inter.camera.x) / inter.camera.z;
    const worldY = (e.clientY - rect.top - inter.camera.y) / inter.camera.z;
    const worldPos = { x: worldX, y: worldY };

    setMousePos(worldPos);

    if (inter.tool === 'laser') {
      laserPointsRef.current.push({ x: worldPos.x, y: worldPos.y, time: Date.now() });
      startLaserRender();
    }

    if (inter.tool === 'pencil' && inter.drawingInfo?.isDrawing) {
      setDiagram((prev) => ({
        ...prev,
        drawings: prev.drawings.map((d) => (d.id === inter.drawingInfo.id ? { ...d, points: [...d.points, { x: worldPos.x, y: worldPos.y }] } : d)),
      }));
    }

    if (inter.screenshotArea?.selecting) {
      setScreenshotArea((prev) => ({ ...prev, endX: e.clientX - rect.left, endY: e.clientY - rect.top }));
    }

    if (inter.drawingInfo && !inter.drawingInfo.isDrawing) {
      const { id, startX, startY } = inter.drawingInfo;
      const newX = Math.min(startX, worldPos.x);
      const newY = Math.min(startY, worldPos.y);
      const newW = Math.abs(worldPos.x - startX);
      const newH = Math.abs(worldPos.y - startY);
      setDiagram((prev) => ({ ...prev, nodes: prev.nodes.map((n) => (n.id === id ? { ...n, x: newX, y: newY, w: newW, h: newH } : n)) }));
    } else if (inter.dragInfo) {
      const dx = worldPos.x - inter.dragInfo.startMouseWorldX;
      const dy = worldPos.y - inter.dragInfo.startMouseWorldY;
      setDiagram((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) => {
          if (n.id === inter.dragInfo.id) return { ...n, x: inter.dragInfo.startX + dx, y: inter.dragInfo.startY + dy };
          const childInfo = inter.dragInfo.children?.find((c) => c.id === n.id);
          if (childInfo) return { ...n, x: childInfo.startX + dx, y: childInfo.startY + dy };
          return n;
        }),
      }));
    } else if (inter.dragPortInfo) {
      setDragPortInfo((prev) => ({ ...prev, x: worldPos.x, y: worldPos.y }));
    } else if (inter.dragEdgeCpInfo) {
      setDiagram((prev) => ({
        ...prev,
        edges: prev.edges.map((edge) => {
          if (edge.id === inter.dragEdgeCpInfo.id) {
            const source = prev.nodes.find((n) => n.id === edge.source);
            const target = prev.nodes.find((n) => n.id === edge.target);
            if (source && target) {
              const start = getConnectionPoint(source, edge.sourcePort || 'auto', target.x + target.w / 2, target.y + target.h / 2, edge.sourceRel);
              const end = getConnectionPoint(target, edge.targetPort || 'auto', source.x + source.w / 2, source.y + source.h / 2, edge.targetRel);
              const centerX = (start.x + end.x) / 2;
              const centerY = (start.y + end.y) / 2;
              return { ...edge, cp: { dx: (worldPos.x - centerX) / 2, dy: (worldPos.y - centerY) / 2 } };
            }
          }
          return edge;
        }),
      }));
    } else if (inter.resizeInfo) {
      setDiagram((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) => {
          if (n.id === inter.resizeInfo.id) {
            const { startW, startH, startX, startY, startMouseX, startMouseY, dir } = inter.resizeInfo;
            const dx = worldPos.x - startMouseX;
            const dy = worldPos.y - startMouseY;
            let newW = startW;
            let newH = startH;
            let newX = startX;
            let newY = startY;

            if (dir.includes('e')) newW = startW + dx;
            if (dir.includes('w')) { newW = startW - dx; newX = startX + dx; }
            if (dir.includes('s')) newH = startH + dy;
            if (dir.includes('n')) { newH = startH - dy; newY = startY + dy; }

            const minSize = n.type === 'text' || n.type === 'label' ? 20 : 60;
            if (newW < minSize) { newX += (newW - minSize); newW = minSize; }
            if (newH < minSize) { newY += (newH - minSize); newH = minSize; }
            return { ...n, w: newW, h: newH, x: newX, y: newY };
          }

          const childInfo = inter.resizeInfo.children?.find((c) => c.id === n.id);
          if (childInfo) {
            const parentNode = prev.nodes.find((pn) => pn.id === inter.resizeInfo.id);
            if (parentNode) {
              const scaleX = parentNode.w / inter.resizeInfo.startW;
              const scaleY = parentNode.h / inter.resizeInfo.startH;
              return {
                ...n,
                x: parentNode.x + (childInfo.startX - inter.resizeInfo.startX) * scaleX,
                y: parentNode.y + (childInfo.startY - inter.resizeInfo.startY) * scaleY,
                w: childInfo.startW * scaleX,
                h: childInfo.startH * scaleY,
              };
            }
          }
          return n;
        }),
      }));
    }
  }, [containerRef, interRef, setCamera, setMousePos, laserPointsRef, startLaserRender, setDiagram, setScreenshotArea, setDragPortInfo, getConnectionPoint]);

  const handlePointerUp = useCallback((e) => {
    const inter = interRef.current;

    if (inter.drawingInfo) {
      if (inter.tool === 'pencil') {
        pushToHistory(stateRef.current);
      } else {
        let finalNodeId = null;
        setDiagram((prev) => {
          const newNodes = prev.nodes.map((n) => {
            if (n.id === inter.drawingInfo.id) {
              let w = n.w;
              let h = n.h;
              if (w < 5 && h < 5) { w = n.type === 'text' || n.type === 'label' ? 150 : 120; h = n.type === 'text' || n.type === 'label' ? 40 : 120; } else { w = Math.max(w, 20); h = Math.max(h, 20); }
              finalNodeId = n.id;
              return { ...n, w, h };
            }
            return n;
          });
          return { ...prev, nodes: newNodes };
        });
        setTimeout(() => {
          pushToHistory(stateRef.current);
          setTool('pointer');
          if (['text', 'label', 'rect', 'cloud', 'circle', 'diamond', 'hexagon', 'cylinder'].includes(inter.drawingInfo.type)) {
            setEditingNodeTextId(finalNodeId);
          }
        }, 10);
      }
      setDrawingInfo(null);
    }

    if (inter.tool === 'screenshot' && inter.screenshotArea?.selecting) {
      const area = inter.screenshotArea;
      const w = Math.abs(area.startX - area.endX);
      const h = Math.abs(area.startY - area.endY);
      if (w > 20 && h > 20) setScreenshotArea({ ...area, x: Math.min(area.startX, area.endX), y: Math.min(area.startY, area.endY), w, h, selecting: false });
      else { setScreenshotArea(null); setTool('pointer'); }
    }

    if (e && e.clientX !== undefined) {
      const rect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
      const worldPos = {
        x: (e.clientX - rect.left - inter.camera.x) / inter.camera.z,
        y: (e.clientY - rect.top - inter.camera.y) / inter.camera.z,
      };
      const { nodes: currentNodes, edges: currentEdges } = stateRef.current;

      if (inter.tool === 'link' && inter.linkStartNode) {
        const hitNode = currentNodes
          .sort((a, b) => (b.zOffset || 0) - (a.zOffset || 0))
          .find((n) => n.id !== inter.linkStartNode && n.type !== 'text' && n.type !== 'label' && worldPos.x >= n.x && worldPos.x <= n.x + n.w && worldPos.y >= n.y && worldPos.y <= n.y + n.h);

        if (hitNode) {
          const newEdge = { id: generateId('e'), source: inter.linkStartNode, target: hitNode.id, color: inter.activeColor, direction: 'forward', flow: 'default', sourcePort: 'auto', targetPort: 'auto' };
          const newState = { ...stateRef.current, edges: [...currentEdges, newEdge] };
          setDiagram(newState);
          pushToHistory(newState);
        }
        setLinkStartNode(null);
      }

      let splitHappened = false;
      if (inter.dragInfo && inter.dragInfo.id) {
        const draggedNode = currentNodes.find((n) => n.id === inter.dragInfo.id);
        if (draggedNode && !['text', 'label', 'rect', 'cloud'].includes(draggedNode.type)) {
          const nx = draggedNode.x + draggedNode.w / 2;
          const ny = draggedNode.y + draggedNode.h / 2;
          let edgeToSplit = null;

          for (const edge of currentEdges) {
            if (edge.source === draggedNode.id || edge.target === draggedNode.id) continue;
            const sourceNode = currentNodes.find((n) => n.id === edge.source);
            const targetNode = currentNodes.find((n) => n.id === edge.target);
            if (!sourceNode || !targetNode) continue;

            const siblings = currentEdges.filter((item) => (item.source === edge.source && item.target === edge.target) || (item.source === edge.target && item.target === edge.source));
            siblings.sort((a, b) => a.id.localeCompare(b.id));

            const routing = getEdgePathData(sourceNode, targetNode, edge, null, siblings.findIndex((item) => item.id === edge.id), siblings.length);
            if (!routing) continue;

            let minD = Infinity;
            for (let t = 0; t <= 1; t += 0.05) {
              const pt = edge.cp
                ? { x: (1 - t) ** 2 * routing.start.x + 2 * (1 - t) * t * routing.midX + t ** 2 * routing.end.x, y: (1 - t) ** 2 * routing.start.y + 2 * (1 - t) * t * routing.midY + t ** 2 * routing.end.y }
                : { x: (1 - t) ** 3 * routing.start.x + 3 * (1 - t) ** 2 * t * routing.cp1x + 3 * (1 - t) * t ** 2 * routing.cp2x + t ** 3 * routing.end.x, y: (1 - t) ** 3 * routing.start.y + 3 * (1 - t) ** 2 * t * routing.cp1y + 3 * (1 - t) * t ** 2 * routing.cp2y + t ** 3 * routing.end.y };
              const d = Math.sqrt((pt.x - nx) ** 2 + (pt.y - ny) ** 2);
              if (d < minD) minD = d;
            }
            if (minD < 60) { edgeToSplit = edge; break; }
          }

          if (edgeToSplit) {
            const filteredEdges = currentEdges.filter((item) => item.id !== edgeToSplit.id);
            const newEdge1 = { ...edgeToSplit, id: generateId('e'), target: draggedNode.id, targetPort: 'auto', targetRel: null };
            const newEdge2 = { ...edgeToSplit, id: generateId('e'), source: draggedNode.id, sourcePort: 'auto', sourceRel: null };
            const newState = { ...stateRef.current, edges: [...filteredEdges, newEdge1, newEdge2] };
            setDiagram(newState);
            pushToHistory(newState);
            splitHappened = true;
          }
        }
      }

      if (inter.dragPortInfo) {
        const hitNode = [...currentNodes]
          .sort((a, b) => (b.zOffset || 0) - (a.zOffset || 0))
          .find((n) => n.type !== 'text' && n.type !== 'label' && worldPos.x >= n.x && worldPos.x <= n.x + n.w && worldPos.y >= n.y && worldPos.y <= n.y + n.h);

        if (hitNode) {
          const modifiedEdges = currentEdges.map((edge) => {
            if (edge.id !== inter.dragPortInfo.edgeId) return edge;
            const cx = hitNode.x + hitNode.w / 2;
            const cy = hitNode.y + (hitNode.h / 2 || 20);
            let dx = worldPos.x - cx;
            let dy = worldPos.y - cy;
            if (dx === 0 && dy === 0) dy = -1;
            const hw = hitNode.w / 2 || 1;
            const hh = hitNode.h / 2 || 20;
            const relX = dx / hw;
            const relY = dy / hh;

            return inter.dragPortInfo.type === 'source'
              ? { ...edge, source: hitNode.id, sourcePort: 'custom', sourceRel: { x: relX, y: relY }, cp: null }
              : { ...edge, target: hitNode.id, targetPort: 'custom', targetRel: { x: relX, y: relY }, cp: null };
          });
          setDiagram((prev) => ({ ...prev, edges: modifiedEdges }));
          pushToHistory({ ...stateRef.current, edges: modifiedEdges });
        } else {
          const modifiedEdges = currentEdges.filter((edge) => edge.id !== inter.dragPortInfo.edgeId);
          setDiagram((prev) => ({ ...prev, edges: modifiedEdges }));
          pushToHistory({ ...stateRef.current, edges: modifiedEdges });
          setSelectedId(null);
        }
      }

      if (!splitHappened && (inter.dragInfo || inter.dragEdgeCpInfo || inter.resizeInfo)) {
        pushToHistory(stateRef.current);
      }
    }

    setDragInfo(null);
    setDragPortInfo(null);
    setDragEdgeCpInfo(null);
    setResizeInfo(null);
    setPanInfo(null);
  }, [interRef, pushToHistory, stateRef, setDiagram, setTool, setEditingNodeTextId, setDrawingInfo, setScreenshotArea, containerRef, generateId, setLinkStartNode, getEdgePathData, setSelectedId, setDragInfo, setDragPortInfo, setDragEdgeCpInfo, setResizeInfo, setPanInfo]);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const handleCanvasPointerDown = useCallback((e) => {
    if (e.target.closest('.no-canvas-click') || e.target.closest('.no-capture')) return;

    setShowColorPicker(false);
    setShowProfileMenu(false);

    if (e.button === 1 || tool === 'pan') {
      setPanInfo({ startX: camera.x, startY: camera.y, startMouseX: e.clientX, startMouseY: e.clientY });
      return;
    }

    if (tool === 'screenshot') {
      const rect = containerRef.current.getBoundingClientRect();
      setScreenshotArea({ startX: e.clientX - rect.left, startY: e.clientY - rect.top, endX: e.clientX - rect.left, endY: e.clientY - rect.top, selecting: true });
      return;
    }

    setEditingNodeTextId(null);
    setSelectedId(null);
    setLinkStartNode(null);
    setOpenNoteId(null);
    setSidebarOpen(false);

    if (tool === 'pencil') {
      const worldPos = getWorldPos(e.clientX, e.clientY);
      const newDrawing = { id: generateId('d'), type: 'pencil', color: activeColor, points: [{ x: worldPos.x, y: worldPos.y }] };
      setDiagram((prev) => ({ ...prev, drawings: [...prev.drawings, newDrawing] }));
      setDrawingInfo({ isDrawing: true, id: newDrawing.id });
      return;
    }

    if (tool !== 'pointer' && tool !== 'link' && tool !== 'laser') {
      const worldPos = getWorldPos(e.clientX, e.clientY);
      const isGeneral = ['rect', 'circle', 'diamond', 'hexagon', 'cylinder', 'cloud', 'text', 'label'].includes(tool);
      const newNodeText = isGeneral ? '' : (tool.charAt(0).toUpperCase() + tool.slice(1));

      const newNode = {
        id: generateId(tool === 'label' || tool === 'text' ? 'l' : 'n'),
        type: tool,
        x: worldPos.x,
        y: worldPos.y,
        w: 0,
        h: 0,
        color: activeColor,
        zOffset: 0,
        text: newNodeText,
        size: tool === 'text' || tool === 'label' ? 16 : 14,
        bold: tool !== 'text',
        status: 'healthy',
        align: 'center',
        valign: 'center',
        transparent: false,
      };
      setDiagram((prev) => ({ ...prev, nodes: [...prev.nodes, newNode] }));
      setSelectedId(newNode.id);
      setDrawingInfo({ id: newNode.id, startX: worldPos.x, startY: worldPos.y, type: tool });
    }
  }, [activeColor, camera.x, camera.y, containerRef, generateId, getWorldPos, setDiagram, setDrawingInfo, setLinkStartNode, setOpenNoteId, setPanInfo, setScreenshotArea, setSelectedId, setShowColorPicker, setShowProfileMenu, setSidebarOpen, setEditingNodeTextId, tool]);

  const handleNodePointerDown = useCallback((e, node) => {
    setShowColorPicker(false);
    setShowProfileMenu(false);
    if (tool !== 'pointer' && tool !== 'link') return;
    if (editingNodeTextId === node.id || tool === 'pan' || tool === 'screenshot' || e.button === 1) return;

    e.stopPropagation();
    setSelectedId(node.id);
    setEditingNodeTextId(null);
    setSidebarOpen(false);

    if (tool === 'pointer') {
      const worldPos = getWorldPos(e.clientX, e.clientY);
      const childrenInside = diagram.nodes
        .filter((n) => n.id !== node.id && n.x >= node.x && n.y >= node.y && n.x + n.w <= node.x + node.w && n.y + n.h <= node.y + node.h)
        .map((c) => ({ id: c.id, startX: c.x, startY: c.y, startW: c.w, startH: c.h }));
      setDragInfo({ id: node.id, startX: node.x, startY: node.y, startMouseWorldX: worldPos.x, startMouseWorldY: worldPos.y, children: childrenInside });
    } else if (tool === 'link') {
      if (node.type === 'text' || node.type === 'label') return;
      setLinkStartNode(node.id);
    }
  }, [setShowColorPicker, setShowProfileMenu, tool, editingNodeTextId, setSelectedId, setEditingNodeTextId, setSidebarOpen, getWorldPos, diagram.nodes, setDragInfo, setLinkStartNode]);

  return { handleCanvasPointerDown, handleNodePointerDown };
}
