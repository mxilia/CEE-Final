"use client"

import { env } from "@/src/config/env";
import { Trophy, Music2, Zap } from "lucide-react"
import useSWR from "swr";

interface BestPlayProps {
  userId: string
}

export default function BestPlay({ userId }: BestPlayProps) {
  // Logic/Fallbacks
  const { data: BestPerformanceData, isLoading: isBestPerformanceLoading } = useSWR(userId ? `${env.API_URL}/play-history/user/${userId}/best` : null, {
    fetcher: (url) => fetch(url, { credentials: "include" }).then(res => res.json()),
    suspense: true,
  })

  if (isBestPerformanceLoading) {
    return <div className="relative flex flex-col rounded-2xl border border-white/5 bg-zinc-950 p-5 w-full shadow-2xl overflow-hidden">Loading...</div>;
  }

  console.log("BestPerformanceData:", BestPerformanceData) // Debug log to verify best performance data

  const score = BestPerformanceData?.data.total_score || 0;
  const songName = BestPerformanceData?.data.song.title || "No Data Recorded";

  return (
    <div className="relative flex flex-col rounded-2xl border border-white/5 bg-zinc-950 p-5 w-full shadow-2xl overflow-hidden">
      
      {/* HUD Label */}
      <div className="absolute top-0 left-0 bg-zinc-800 text-zinc-400 text-[10px] font-black px-4 py-1 rounded-br-xl uppercase tracking-widest">
        Personal Best
      </div>

      <div className="flex items-center gap-2 mb-6 mt-4">
        <Trophy size={18} className="text-yellow-500" />
        <h2 className="text-xl font-black italic text-white tracking-tighter uppercase">
          Top Performance
        </h2>
      </div>

      <div className="flex flex-col gap-6">
        {/* Main Track Info */}
        <div className="flex items-center gap-4">
          <div className="shrink-0 bg-white/5 p-4 rounded-xl border border-white/5">
            <Music2 size={28} className="text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] mb-1">
              Highest Scoring Track
            </span>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter truncate leading-none">
              {songName}
            </h3>
          </div>
        </div>

        {/* Large Score Display */}
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900/50 border border-white/5 p-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
              <Zap size={12} className="text-yellow-500 fill-yellow-500" />
              Total Points
            </span>
            <span className="text-5xl font-black text-white tabular-nums tracking-tighter leading-none">
              {score.toLocaleString()}
            </span>
          </div>
          
          {/* Decorative Corner Grid */}
          <div className="absolute top-0 right-0 h-16 w-16 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[8px_8px]" />
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col border-l-2 border-yellow-500/50 pl-3">
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Max Combo</span>
            <div className="flex items-baseline gap-1">
               <span className="text-xl font-black text-white tabular-nums">{BestPerformanceData?.data.max_combo || 0}</span>
               <span className="text-[10px] font-black text-zinc-700">X</span>
            </div>
          </div>
          <div className="flex flex-col border-l-2 border-zinc-800 pl-3">
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Accuracy</span>
            <div className="flex items-baseline gap-1">
               <span className="text-xl font-black text-white tabular-nums">{BestPerformanceData?.data.accuracy || "0.0"}</span>
               <span className="text-[10px] font-black text-zinc-700">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Industrial HUD Footer */}
      <div className="mt-8 flex items-center gap-4 opacity-20">
        <div className="h-0.5 w-8 bg-white" />
        <div className="h-0.5 flex-1 bg-white/20" />
        <span className="text-[8px] font-black text-white uppercase tracking-[0.5em] whitespace-nowrap">Verified Data Log</span>
      </div>
    </div>
  )
}