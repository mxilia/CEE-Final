"use client"

import useSWRInfinite from "swr/infinite"
import { env } from "@/src/config/env"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function PlayHistory({ userId }: { userId: number }) {
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && pageIndex >= previousPageData.meta.totalPages) return null
    return `${env.API_URL}/play-history/user/${userId}?page=${pageIndex + 1}&limit=5`
  }
  

  const { data, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher)
  
  const playHistory = data ? data.flatMap((page) => page.data) : []
  const hasMore = data && data[data.length - 1]?.meta?.page < data[data.length - 1]?.meta?.totalPages


  console.log("Fetched play history data:", playHistory) // Debug log to verify fetched data
  
  return (
    <div className="relative flex flex-col rounded-2xl border border-neutral-800 bg-[#0a0a0a] p-6 sm:p-8 w-full">
      
      {/* Label Box */}
      <div className="absolute top-0 left-0 bg-neutral-800 text-neutral-300 text-sm font-extrabold px-6 py-1 rounded-br-2xl">
        3
      </div>

      <h2 className="text-2xl font-black italic text-white mb-6 mt-2 tracking-wider uppercase">
        HISTORY
      </h2>

      {playHistory.length > 0 ? (
        <div className="flex flex-col gap-3">
          {playHistory.map((song: any, idx: number) => (
            <div 
              key={song.id} 
              className="flex items-center gap-5 rounded-2xl border border-neutral-800 bg-[#121212] p-4 hover:bg-[#1a1a1a] transition-colors duration-200"
            >
              <div className="flex-shrink-0 text-neutral-500 bg-[#050505] p-3 rounded-xl border border-neutral-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              
              <div className="flex flex-col flex-1">
                <span className="text-lg font-black italic text-white tracking-wide uppercase">{song.song_name || song.song?.title || "Unknown Title"}</span>
                <span className="text-sm font-medium text-neutral-500 uppercase tracking-widest">{song.song_artist || song.song?.artist || "Unknown Artist"}</span>
              </div>

            </div>
          ))}
        </div>
      ) : (
        !isValidating && (
          <div className="py-8 text-center text-neutral-600 font-semibold bg-[#121212] rounded-xl border border-neutral-800">
            No play history.
          </div>
        )
      )}

      {hasMore && (
        <button 
          onClick={() => setSize(size + 1)} 
          disabled={isValidating}
          className="mt-5 w-full text-center py-3 text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-800 rounded-xl transition-all duration-200 text-sm font-bold uppercase tracking-widest disabled:opacity-50"
        >
          {isValidating ? "LOADING..." : "SHOW MORE"}
        </button>
      )}
    </div>
  );
}