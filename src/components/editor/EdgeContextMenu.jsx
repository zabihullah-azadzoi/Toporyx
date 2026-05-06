import {
  MoveRight,
  MoveLeft,
  ArrowLeftRight,
  Minus,
  Lock,
  Unlock,
  Trash2,
  MoreHorizontal,
  Activity,
  ArrowDownUp,
  Radio,
  Repeat,
  Zap,
  Ban,
} from 'lucide-react';
import { FastForwardIcon } from '../icons/FastForwardIcon';

const DIRECTION_OPTIONS = [
  { id: 'forward', icon: MoveRight },
  { id: 'reverse', icon: MoveLeft },
  { id: 'both', icon: ArrowLeftRight },
  { id: 'none', icon: Minus },
];

const FLOW_OPTIONS = [
  { id: 'default', icon: MoreHorizontal, label: 'Dots' },
  { id: 'tcp', icon: Activity, label: 'TCP' },
  { id: 'udp', icon: FastForwardIcon, label: 'UDP' },
  { id: 'rest', icon: ArrowLeftRight, label: 'REST' },
  { id: 'grpc', icon: Radio, label: 'gRPC' },
  { id: 'websocket', icon: ArrowDownUp, label: 'WS' },
  { id: 'pubsub', icon: Repeat, label: 'Burst' },
  { id: 'beam', icon: Zap, label: 'Beam' },
  { id: 'dropped', icon: Ban, label: 'Drop' },
];

export function EdgeContextMenu({
  selectedId,
  edgeMenuPos,
  getMenuLeft,
  getMenuTop,
  diagram,
  setDiagram,
  pushToHistory,
  setSelectedId,
}) {
  if (!selectedId?.startsWith('e_') || !edgeMenuPos) {
    return null;
  }

  return (
    <div className="absolute z-[999999] flex flex-col gap-2 bg-slate-900/95 backdrop-blur border border-slate-700 p-2 rounded-xl shadow-2xl transform -translate-x-1/2 -translate-y-[calc(100%+15px)] no-canvas-click no-capture" style={{ left: getMenuLeft(edgeMenuPos.x), top: getMenuTop(edgeMenuPos.y) }}>
      <div className="flex items-center gap-1">
        {DIRECTION_OPTIONS.map((dir) => (
          <button key={dir.id} onClick={() => { const ns = { ...diagram, edges: diagram.edges.map((e) => e.id === edgeMenuPos.edge.id ? { ...e, direction: dir.id } : e) }; setDiagram(ns); pushToHistory(ns); }} className={`p-1.5 rounded-lg transition-colors ${edgeMenuPos.edge.direction === dir.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><dir.icon size={14} /></button>
        ))}
        <div className="w-px h-5 bg-slate-700 mx-1" />
        <button onClick={() => { const ns = { ...diagram, edges: diagram.edges.map((e) => e.id === edgeMenuPos.edge.id ? { ...e, encrypted: !e.encrypted } : e) }; setDiagram(ns); pushToHistory(ns); }} className={`p-1.5 rounded-lg transition-colors ${edgeMenuPos.edge.encrypted ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>{edgeMenuPos.edge.encrypted ? <Lock size={14} /> : <Unlock size={14} />}</button>

        <div className="w-px h-5 bg-slate-700 mx-1" />
        <button onClick={() => { const port = prompt('Enter Source Port (e.g. :443):', edgeMenuPos.edge.sourcePortLabel || ''); const ns = { ...diagram, edges: diagram.edges.map((e) => e.id === edgeMenuPos.edge.id ? { ...e, sourcePortLabel: port } : e) }; setDiagram(ns); pushToHistory(ns); }} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-mono" title="Source Port">SP</button>
        <button onClick={() => { const port = prompt('Enter Target Port (e.g. :5432):', edgeMenuPos.edge.targetPortLabel || ''); const ns = { ...diagram, edges: diagram.edges.map((e) => e.id === edgeMenuPos.edge.id ? { ...e, targetPortLabel: port } : e) }; setDiagram(ns); pushToHistory(ns); }} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-mono" title="Target Port">TP</button>

        <div className="w-px h-5 bg-slate-700 mx-1" />
        <button onClick={() => { const ns = { ...diagram, edges: diagram.edges.filter((e) => e.id !== selectedId) }; setDiagram(ns); pushToHistory(ns); setSelectedId(null); }} className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/50"><Trash2 size={14} /></button>
      </div>
      <div className="flex items-center justify-center gap-1 border-t border-slate-800 pt-1.5">
        {FLOW_OPTIONS.map((flow) => (
          <button key={flow.id} onClick={() => { const ns = { ...diagram, edges: diagram.edges.map((e) => e.id === edgeMenuPos.edge.id ? { ...e, flow: flow.id } : e) }; setDiagram(ns); pushToHistory(ns); }} className={`flex flex-col items-center gap-0.5 px-1.5 py-1 rounded transition-colors text-[10px] font-semibold ${edgeMenuPos.edge.flow === flow.id || (!edgeMenuPos.edge.flow && flow.id === 'default') ? 'bg-cyan-900/50 text-cyan-300' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`} title={flow.label}><flow.icon size={12} /> {flow.label}</button>
        ))}
      </div>
    </div>
  );
}
