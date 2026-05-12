"use client";

import { env } from "@/src/config/env";
import { Trophy, Music2, Zap, Activity } from "lucide-react";
import useSWR from "swr";

interface BestPlayProps {
  userId: string;
}

interface BestPerformanceResponse {
  data?: {
    total_score?: number;
    max_combo?: number;
    accuracy?: number | string;
    song?: {
      title?: string;
    };
  } | null;
}

const fetcher = async (url: string): Promise<BestPerformanceResponse> => {
  const res = await fetch(url, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch best performance data");
  }

  return res.json();
};

export default function BestPlay({ userId }: BestPlayProps) {
  const {
    data: BestPerformanceData,
    isLoading,
    error,
  } = useSWR<BestPerformanceResponse>(
    `${env.API_URL}/play-history/user/${userId}/best`,
    fetcher,
    {
      suspense: false,
    }
  );

  // Loading State
  if (isLoading) {
    return (
      <div className="relative flex flex-col rounded-2xl border border-white/5 bg-zinc-950 p-5 w-full shadow-2xl overflow-hidden">
        Loading...
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="relative flex flex-col rounded-2xl border border-white/5 bg-zinc-950 p-5 w-full shadow-2xl overflow-hidden">
        Error loading best performance data.
      </div>
    );
  }

  // No Data State
  if (!BestPerformanceData?.data) {
    return (
      <div className="relative flex flex-col rounded-2xl border border-white/5 bg-zinc-950 p-5 w-full shadow-2xl overflow-hidden min-h-[440px]">
        {/* HUD Label */}
        <div className="absolute top-0 left-0 bg-zinc-800 text-zinc-400/30 text-[10px] font-black px-4 py-1 rounded-br-xl uppercase tracking-widest">
          Personal Best
        </div>

        {/* Header - Muted */}
        <div className="flex items-center gap-2 mb-6 mt-4 opacity-20">
          <Trophy size={18} className="text-zinc-500" />
          <h2 className="text-xl font-black italic text-white tracking-tighter uppercase">
            Top Performance
          </h2>
        </div>

        {/* Main Content Area with Ghost Grid */}
        <div className="flex-1 relative flex flex-col items-center justify-center border border-white/5 rounded-xl bg-zinc-900/20 overflow-hidden">
          {/* Scanning Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px]" />
          
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-white/5 border border-white/5">
              <Trophy size={32} className="text-zinc-800" />
            </div>
            <div className="flex flex-col items-center italic">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                No Records Found
              </span>
              <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest mt-1">
                Awaiting first deployment...
              </span>
            </div>
          </div>
        </div>

        {/* Footer - Muted */}
        <div className="mt-8 flex items-center gap-4 opacity-10">
          <div className="h-0.5 w-8 bg-white" />
          <div className="h-0.5 flex-1 bg-white/20" />
          <span className="text-[8px] font-black text-white uppercase tracking-[0.5em] whitespace-nowrap">
            Empty Data Log
          </span>
        </div>
      </div>
    );
  }

  console.log("BestPerformanceData:", BestPerformanceData);

  // Safe Access
  const score = BestPerformanceData?.data?.total_score ?? 0;
  const songName =
    BestPerformanceData?.data?.song?.title ?? "No Data Recorded";
  const maxCombo = BestPerformanceData?.data?.max_combo ?? 0;
  const accuracy = BestPerformanceData?.data?.accuracy ?? "0.0";

  return (
    <div className="relative flex flex-col rounded-2xl border border-white/5 bg-zinc-950 p-5 w-full shadow-2xl overflow-hidden">
      {/* HUD Label */}
      <div className="absolute top-0 left-0 bg-zinc-800 text-zinc-400 text-[10px] font-black px-4 py-1 rounded-br-xl uppercase tracking-widest">
        Personal Best
      </div>

      {/* Header */}
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

        {/* Score Display */}
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900/50 border border-white/5 p-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
              <Zap
                size={12}
                className="text-yellow-500 fill-yellow-500"
              />

              Total Points
            </span>

            <span className="text-5xl font-black text-white tabular-nums tracking-tighter leading-none">
              {score.toLocaleString()}
            </span>
          </div>

          {/* Decorative Grid */}
          <div className="absolute top-0 right-0 h-16 w-16 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[8px_8px]" />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 gap-4">
          {/* Max Combo */}
          <div className="flex flex-col border-l-2 border-yellow-500/50 pl-3">
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
              Max Combo
            </span>

            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-white tabular-nums">
                {maxCombo}
              </span>

              <span className="text-[10px] font-black text-zinc-700">
                X
              </span>
            </div>
          </div>

          {/* Accuracy */}
          <div className="flex flex-col border-l-2 border-zinc-800 pl-3">
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
              Accuracy
            </span>

            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-white tabular-nums">
                {accuracy}
              </span>

              <span className="text-[10px] font-black text-zinc-700">
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center gap-4 opacity-20">
        <div className="h-0.5 w-8 bg-white" />

        <div className="h-0.5 flex-1 bg-white/20" />

        <span className="text-[8px] font-black text-white uppercase tracking-[0.5em] whitespace-nowrap">
          Verified Data Log
        </span>
      </div>
    </div>
  );
}