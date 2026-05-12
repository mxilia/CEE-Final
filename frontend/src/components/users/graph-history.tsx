"use client";

import { env } from "@/src/config/env";
import { Activity, TrendingUp, Loader2 } from "lucide-react";
import useSWR from "swr";
import { useMemo } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ScoreHistory {
  created_at: string;
  total_score: number;
}


export default function GraphHistory({ userId }: { userId: string }) {
  const { data, isLoading } = useSWR<{ data: ScoreHistory[] }>(
    userId ? `${env.API_URL}/score-history/user/${userId}` : null,
    fetcher
  );

  const { points, circlePoints, totalGain, maxScaleLabel } = useMemo(() => {
    if (!data?.data || data.data.length === 0) {
      return { points: "", circlePoints: [], totalGain: 0, maxScaleLabel: "0" };
    }

    const sorted = [...data.data].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const highestRecorded = Math.max(...sorted.map((h) => h.total_score));
    // We set maxScale slightly higher than the record so dots aren't at the very ceiling
    const maxScale = Math.max(highestRecorded * 1.15, 100000); 
    
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    
    const startTime = sixMonthsAgo.getTime();
    const endTime = now.getTime();
    const timeRange = endTime - startTime;

    const mapped = sorted.map((h) => {
      const recordTime = new Date(h.created_at).getTime();
      const x = ((recordTime - startTime) / timeRange) * 100;
      const y = 100 - (h.total_score / maxScale) * 100;
      return { x: Math.max(0, x), y: Math.max(0, Math.min(100, y)) };
    });

    return { 
      points: mapped.map(p => `${p.x},${p.y}`).join(" "), 
      circlePoints: mapped, 
      totalGain: sorted[sorted.length-1].total_score - (sorted.length > 1 ? sorted[0].total_score : 0),
      maxScaleLabel: maxScale > 9999 ? `${(maxScale / 1000).toFixed(0)}K` : maxScale.toString()
    };
  }, [data]);

  if (isLoading) return (
    <div className="h-64 flex items-center justify-center bg-zinc-950 rounded-2xl border border-white/5">
      <Loader2 className="animate-spin text-cyan-500" size={20} />
    </div>
  );

  return (
    <div className="relative flex flex-col rounded-2xl border border-white/5 bg-zinc-950 p-5 w-full shadow-xl">
      <div className="absolute top-0 left-0 rounded-tl-xl  bg-zinc-800 text-cyan-500 text-[10px] font-black px-4 py-1 rounded-br-xl uppercase tracking-widest z-10">
        Progression Log
      </div>

      <div className="flex items-center justify-between mb-8 mt-4">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-cyan-500" />
          <h2 className="text-xl font-black italic text-white tracking-tighter uppercase leading-none">
            Score Accumulation
          </h2>
        </div>
        <div className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded-md">
          <TrendingUp size={12} className="text-cyan-400" />
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-tighter tabular-nums">
            +{totalGain.toLocaleString()} pts
          </span>
        </div>
      </div>

      {/* Main Chart Wrapper */}
      <div className="relative h-64 w-full pr-2 flex group">
        
        {/* Y-Axis Labels: Positioned absolutely relative to the grid lines */}
        <div className="relative w-10 h-[calc(100%-2rem)] flex flex-col justify-between text-[9px] font-black text-zinc-700 tabular-nums pointer-events-none">
          <span className="leading-none">{maxScaleLabel}</span>
          <span className="leading-none translate-y-1/2"></span>
          <span className="leading-none translate-y-1/2"></span>
          <span className="leading-none translate-y-1/2"></span>
          <span className="leading-none text-zinc-900 translate-y-full">0</span>
        </div>

        {/* Chart Area */}
        <div className="flex-1 h-[calc(100%-2rem)] relative border-l border-b border-white/5">
          {/* Grid Background: Every 25% */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[100%_25%]" />
          
          <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cyan-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgb(34, 211, 238)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            {circlePoints.length > 1 && (
              <path d={`M ${circlePoints[0].x} 100 L ${points} L ${circlePoints[circlePoints.length - 1].x} 100 Z`} fill="url(#cyan-gradient)" />
            )}
            <polyline fill="none" stroke="rgb(34, 211, 238)" strokeWidth="2" points={points} style={{ vectorEffect: 'non-scaling-stroke' }} className="opacity-40" />
          </svg>

          {/* HTML Overlay for dots */}
          <div className="absolute inset-0 pointer-events-none">
            {circlePoints.map((p, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-cyan-400 rounded-full border-2 border-zinc-950 shadow-[0_0_10px_rgba(34,211,238,1)] transition-transform group-hover:scale-125"
                style={{ 
                  left: `${p.x}%`, 
                  top: `${p.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
          </div>
        </div>

        {/* X-Axis Labels */}
        <div className="absolute left-10 bottom-0 right-0 h-8 flex justify-between items-center text-[9px] font-black text-zinc-600 uppercase tracking-tighter px-1">
          <span className="bg-zinc-900 px-2 py-0.5 rounded">6 Months Ago</span>
          <span className="text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded">Today</span>
        </div>
      </div>
    </div>
  );
}