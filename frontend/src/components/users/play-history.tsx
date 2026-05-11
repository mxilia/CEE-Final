"use client"

import useSWRInfinite from "swr/infinite"
import { env } from "@/src/config/env"
import { History, Calendar, Clock, Loader2, Music2 } from "lucide-react"

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
      <div className="absolute rounded-tl-xl top-0 left-0 bg-zinc-800 text-zinc-400 text-[10px] font-black px-4 py-1 rounded-br-xl uppercase tracking-widest">
        Session Log
      </div>

      <div className="flex items-center gap-2 mb-6 mt-4">
        <History size={18} className="text-green-500" />
        <h2 className="text-xl font-black italic text-white tracking-tighter uppercase">
          History
        </h2>
      </div>

      {playHistory.length > 0 ? (
        <div className="flex flex-col gap-2">
          {playHistory.map((item: any) => {
            const dateObj = new Date(item.created_at);
            
            // Formatters for better readability
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            const formattedTime = dateObj.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            return (
              <div 
                key={item.id} 
                className="group flex items-center justify-between p-3 rounded-xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-green-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="shrink-0 text-zinc-600 bg-black p-2.5 rounded-lg border border-white/5 group-hover:text-green-500 transition-colors">
                    <Music2 size={16} />
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm font-black italic text-white tracking-tight uppercase group-hover:text-green-400 transition-colors">
                      {item.song_name || item.song?.title || "Unknown Track"}
                    </span>
                    
                    {/* ENHANCED DATE/TIME STRIP */}
                    <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={11} className="text-green-500/50" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                                {formattedDate}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={11} className="text-green-500/50" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                                {formattedTime}
                            </span>
                        </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-white tabular-nums tracking-tighter group-hover:text-green-400 transition-colors">
                    {item.total_score?.toLocaleString() || item.score?.toLocaleString() || "0"}
                  </span>
                  <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest leading-none">Pts</p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        !isValidating && (
          <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">No Recorded Performances</p>
          </div>
        )
      )}

      {hasMore && (
        <button 
          onClick={() => setSize(size + 1)} 
          disabled={isValidating}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isValidating ? (
            <Loader2 size={14} className="animate-spin text-green-500" />
          ) : (
            <span className="text-[10px] font-black text-zinc-400 group-hover:text-white uppercase tracking-[0.2em]">Load More Sessions</span>
          )}
        </button>
      )}
    </div>
  );
}