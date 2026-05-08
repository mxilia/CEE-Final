
export default function GraphHistory() {
  return (
    <div className="w-full md:w-2/3 lg:w-1/2">
      <h2 className="text-lg font-semibold text-sky-200 sm:text-xl mb-4 tracking-wide">Combo</h2>
      
      {/* Graph Placeholder using a simple scalable SVG line */}
      <div className="rounded-2xl border border-sky-500/20 bg-slate-950/70 p-4 sm:p-6 h-56 sm:h-64 md:h-80 flex items-center justify-center w-full relative overflow-hidden shadow-[0_0_24px_rgba(56,189,248,0.10)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.10)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
        <svg 
          className="relative w-full h-full text-sky-400" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
        >
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            points="10,80 25,45 35,65 55,45 65,60 85,25 95,20"
          />
        </svg>
        <span className="absolute bottom-2 left-2 text-xs text-sky-200/60">
          Graph Area
        </span>
      </div>
    </div>
  );
}