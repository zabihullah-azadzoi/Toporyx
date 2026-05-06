import { useCallback } from 'react';

export function useEdgeRouting(containerRef, camera) {
  const getWorldPos = useCallback((clientX, clientY) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return { x: (clientX - rect.left - camera.x) / camera.z, y: (clientY - rect.top - camera.y) / camera.z };
  }, [containerRef, camera]);

  const getConnectionPoint = useCallback((node, port, cx, cy, relPos) => {
    if (!node) return { x: 0, y: 0, nx: 0, ny: 0 };
    const hw = Math.max(1, node.w / 2);
    const hh = Math.max(1, (node.h || 40) / 2);
    const center = { x: node.x + hw, y: node.y + hh };

    let dx = 0;
    let dy = 0;

    if (port === 'custom' && relPos) {
      dx = relPos.x * hw;
      dy = relPos.y * hh;
      if (dx === 0 && dy === 0) dy = -hh;
    } else if (port === 'top') { dy = -hh; }
    else if (port === 'bottom') { dy = hh; }
    else if (port === 'left') { dx = -hw; }
    else if (port === 'right') { dx = hw; }
    else {
      dx = cx - center.x;
      dy = cy - center.y;
      if (dx === 0 && dy === 0) dy = -hh;
    }

    let t = 1;
    let nx = 0;
    let ny = 0;

    if (node.type === 'circle' || node.type === 'cloud' || node.type === 'cylinder') {
      const scale = node.type === 'cloud' ? 0.8 : (node.type === 'cylinder' ? 0.95 : 1);
      t = 1 / (Math.sqrt(Math.pow(dx / (hw * scale), 2) + Math.pow(dy / (hh * scale), 2)) || 1);
      nx = dx;
      ny = dy;
    } else if (node.type === 'diamond') {
      t = 1 / ((Math.abs(dx) / hw + Math.abs(dy) / hh) || 1);
      nx = Math.sign(dx);
      ny = Math.sign(dy);
    } else if (node.type === 'hexagon') {
      t = 1 / (Math.max(Math.abs(dy) / hh, Math.abs(dx) / hw + Math.abs(dy) / (2 * hh)) || 1);
      nx = Math.sign(dx);
      ny = Math.sign(dy);
    } else {
      t = Math.min(Math.abs(hw / dx), Math.abs(hh / dy));
      if (!isFinite(t)) t = 1;
      if (Math.abs(hw / dx) < Math.abs(hh / dy)) { nx = Math.sign(dx); ny = 0; }
      else { nx = 0; ny = Math.sign(dy); }
    }

    const dist = Math.sqrt(dx * dx + dy * dy);
    nx = (nx === 0 && ny === 0 && dist > 0) ? dx / dist : nx;
    const nDist = Math.sqrt(nx * nx + ny * ny) || 1;

    return { x: center.x + dx * t, y: center.y + dy * t, nx: nx / nDist, ny: ny / nDist };
  }, []);

  const getEdgePathData = useCallback((source, target, edge, dragPortInfo, siblingIndex = 0, siblingCount = 1) => {
    if (!source || !target) return null;

    const sc = { x: source.x + source.w / 2, y: source.y + (source.h || 40) / 2 };
    const tc = { x: target.x + target.w / 2, y: target.y + (target.h || 40) / 2 };

    let start = { x: 0, y: 0, nx: 0, ny: 0 };
    let end = { x: 0, y: 0, nx: 0, ny: 0 };
    let pathD;
    let midX;
    let midY;
    let cp1x;
    let cp1y;
    let cp2x;
    let cp2y;

    if (dragPortInfo && dragPortInfo.edgeId === edge.id) {
      if (dragPortInfo.type === 'source') {
        start = { x: dragPortInfo.x, y: dragPortInfo.y, nx: 0, ny: 0 };
        end = getConnectionPoint(target, edge.targetPort || 'auto', start.x, start.y, edge?.targetRel);
      } else {
        end = { x: dragPortInfo.x, y: dragPortInfo.y, nx: 0, ny: 0 };
        start = getConnectionPoint(source, edge.sourcePort || 'auto', end.x, end.y, edge?.sourceRel);
      }

      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dragPortInfo.type === 'source') {
        start.nx = dist ? dx / dist : 0;
        start.ny = dist ? dy / dist : 0;
      } else {
        end.nx = dist ? -dx / dist : 0;
        end.ny = dist ? -dy / dist : 0;
      }

      let sNx = start.nx || 0;
      let sNy = start.ny || 0;
      let eNx = end.nx || 0;
      let eNy = end.ny || 0;
      if (sNx === 0 && sNy === 0 && eNx === 0 && eNy === 0) { sNx = dist ? dx / dist : 0; sNy = dist ? dy / dist : 0; eNx = -sNx; eNy = -sNy; }
      else if (sNx === 0 && sNy === 0) { sNx = -eNx; sNy = -eNy; }
      else if (eNx === 0 && eNy === 0) { eNx = -sNx; eNy = -sNy; }

      const offset = Math.min(dist * 0.4, 150);
      cp1x = start.x + sNx * offset; cp1y = start.y + sNy * offset;
      cp2x = end.x + eNx * offset; cp2y = end.y + eNy * offset;
      pathD = `M ${start.x},${start.y} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${end.x},${end.y}`;
      const t = 0.5; const u = 1 - t;
      midX = u * u * u * start.x + 3 * u * u * t * cp1x + 3 * u * t * t * cp2x + t * t * t * end.x;
      midY = u * u * u * start.y + 3 * u * u * t * cp1y + 3 * u * t * t * cp2y + t * t * t * end.y;

      return { pathD, midX, midY, start, end, cp1x, cp1y, cp2x, cp2y };
    }

    let isCurved = false;
    let cpX = (sc.x + tc.x) / 2;
    let cpY = (sc.y + tc.y) / 2;

    if (edge.cp) {
      isCurved = true;
      cpX += edge.cp.dx * 2;
      cpY += edge.cp.dy * 2;
    } else if (siblingCount > 1) {
      isCurved = true;
      const dx = tc.x - sc.x; const dy = tc.y - sc.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let nx = dist ? -dy / dist : 0;
      let ny = dist ? dx / dist : 0;

      if (edge.source > edge.target) { nx = -nx; ny = -ny; }

      const offsetStep = 45;
      const offset = (siblingIndex - (siblingCount - 1) / 2) * offsetStep;
      cpX += nx * offset * 2;
      cpY += ny * offset * 2;
    }

    if (isCurved) {
      start = getConnectionPoint(source, edge.sourcePort || 'auto', cpX, cpY, edge.sourceRel);
      end = getConnectionPoint(target, edge.targetPort || 'auto', cpX, cpY, edge.targetRel);
      pathD = `M ${start.x},${start.y} Q ${cpX},${cpY} ${end.x},${end.y}`;
      midX = 0.25 * start.x + 0.5 * cpX + 0.25 * end.x;
      midY = 0.25 * start.y + 0.5 * cpY + 0.25 * end.y;
      cp1x = cpX; cp1y = cpY; cp2x = cpX; cp2y = cpY;
    } else {
      start = getConnectionPoint(source, edge.sourcePort || 'auto', tc.x, tc.y, edge.sourceRel);
      end = getConnectionPoint(target, edge.targetPort || 'auto', sc.x, sc.y, edge.targetRel);

      const dx = end.x - start.x; const dy = end.y - start.y; const dist = Math.sqrt(dx * dx + dy * dy);
      let sNx = start.nx || 0; let sNy = start.ny || 0; let eNx = end.nx || 0; let eNy = end.ny || 0;
      if (sNx === 0 && sNy === 0 && eNx === 0 && eNy === 0) { sNx = dist ? dx / dist : 0; sNy = dist ? dy / dist : 0; eNx = -sNx; eNy = -sNy; }
      else if (sNx === 0 && sNy === 0) { sNx = -eNx; sNy = -eNy; }
      else if (eNx === 0 && eNy === 0) { eNx = -sNx; eNy = -sNy; }

      const offset = Math.min(dist * 0.4, 150);
      cp1x = start.x + sNx * offset; cp1y = start.y + sNy * offset;
      cp2x = end.x + eNx * offset; cp2y = end.y + eNy * offset;
      pathD = `M ${start.x},${start.y} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${end.x},${end.y}`;

      const t = 0.5; const u = 1 - t;
      midX = u * u * u * start.x + 3 * u * u * t * cp1x + 3 * u * t * t * cp2x + t * t * t * end.x;
      midY = u * u * u * start.y + 3 * u * u * t * cp1y + 3 * u * t * t * cp2y + t * t * t * end.y;
    }

    if (isNaN(midX)) midX = (start.x + end.x) / 2;
    if (isNaN(midY)) midY = (start.y + end.y) / 2;

    return { pathD, midX, midY, start, end, cp1x, cp1y, cp2x, cp2y };
  }, [getConnectionPoint]);

  return { getWorldPos, getConnectionPoint, getEdgePathData };
}
