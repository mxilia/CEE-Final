"use client"

import useSWRInfinite from "swr/infinite"
import { env } from "@/src/config/env"
import { Heart } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function FavoriteSong({ userId, isCurrentUser }: { userId: number, isCurrentUser: boolean }) {
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && pageIndex >= previousPageData.meta.totalPages) return null
    return `${env.API_URL}/favorite-songs/user/${userId}?page=${pageIndex + 1}&limit=5`
  }

  const { data, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher)

  const favorites = data ? data.flatMap((page) => page.data) : []
  const hasMore = data && data[data.length - 1]?.meta?.page < data[data.length - 1]?.meta?.totalPages

  return (
    <div className="relative flex flex-col rounded-2xl border border-neutral-800 bg-[#0a0a0a] p-6 sm:p-8 w-full">
      
      {/* Label Box */}
      <div className="absolute top-0 left-0 bg-neutral-800 text-neutral-300 text-sm font-extrabold px-6 py-1 rounded-br-2xl">
        ★
      </div>

      <h2 className="text-2xl font-black italic text-white mb-6 mt-2 tracking-wider uppercase">
        FAVORITE SONGS
      </h2>
      
      <div className="flex flex-col gap-3">
        {favorites.length > 0 ? (
          favorites.map((fav: any) => (
            <div 
              key={fav.id} 
              className="flex items-center gap-5 rounded-2xl border border-neutral-800 bg-[#121212] p-4 hover:bg-[#1a1a1a] transition-colors duration-200"
            >
              <div className="flex-shrink-0 text-neutral-500 bg-[#050505] p-3 rounded-xl border border-neutral-800">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              </div>
              
              <div className="flex flex-col flex-1">
                <span className="text-lg font-black italic text-white tracking-wide uppercase">{fav.song_name || fav.song?.title}</span>
                <span className="text-sm font-medium text-neutral-500 uppercase tracking-widest">{fav.song_artist || fav.song?.artist || "Unknown Artist"}</span>
              </div>

              {/* Heart Toggle for Current User */}
              {isCurrentUser && (
                <button className="text-red-500 hover:text-red-400 transition-colors ml-4 flex-shrink-0">
                  <Heart fill="currentColor" size={20} />
                </button>
              )}
            </div>
          ))
        ) : (
          !isValidating && (
            <div className="py-8 text-center text-neutral-600 font-semibold bg-[#121212] rounded-xl border border-neutral-800">
              No favorite songs found.
            </div>
          )
        )}
      </div>

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