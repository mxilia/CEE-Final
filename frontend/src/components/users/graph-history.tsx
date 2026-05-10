"use client";

export default function GraphHistory() {
  return (
    <div className="relative rounded-2xl border border-neutral-800 bg-[#0a0a0a] p-6 sm:p-8 w-full">
      {/* Label 4 */}
      <div className="absolute top-0 left-0 bg-neutral-800 text-neutral-300 text-sm font-extrabold px-6 py-1 rounded-br-2xl">
        4
      </div>
      
      <div className="flex justify-end mb-4">
        <h2 className="text-2xl font-black italic text-white tracking-wider uppercase">
          Max Combo History
        </h2>
      </div>
      
      {/* Graph Area */}
      <div className="relative h-64 sm:h-80 w-full flex items-end">
        {/* Y Axis Labels */}
        <div className="absolute left-0 top-0 bottom-6 w-10 flex flex-col justify-between text-xs font-semibold text-neutral-500 pb-2">
          <span>150</span>
          <span>100</span>
          <span>50</span>
          <span>0</span>
        </div>
        
        {/* Y-Axis Label Rotated */}
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-black italic text-neutral-600 tracking-widest uppercase">
          Max Combo
        </div>

        {/* Chart Area */}
        <div className="ml-10 w-full h-[calc(100%-1.5rem)] relative border-l border-b border-neutral-800">
           {/* Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_25%]" />
          
          <svg 
            className="absolute inset-0 w-full h-full text-neutral-300 overflow-visible" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
          >
            {/* The Line */}
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              points="0,85 15,30 30,50 45,20 60,60 75,10 90,40 100,5"
            />
            {/* Data Dots */}
            <circle cx="15" cy="30" r="2" fill="currentColor" className="text-white" />
            <circle cx="30" cy="50" r="2" fill="currentColor" className="text-white" />
            <circle cx="45" cy="20" r="2" fill="currentColor" className="text-white" />
            <circle cx="60" cy="60" r="2" fill="currentColor" className="text-white" />
            <circle cx="75" cy="10" r="2" fill="currentColor" className="text-white" />
          </svg>

          {/* Floating Data Tags */}
          <div className="absolute left-[15%] top-[20%] -translate-x-1/2 bg-neutral-800 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">50</div>
          <div className="absolute left-[30%] top-[55%] -translate-x-1/2 bg-neutral-800 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">20</div>
          <div className="absolute left-[45%] top-[10%] -translate-x-1/2 bg-neutral-800 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">80</div>
          <div className="absolute left-[75%] top-[0%] -translate-x-1/2 bg-neutral-800 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">100</div>
        </div>

        {/* X Axis Labels */}
        <div className="absolute left-10 bottom-0 right-0 h-6 flex justify-between items-end text-[10px] sm:text-xs font-semibold text-neutral-500 pl-2">
          <span className="origin-left rotate-45">Song 1</span>
          <span className="origin-left rotate-45">Song 2</span>
          <span className="origin-left rotate-45">Song 3</span>
          <span className="origin-left rotate-45">Song 4</span>
          <span className="origin-left rotate-45">Song 5</span>
        </div>
      </div>
    </div>
  );
}