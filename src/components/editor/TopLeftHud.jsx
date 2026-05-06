import { Camera, Check, ChevronDown, Edit2, PlusCircle, Trash2, Undo2, Redo2 } from 'lucide-react';
import { ToporyxLogo } from '../branding/ToporyxLogo';

export function TopLeftHud({
  sidebarOpen,
  setSidebarOpen,
  theme,
  activeBoard,
  isCloudSynced,
  storageMode,
  saveState,
  undo,
  redo,
  canUndo,
  canRedo,
  setTool,
  setSelectedId,
  setLinkStartNode,
  createNewBoard,
  boards,
  activeBoardId,
  handleSwitchBoard,
  editingBoardNameId,
  renameBoard,
  setEditingBoardNameId,
  deleteBoard,
}) {
  const modeLabel = storageMode === 'cloud' ? 'Cloud' : 'Local';
  const saveLabel = saveState === 'saving' ? 'Saving' : saveState === 'error' ? 'Save failed' : 'Saved';
  const saveTone = saveState === 'saving'
    ? 'text-amber-400'
    : saveState === 'error'
      ? 'text-red-400'
      : storageMode === 'cloud'
        ? 'text-cyan-400'
        : 'text-slate-400';

  return (
    <div className="absolute top-6 left-6 z-[999999] flex flex-col gap-2 no-capture no-canvas-click">
      <div className="flex items-center gap-3">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`flex items-center gap-2.5 backdrop-blur-xl border px-3.5 py-2 rounded-xl shadow-2xl transition-colors font-bold ${theme.light ? 'bg-white/80 border-slate-300 text-slate-800 hover:bg-slate-100' : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:bg-slate-800'}`}>
          <ToporyxLogo className="w-5 h-5 drop-shadow-md" />
          <div className="flex items-center gap-2 ml-1">
            <span className="max-w-[150px] truncate text-sm font-bold leading-tight">{activeBoard?.name || 'Loading...'}</span>
            {isCloudSynced ? (
              <div title="Cloud Synced" className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            ) : (
              <div title="Local Storage" className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            )}
          </div>
          <ChevronDown size={14} className={`ml-1 opacity-50 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
        </button>

        <div className={`hidden sm:flex items-center gap-2 backdrop-blur-xl border px-3 py-2 rounded-xl shadow-lg text-xs font-bold uppercase tracking-[0.18em] ${theme.light ? 'bg-white/80 border-slate-300 text-slate-600' : 'bg-slate-900/90 border-slate-700 text-slate-400'}`}>
          <span>{modeLabel}</span>
          <span className={`w-1 h-1 rounded-full ${saveState === 'error' ? 'bg-red-400' : saveState === 'saving' ? 'bg-amber-400' : storageMode === 'cloud' ? 'bg-cyan-400' : 'bg-slate-400'}`} />
          <span className={saveTone}>{saveLabel}</span>
        </div>

        <div className={`flex items-center gap-1 backdrop-blur-xl border px-2 py-1.5 rounded-xl shadow-lg ${theme.light ? 'bg-white/80 border-slate-300' : 'bg-slate-900/90 border-slate-700'}`}>
          <button onClick={undo} disabled={!canUndo} className={`p-1.5 rounded-lg transition-colors ${!canUndo ? 'opacity-30 cursor-not-allowed' : theme.light ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-slate-800 text-slate-300'}`} title="Undo (Ctrl+Z)"><Undo2 size={16} /></button>
          <button onClick={redo} disabled={!canRedo} className={`p-1.5 rounded-lg transition-colors ${!canRedo ? 'opacity-30 cursor-not-allowed' : theme.light ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-slate-800 text-slate-300'}`} title="Redo (Ctrl+Y)"><Redo2 size={16} /></button>
          <div className={`w-px h-5 mx-1 ${theme.light ? 'bg-slate-300' : 'bg-slate-700'}`} />
          <button onClick={() => { setTool('screenshot'); setSelectedId(null); setLinkStartNode(null); }} className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors text-sm font-semibold ${theme.light ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-300 hover:bg-slate-800'}`} title="Take Snapshot">
            <Camera size={14} /> Snapshot
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div className={`mt-2 w-72 backdrop-blur-xl border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 ${theme.light ? 'bg-white/95 border-slate-300 text-slate-800' : 'bg-slate-900/95 border-slate-700 text-slate-200'}`}>
          <div className={`p-3 border-b flex justify-between items-center ${theme.light ? 'border-slate-300 bg-slate-100' : 'border-slate-800 bg-black/20'}`}>
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Topologies</span>
            <button onClick={(e) => { e.stopPropagation(); createNewBoard(); }} className="text-emerald-400 hover:text-emerald-300 transition-transform hover:scale-110" title="Create New Diagram"><PlusCircle size={18} /></button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {boards.map((board) => (
              <div key={board.id} className={`group flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${activeBoardId === board.id ? 'border-l-2 border-cyan-500 bg-cyan-500/10' : 'border-l-2 border-transparent hover:bg-slate-500/10'}`} onClick={() => handleSwitchBoard(board)}>
                {editingBoardNameId === board.id ? (
                  <div className="flex items-center gap-2 w-full">
                    <input autoFocus type="text" defaultValue={board.name}
                      onBlur={(e) => renameBoard(board.id, e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') renameBoard(board.id, e.currentTarget.value); }}
                      className={`w-full border rounded px-2 py-1 text-sm outline-none focus:border-cyan-500 ${theme.light ? 'bg-white border-slate-300' : 'bg-black/50 border-slate-600'}`} />
                    <Check size={16} className="text-emerald-400 cursor-pointer flex-shrink-0" onClick={(e) => { e.stopPropagation(); renameBoard(board.id, e.currentTarget.previousSibling.value); }} />
                  </div>
                ) : (
                  <>
                    <span className={`text-sm truncate pr-2 ${activeBoardId === board.id ? 'font-bold text-cyan-400' : ''}`}>{board.name}</span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 flex-shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); setEditingBoardNameId(board.id); }} className="text-slate-400 hover:text-cyan-400"><Edit2 size={14} /></button>
                      {boards.length > 1 && <button onClick={(e) => deleteBoard(board.id, e)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
