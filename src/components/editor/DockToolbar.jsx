import React from 'react';
import {
  MousePointer2,
  Hand,
  Wand2,
  Link as LinkIcon,
  PenTool,
  Square,
  Circle as CircleIcon,
  Diamond,
  Hexagon,
  Cylinder,
  Cloud,
  Type,
} from 'lucide-react';
import { COLORS, SYSTEM_ICONS } from '../../constants/ui';

export function DockToolbar({
  theme,
  tool,
  setTool,
  setSelectedId,
  setLinkStartNode,
  setShowColorPicker,
  showColorPicker,
  activeColor,
  activeColorObj,
  updateSelectedColor,
}) {
  return (
    <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-[999999] flex flex-col gap-2 backdrop-blur-xl border p-3 rounded-2xl shadow-2xl no-canvas-click no-capture w-max max-w-[95vw] ${theme.light ? 'bg-white/95 border-slate-300' : 'bg-[#0f172a]/95 border-slate-700'}`}>
      <div className="flex flex-wrap justify-center items-center gap-2">
        <div className={`flex rounded-xl p-1 ${theme.light ? 'bg-slate-100' : 'bg-black/40'}`}>
          {[{ id: 'pointer', icon: MousePointer2, color: 'bg-indigo-600' }, { id: 'pan', icon: Hand, color: 'bg-indigo-600' }, { id: 'laser', icon: Wand2, color: 'bg-red-600' }, { id: 'link', icon: LinkIcon, color: 'bg-emerald-600' }, { id: 'pencil', icon: PenTool, color: 'bg-fuchsia-600' }].map((t) => (
            <button key={t.id} onClick={() => { setTool(t.id); setSelectedId(null); setLinkStartNode(null); setShowColorPicker(false); }} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${tool === t.id ? `${t.color} text-white shadow-lg` : theme.light ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-white/5'}`} title={t.id}>
              <t.icon size={16} />
            </button>
          ))}
        </div>

        <div className={`w-px h-8 mx-1 hidden sm:block ${theme.light ? 'bg-slate-300' : 'bg-slate-700/80'}`} />

        <div className={`flex rounded-xl p-1 gap-1 ${theme.light ? 'bg-slate-100' : 'bg-black/40'}`}>
          {[{ id: 'rect', icon: Square }, { id: 'circle', icon: CircleIcon }, { id: 'diamond', icon: Diamond }, { id: 'hexagon', icon: Hexagon }, { id: 'cylinder', icon: Cylinder }, { id: 'cloud', icon: Cloud }, { id: 'text', icon: Type }].map((t) => (
            <button key={t.id} onClick={() => { setTool(t.id); setSelectedId(null); setLinkStartNode(null); setShowColorPicker(false); }} className={`p-2 rounded-lg transition-all ${tool === t.id ? 'bg-slate-500/30 text-indigo-400 scale-110' : theme.light ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-white/5'}`} title={t.id}>
              <t.icon size={18} />
            </button>
          ))}
        </div>

        <div className={`w-px h-8 mx-1 hidden sm:block ${theme.light ? 'bg-slate-300' : 'bg-slate-700/80'}`} />

        <div className={`flex rounded-xl p-1 gap-1 hidden md:flex ${theme.light ? 'bg-slate-100' : 'bg-black/40'}`}>
          {Object.entries(SYSTEM_ICONS).map(([id, SystemIcon]) => (
            <button key={id} onClick={() => { setTool(id); setSelectedId(null); setLinkStartNode(null); setShowColorPicker(false); }} className={`p-2 rounded-lg transition-all ${tool === id ? 'bg-slate-500/30 text-indigo-400 scale-110' : theme.light ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-900/30'}`} title={id}>
              {React.createElement(SystemIcon, { size: 18 })}
            </button>
          ))}
        </div>

        <div className={`w-px h-8 mx-1 hidden lg:block ${theme.light ? 'bg-slate-300' : 'bg-slate-700/80'}`} />

        <div className={`flex items-center gap-1.5 px-2 rounded-xl py-1.5 ${theme.light ? 'bg-slate-100' : 'bg-black/40'}`}>
          <div className="relative flex items-center">
            <button onClick={() => setShowColorPicker(!showColorPicker)} className={`p-2 rounded-lg transition-all ${showColorPicker ? 'bg-slate-500/30' : theme.light ? 'hover:bg-slate-200' : 'hover:bg-slate-800'}`} title="Palette">
              <div className="w-5 h-5 rounded-full border-2 shadow-sm" style={{ backgroundColor: activeColorObj.hex, borderColor: theme.light ? '#000' : '#fff' }} />
            </button>

            {showColorPicker && (
              <div className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 p-2.5 rounded-2xl shadow-2xl grid grid-cols-4 gap-2 w-[140px] z-[999999] animate-in fade-in slide-in-from-bottom-2 ${theme.light ? 'bg-white border border-slate-200' : 'bg-slate-800 border border-slate-700'}`}>
                <div className={`col-span-4 text-[10px] font-bold tracking-widest text-center mb-1 uppercase ${theme.light ? 'text-slate-500' : 'text-slate-400'}`}>Stroke Color</div>
                {Object.entries(COLORS).map(([name, c]) => (
                  <button key={name} onClick={() => { updateSelectedColor(name); setShowColorPicker(false); }} className={`w-6 h-6 rounded-full border-2 transition-all mx-auto ${activeColor === name ? 'border-current scale-125 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-110'}`} style={{ backgroundColor: c.hex, borderColor: activeColor === name ? (theme.light ? '#000' : '#fff') : 'transparent' }} title={name} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
