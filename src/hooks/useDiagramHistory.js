import { useCallback, useRef } from 'react';

export function useDiagramHistory(diagram, setDiagram, setSelectedId) {
  const historyRef = useRef({ past: [], future: [] });

  const pushToHistory = useCallback((newState) => {
    historyRef.current.past.push(diagram);
    if (historyRef.current.past.length > 50) historyRef.current.past.shift();
    historyRef.current.future = [];
    setDiagram(newState);
  }, [diagram, setDiagram]);

  const undo = useCallback(() => {
    if (historyRef.current.past.length === 0) return;
    const previous = historyRef.current.past.pop();
    historyRef.current.future.push(diagram);
    setDiagram(previous);
    setSelectedId(null);
  }, [diagram, setDiagram, setSelectedId]);

  const redo = useCallback(() => {
    if (historyRef.current.future.length === 0) return;
    const next = historyRef.current.future.pop();
    historyRef.current.past.push(diagram);
    setDiagram(next);
    setSelectedId(null);
  }, [diagram, setDiagram, setSelectedId]);

  const resetHistory = useCallback(() => {
    historyRef.current = { past: [], future: [] };
  }, []);

  return { historyRef, pushToHistory, undo, redo, resetHistory };
}
