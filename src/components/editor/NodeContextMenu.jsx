import {
  Bold,
  Plus,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  BringToFront,
  SendToBack,
  StickyNote,
  Square,
  Copy,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Activity,
} from 'lucide-react';

export function NodeContextMenu({
  selectedId,
  nodeMenuPos,
  getMenuLeft,
  getMenuTop,
  diagram,
  setDiagram,
  pushToHistory,
  setOpenNoteId,
  createFailover,
  setSelectedId,
}) {
  if (!(selectedId?.startsWith('n_') || selectedId?.startsWith('l_')) || !nodeMenuPos) {
    return null;
  }

  return (
    <div className="absolute z-[999999] flex flex-col gap-2 bg-slate-900/95 backdrop-blur border border-slate-700 p-2 rounded-xl shadow-2xl transform -translate-x-1/2 -translate-y-[calc(100%+15px)] no-canvas-click no-capture" style={{ left: getMenuLeft(nodeMenuPos.x), top: getMenuTop(nodeMenuPos.y) }}>
      <div className="flex items-center gap-1">
        <button onClick={() => { const ns = { ...diagram, nodes: diagram.nodes.map((n) => n.id === selectedId ? { ...n, bold: !n.bold } : n) }; setDiagram(ns); pushToHistory(ns); }} className={`p-1.5 rounded-lg ${nodeMenuPos.node.bold ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}><Bold size={14} /></button>
        <button onClick={() => { const ns = { ...diagram, nodes: diagram.nodes.map((n) => n.id === selectedId ? { ...n, size: (n.size || 14) + 2 } : n) }; setDiagram(ns); pushToHistory(ns); }} className="p-1.5 rounded-lg text-slate-400 hover:text-white"><Plus size={14} /></button>
        <button onClick={() => { const ns = { ...diagram, nodes: diagram.nodes.map((n) => n.id === selectedId ? { ...n, size: Math.max(8, (n.size || 14) - 2) } : n) }; setDiagram(ns); pushToHistory(ns); }} className="p-1.5 rounded-lg text-slate-400 hover:text-white"><Minus size={14} /></button>
        <div className="w-px h-5 bg-slate-700 mx-1" />

        <button onClick={() => { const ns = { ...diagram, nodes: diagram.nodes.map((n) => n.id === selectedId ? { ...n, align: 'left' } : n) }; setDiagram(ns); pushToHistory(ns); }} className={`p-1.5 rounded-lg ${nodeMenuPos.node.align === 'left' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}><AlignLeft size={14} /></button>
        <button onClick={() => { const ns = { ...diagram, nodes: diagram.nodes.map((n) => n.id === selectedId ? { ...n, align: 'center' } : n) }; setDiagram(ns); pushToHistory(ns); }} className={`p-1.5 rounded-lg ${nodeMenuPos.node.align === 'center' || !nodeMenuPos.node.align ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}><AlignCenter size={14} /></button>
        <button onClick={() => { const ns = { ...diagram, nodes: diagram.nodes.map((n) => n.id === selectedId ? { ...n, align: 'right' } : n) }; setDiagram(ns); pushToHistory(ns); }} className={`p-1.5 rounded-lg ${nodeMenuPos.node.align === 'right' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`}><AlignRight size={14} /></button>
        <div className="w-px h-5 bg-slate-700 mx-1" />

        <button onClick={() => { const ns = { ...diagram, nodes: diagram.nodes.map((n) => n.id === selectedId ? { ...n, zOffset: (n.zOffset || 20) + 10 } : n) }; setDiagram(ns); pushToHistory(ns); }} className="p-1.5 rounded-lg text-slate-400 hover:text-white" title="Bring to Front"><BringToFront size={14} /></button>
        <button onClick={() => { const ns = { ...diagram, nodes: diagram.nodes.map((n) => n.id === selectedId ? { ...n, zOffset: (n.zOffset || 20) - 10 } : n) }; setDiagram(ns); pushToHistory(ns); }} className="p-1.5 rounded-lg text-slate-400 hover:text-white" title="Send to Back"><SendToBack size={14} /></button>

        <button onClick={() => setOpenNoteId(nodeMenuPos.node.id)} className={`p-1.5 rounded-lg ${nodeMenuPos.node.notes ? 'text-amber-400' : 'text-slate-400 hover:text-white'}`} title="Add/Edit Notes"><StickyNote size={14} /></button>

        <button onClick={() => { const ns = { ...diagram, nodes: diagram.nodes.map((n) => n.id === selectedId ? { ...n, transparent: !n.transparent } : n) }; setDiagram(ns); pushToHistory(ns); }} className={`p-1.5 rounded-lg transition-colors ${nodeMenuPos.node.transparent ? 'text-amber-400 bg-amber-900/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`} title="Toggle Transparent Fill"><Square size={14} /></button>

        {nodeMenuPos.node.status !== 'standby' && (
          <button onClick={() => createFailover(selectedId)} className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300" title="Create Failover (Standby Clone)"><Copy size={14} /></button>
        )}

        <div className="w-px h-5 bg-slate-700 mx-1" />
        <button onClick={() => { const ns = { ...diagram, nodes: diagram.nodes.filter((n) => n.id !== selectedId), edges: diagram.edges.filter((e) => e.source !== selectedId && e.target !== selectedId) }; setDiagram(ns); pushToHistory(ns); setSelectedId(null); }} className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/50"><Trash2 size={14} /></button>
      </div>

      {nodeMenuPos.node.type !== 'text' && nodeMenuPos.node.type !== 'label' && (
        <div className="flex items-center justify-center gap-1 border-t border-slate-800 pt-1.5">
          {[{ id: 'healthy', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-900/30' }, { id: 'throttled', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-900/30' }, { id: 'down', icon: XCircle, color: 'text-red-400', bg: 'bg-red-900/30' }, { id: 'standby', icon: Activity, color: 'text-slate-400', bg: 'bg-slate-800/80' }].map((status) => (
            <button key={status.id} onClick={() => { const ns = { ...diagram, nodes: diagram.nodes.map((n) => n.id === selectedId ? { ...n, status: status.id } : n) }; setDiagram(ns); pushToHistory(ns); }} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold ${nodeMenuPos.node.status === status.id ? `${status.bg} ${status.color}` : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}><status.icon size={10} /> {status.id}</button>
          ))}
        </div>
      )}
    </div>
  );
}
