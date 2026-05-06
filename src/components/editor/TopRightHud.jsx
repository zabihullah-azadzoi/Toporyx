import { ChevronDown, Grid3X3, LogOut, Monitor, UserCircle, ZoomIn, ZoomOut } from 'lucide-react';
import { BG_THEMES } from '../../constants/ui';

export function TopRightHud({
  theme,
  showGrid,
  setShowGrid,
  setBgThemeIndex,
  setCamera,
  camera,
  user,
  showProfileMenu,
  setShowProfileMenu,
  setShowAuthModal,
  handleLogout,
}) {
  return (
    <div className="absolute top-6 right-6 z-[999999] flex items-center gap-3 no-canvas-click no-capture">
      <div className={`flex items-center gap-1 backdrop-blur-xl border px-2 py-1.5 rounded-xl shadow-lg ${theme.light ? 'bg-white/80 border-slate-300 text-slate-800' : 'bg-slate-900/90 border-slate-700 text-slate-200'}`}>
        <button onClick={() => setShowGrid(!showGrid)} className={`p-1.5 rounded-lg transition-colors ${showGrid ? 'text-emerald-400' : 'text-slate-500'} ${theme.light ? 'hover:bg-slate-200' : 'hover:bg-slate-800'}`} title="Toggle Grid"><Grid3X3 size={16} /></button>
        <button onClick={() => setBgThemeIndex((prev) => (prev + 1) % BG_THEMES.length)} className={`p-1.5 rounded-lg transition-colors ${theme.light ? 'text-slate-700 hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`} title="Change Background">
          <Monitor size={16} />
        </button>
        <div className={`w-px h-5 mx-1 ${theme.light ? 'bg-slate-300' : 'bg-slate-700'}`} />
        <button onClick={() => setCamera((prev) => ({ ...prev, z: Math.max(0.05, prev.z / 1.2) }))} className={`p-1.5 rounded-lg ${theme.light ? 'hover:bg-slate-200' : 'hover:bg-slate-800'}`}><ZoomOut size={16} /></button>
        <button onClick={() => setCamera({ x: 0, y: 0, z: 1 })} className="px-2 text-xs font-mono">{Math.round(camera.z * 100)}%</button>
        <button onClick={() => setCamera((prev) => ({ ...prev, z: Math.min(5, prev.z * 1.2) }))} className={`p-1.5 rounded-lg ${theme.light ? 'hover:bg-slate-200' : 'hover:bg-slate-800'}`}><ZoomIn size={16} /></button>
      </div>

      <div className="relative">
        <button onClick={() => user ? setShowProfileMenu(!showProfileMenu) : setShowAuthModal(true)} className={`flex items-center gap-2 backdrop-blur-xl border px-3 py-1.5 rounded-xl shadow-lg transition-colors font-bold ${theme.light ? 'bg-white/80 border-slate-300 text-slate-800 hover:bg-slate-100' : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:bg-slate-800'}`}>
          <UserCircle size={18} className={user ? 'text-cyan-400' : 'text-slate-400'} />
          <span className="text-sm">{user ? user.email.split('@')[0] : 'Sign In'}</span>
          {user && <ChevronDown size={14} className="opacity-50" />}
        </button>

        {showProfileMenu && user && (
          <div className={`absolute top-full right-0 mt-2 w-48 backdrop-blur-xl border rounded-xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 ${theme.light ? 'bg-white/95 border-slate-300' : 'bg-slate-900/95 border-slate-700'}`}>
            <div className={`text-xs p-2 break-all opacity-50 font-mono border-b mb-1 ${theme.light ? 'border-slate-200' : 'border-slate-800'}`}>{user.email}</div>
            <button onClick={handleLogout} className="w-full flex items-center gap-2 p-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 font-bold transition-colors">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
