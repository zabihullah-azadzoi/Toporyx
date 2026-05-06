import { XCircle } from 'lucide-react';
import { ToporyxLogo } from '../branding/ToporyxLogo';

export function AuthModal({
  show,
  onClose,
  authError,
  handleAuthSubmit,
  email,
  setEmail,
  password,
  setPassword,
  isLoginMode,
  setIsLoginMode,
  setAuthError,
}) {
  if (!show) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999999] flex items-center justify-center bg-[#020617]/80 backdrop-blur-sm no-capture no-canvas-click"
      onPointerDown={onClose}
    >
      <div
        className="relative w-[380px] bg-[#090e17] border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.8)]" />

        <div className="p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="mb-4 relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
              <ToporyxLogo className="w-16 h-16 relative z-10" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-0.5">TOPORYX</h2>
            <p className="text-[10px] text-cyan-400 font-mono tracking-[0.3em] uppercase mt-2 opacity-80">Topology in Motion</p>
          </div>

          {authError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-lg mb-4 text-xs font-medium text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-0.5">Email Address</label>
              <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder-slate-600" placeholder="architect@company.com" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-0.5">Password</label>
              <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder-slate-600" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full bg-slate-100 hover:bg-white text-slate-900 text-sm font-bold py-3 rounded-xl transition-all mt-4 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]">
              {isLoginMode ? 'Sign In to Cloud' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            {isLoginMode ? 'No account?' : 'Already registered?'}
            <button onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); }} className="ml-1.5 text-cyan-400 hover:text-cyan-300 transition-colors font-semibold">
              {isLoginMode ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-600 hover:text-slate-300 transition-colors">
          <XCircle size={20} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
