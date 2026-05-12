"use client"

import useSWRInfinite from "swr/infinite"
import { env } from "@/src/config/env"
import { History, Calendar, Clock, Loader2, Music2, Target, Zap } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function PlayHistory({ userId }: { userId: number }) {
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && pageIndex >= previousPageData.meta.totalPages) return null
    return `${env.API_URL}/play-history/user/${userId}?page=${pageIndex + 1}&limit=5`
  }

  const { data, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher)
  
  const playHistory = data ? data.flatMap((page) => page.data) : []
  const hasMore = data && data[data.length - 1]?.meta?.page < data[data.length - 1]?.meta?.totalPages

  return (
    <div className="relative flex flex-col rounded-2xl border border-white/5 bg-zinc-950 p-5 w-full shadow-xl">
      
      {/* Decorative Label */}
      <div className="absolute rounded-tl-xl top-0 left-0 bg-zinc-800 text-zinc-400 text-[10px] font-black px-4 py-1 rounded-br-xl uppercase tracking-widest z-10">
        Session Log
      </div>

      <div className="flex items-center gap-2 mb-6 mt-4">
        <History size={18} className="text-green-500" />
        <h2 className="text-xl font-black italic text-white tracking-tighter uppercase leading-none">
          History
        </h2>
      </div>

      {playHistory.length > 0 ? (
        <div className="flex flex-col gap-3">
          {playHistory.map((item: any) => {
            const dateObj = new Date(item.created_at);
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div 
                key={item.id} 
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-green-500/30 transition-all duration-300 gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="shrink-0 text-zinc-600 bg-black p-2.5 rounded-lg border border-white/5 group-hover:text-green-500 group-hover:border-green-500/20 transition-all">
                    <Music2 size={16} />
                  </div>
                  
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-black italic text-white tracking-tight uppercase group-hover:text-green-400 transition-colors truncate">
                      {item.song_name || item.song?.title || "Unknown Track"}
                    </span>
                    
                    {/* BOLDER DATA STRIP */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                        <div className="flex items-center gap-1">
                            <Calendar size={11} className="text-green-500" />
                            <span className="text-[11px] font-black text-zinc-200 uppercase tracking-tight">{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock size={11} className="text-green-500" />
                            <span className="text-[11px] font-black text-zinc-200 uppercase tracking-tight">{formattedTime}</span>
                        </div>
                        <div className="flex items-center gap-1 border-l border-white/10 pl-3">
                            <Target size={12} className="text-green-400" />
                            <span className="text-[11px] font-black text-neutral-200 uppercase italic tracking-wider">
                              {item.accuracy ? Number(item.accuracy).toFixed(1) : "0.0"}%
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Zap size={12} className="text-yellow-400" />
                            <span className="text-[11px] font-black text-neutral-200 uppercase italic tracking-wider">
                              {item.max_combo || 0}x
                            </span>
                        </div>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                  <span className="sm:hidden text-[8px] font-black text-zinc-600 uppercase tracking-widest">Final Score</span>
                  <div className="text-right flex flex-col">
                    <span className="text-lg font-black text-white tabular-nums tracking-tighter group-hover:text-green-400 transition-colors leading-none">
                        {(item.total_score || item.score || 0).toLocaleString()}
                    </span>
                    <span className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em] mt-1">Points</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        !isValidating && (
          <div className="py-12 text-center border border-dashed border-white/5 rounded-2xl bg-zinc-900/10">
             <div className="inline-flex p-3 rounded-full bg-white/5 mb-3">
                <History size={20} className="text-zinc-800" />
             </div>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">No Recorded Performances</p>
          </div>
        )
      )}

      {hasMore && (
        <button 
          onClick={() => setSize(size + 1)} 
          disabled={isValidating}
          className="group mt-6 w-full flex items-center justify-center gap-2 py-3 bg-zinc-900/50 hover:bg-white hover:text-black border border-white/5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isValidating ? (
            <Loader2 size={14} className="animate-spin text-green-500" />
          ) : (
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Load More Sessions</span>
          )}
        </button>
      )}
    </div>
  );
}