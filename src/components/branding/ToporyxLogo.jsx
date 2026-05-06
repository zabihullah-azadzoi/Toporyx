export function ToporyxLogo({ className = 'w-20 h-20' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M 20 30 h 60 M 50 30 v 50 M 35 30 v 35 M 65 30 v 35"
        className="stroke-slate-300 fill-none transition-all duration-300"
        strokeWidth="3"
      />
      <circle
        cx="50"
        cy="80"
        r="5"
        className="stroke-cyan-400 fill-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
      />
    </svg>
  );
}
