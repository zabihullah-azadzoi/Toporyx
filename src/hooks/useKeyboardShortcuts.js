import { useEffect } from 'react';

export function useKeyboardShortcuts({
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
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (editingNodeTextId || editingBoardNameId || openNoteId || showAuthModal) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); return; }

      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedId) {
        e.preventDefault();
        const nodeToCopy = diagram.nodes.find((n) => n.id === selectedId);
        if (nodeToCopy) {
          const children = diagram.nodes.filter((n) => n.id !== nodeToCopy.id && n.x >= nodeToCopy.x && n.y >= nodeToCopy.y && n.x + n.w <= nodeToCopy.x + nodeToCopy.w && n.y + n.h <= nodeToCopy.y + nodeToCopy.h);
          clipboardRef.current = { nodes: [nodeToCopy, ...children], edges: [] };
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboardRef.current.nodes.length > 0) {
        e.preventDefault();
        const idMap = {};
        const newNodes = clipboardRef.current.nodes.map((n) => {
          const newId = generateId(n.type === 'label' ? 'l' : 'n');
          idMap[n.id] = newId;
          return { ...n, id: newId, x: n.x + 30, y: n.y + 30 };
        });
        pushToHistory({ ...diagram, nodes: [...diagram.nodes, ...newNodes] });
        setSelectedId(idMap[clipboardRef.current.nodes[0].id]);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedId) {
        e.preventDefault();
        const nodeToCopy = diagram.nodes.find((n) => n.id === selectedId);
        if (nodeToCopy) {
          const children = diagram.nodes.filter((n) => n.id !== nodeToCopy.id && n.x >= nodeToCopy.x && n.y >= nodeToCopy.y && n.x + n.w <= nodeToCopy.x + nodeToCopy.w && n.y + n.h <= nodeToCopy.y + nodeToCopy.h);
          const idMap = {};
          const newNodes = [nodeToCopy, ...children].map((n) => {
            const newId = generateId(n.type === 'label' ? 'l' : 'n');
            idMap[n.id] = newId;
            return { ...n, id: newId, x: n.x + 30, y: n.y + 30 };
          });
          pushToHistory({ ...diagram, nodes: [...diagram.nodes, ...newNodes] });
          setSelectedId(idMap[nodeToCopy.id]);
        }
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          if (selectedId.startsWith('n_') || selectedId.startsWith('l_')) {
            pushToHistory({ ...diagram, nodes: diagram.nodes.filter((n) => n.id !== selectedId), edges: diagram.edges.filter((edge) => edge.source !== selectedId && edge.target !== selectedId) });
          } else if (selectedId.startsWith('e_')) {
            pushToHistory({ ...diagram, edges: diagram.edges.filter((edge) => edge.id !== selectedId) });
          } else if (selectedId.startsWith('d_')) {
            pushToHistory({ ...diagram, drawings: diagram.drawings.filter((d) => d.id !== selectedId) });
          }
          setSelectedId(null);
        }
      }

      if (selectedId && (selectedId.startsWith('n_') || selectedId.startsWith('l_'))) {
        const step = e.shiftKey ? 20 : 5;
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowUp') dy = -step;
        if (e.key === 'ArrowDown') dy = step;
        if (e.key === 'ArrowLeft') dx = -step;
        if (e.key === 'ArrowRight') dx = step;

        if (dx !== 0 || dy !== 0) {
          e.preventDefault();
          const targetNode = diagram.nodes.find((n) => n.id === selectedId);
          if (!targetNode) return;
          const children = diagram.nodes.filter((n) => n.id !== targetNode.id && n.x >= targetNode.x && n.y >= targetNode.y && n.x + n.w <= targetNode.x + targetNode.w && n.y + n.h <= targetNode.y + targetNode.h);
          const moveIds = new Set([targetNode.id, ...children.map((c) => c.id)]);
          setDiagram((prev) => ({ ...prev, nodes: prev.nodes.map((n) => (moveIds.has(n.id) ? { ...n, x: n.x + dx, y: n.y + dy } : n)) }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, editingNodeTextId, editingBoardNameId, openNoteId, diagram, undo, redo, pushToHistory, showAuthModal, clipboardRef, generateId, setSelectedId, setDiagram]);
}
