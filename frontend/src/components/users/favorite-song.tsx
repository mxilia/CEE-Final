"use client"

import useSWRInfinite from "swr/infinite"
import { env } from "@/src/config/env"
import { Heart, Music, Loader2, Star, Play } from "lucide-react"
import { useMemo } from "react"
import Link from "next/link"

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    credentials: "include",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch")
  }

  return res.json()
}

export default function FavoriteSong({
  userId,
  isCurrentUser,
}: {
  userId: number
  isCurrentUser: boolean
}) {
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (
      previousPageData &&
      pageIndex + 1 > previousPageData.meta.totalPages
    ) {
      return null
    }

    return `${env.API_URL}/favorite-songs/user/${userId}?page=${pageIndex + 1}&limit=5`
  }

  const {
    data,
    size,
    setSize,
    isValidating,
    mutate: mutateFavorites,
  } = useSWRInfinite(getKey, fetcher)

  const toggleFavorite = async (
    e: React.MouseEvent,
    songId: number
  ) => {
    e.preventDefault()
    e.stopPropagation()

    const response = await fetch(`${env.API_URL}/favorite-songs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        song_id: songId,
      }),
      credentials: "include",
    })
    if (!response.ok) return
    await mutateFavorites()
  }

  const favorites = useMemo(() => {
    return data ? data.flatMap((page: any) => page.data) : []
  }, [data])

  const hasMore =
    data &&
    data.length > 0 &&
    data[data.length - 1]?.meta?.page <
    data[data.length - 1]?.meta?.totalPages

  return (
    <div className="relative flex flex-col rounded-2xl border border-white/5 bg-zinc-950 p-5 w-full shadow-xl">
      {/* Decorative Star Label */}
      <div className="absolute top-0 left-0 bg-zinc-800 text-yellow-500 text-[10px] font-black px-4 py-1 rounded-br-xl rounded-tl-xl uppercase tracking-widest">
        ★ Favorites
      </div>

      <div className="flex items-center gap-2 mb-6 mt-4">
        <Star size={18} className="text-yellow-500 fill-yellow-500" />
        <h2 className="text-xl font-black italic text-white tracking-tighter uppercase">
          Playlist
        </h2>
      </div>

      <div className="flex flex-col gap-2">
        {favorites.length > 0 ? (
          favorites.map((fav: any) => (
            <div
              key={fav.id}
              className="group flex items-center justify-between p-3 rounded-xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-red-500/20 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                {/* Miniature Icon Box */}
                <div className="shrink-0 text-zinc-600 bg-black p-2.5 rounded-lg border border-white/5 group-hover:text-yellow-500 transition-colors">
                  <Music size={16} />
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-black italic text-white tracking-tight uppercase group-hover:text-white transition-colors">
                    {fav.song_name || fav.song?.title}
                  </span>

                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                    {fav.song_artist ||
                      fav.song?.artist ||
                      "Unknown Artist"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Heart Toggle for Current User */}
                {isCurrentUser && (
                  <button
                    className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all active:scale-75"
                    title="Remove from favorites"
                    onClick={(e) =>
                      toggleFavorite(e, fav.song_id)
                    }
                  >
                    <Heart fill="currentColor" size={16} />
                  </button>
                )}
                <Link
                  href={`/lobby/${fav.song_id}`}
                  className="flex items-center gap-2 px-2.5 py-2.5 bg-white text-black rounded-full font-black text-[10px] tracking-widest hover:bg-green-400 transition-all active:scale-95"
                >
                  <div>
                    <Play size={12} fill="black" />
                  </div>
                </Link>
              </div>
            </div>
          ))
        ) : (
          !isValidating && (
            <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                No saved tracks
              </p>
            </div>
          )
        )}
      </div>

      {hasMore && (
        <button
          onClick={() => setSize(size + 1)}
          disabled={isValidating}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 group"
        >
          {isValidating ? (
            <Loader2
              size={14}
              className="animate-spin text-yellow-500"
            />
          ) : (
            <span className="text-[10px] font-black text-zinc-500 group-hover:text-white uppercase tracking-[0.2em]">
              View More Tracks
            </span>
          )}
        </button>
      )}
    </div>
  )
}