'use client'

import { useEffect, useState } from 'react'
import { Heart, Play, Mic2 } from 'lucide-react'
import { cn } from '@/src/lib/utils'
import Link from 'next/link'
import { env } from '@/src/config/env'

interface SongProps {
    song: {
        id: number
        name: string
        artist?: string
    }
}

export const SongBox = ({ song }: SongProps) => {
    const [isFavorite, setIsFavorite] = useState(false)

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            try {
                const response = await fetch(`${env.API_URL}/favorite-songs/is-favorite/song/${song.id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    credentials: "include",
                })
                const data = await response.json()
                setIsFavorite(data.is_favorite)
            } catch (error) {
                console.error('Error checking favorite status:', error)
            }
        }
        checkFavoriteStatus()
    }, [song.id])

    const toggleFavorite = async (e: React.MouseEvent, songId: number) => {
        e.preventDefault()
        e.stopPropagation()
        setIsFavorite(!isFavorite)
        await fetch(`${env.API_URL}/favorite-songs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ song_id: songId }),
            credentials: "include",
        })
    }

    return (
        <div className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-zinc-900/40 hover:bg-zinc-900/60 border border-white/5 rounded-2xl sm:rounded-4xl transition-all duration-300 hover:scale-[1.01] hover:border-white/10 ring-1 ring-white/5 shadow-xl gap-4 sm:gap-0">
            
            {/* Left Section: Icon + Text */}
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                {/* Visual Thumbnail - Shrinks slightly on mobile */}
                <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/5 overflow-hidden">
                    <Mic2
                        className={cn(
                            "transition-colors duration-500",
                            isFavorite ? "text-green-500" : "text-zinc-600 group-hover:text-zinc-400"
                        )}
                        size={18}
                    />
                </div>

                <div className="flex flex-col min-w-0 pr-2">
                    <h3 className="text-base sm:text-lg font-black uppercase italic tracking-tighter text-white leading-tight truncate">
                        {song.name}
                    </h3>
                    <p className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-0.5 truncate">
                        {song.artist || "Unknown Artist"}
                    </p>
                </div>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t border-white/5 sm:border-none pt-3 sm:pt-0">
                {/* Favorite Toggle */}
                <button
                    onClick={(e) => toggleFavorite(e, song.id)}
                    className={cn(
                        "p-2.5 sm:p-3 rounded-full transition-all active:scale-75",
                        isFavorite
                            ? "text-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                            : "text-zinc-600 hover:text-zinc-400 hover:bg-white/5"
                    )}
                >
                    <Heart
                        size={18}
                        fill={isFavorite ? "currentColor" : "none"}
                        className="transition-transform duration-300"
                    />
                </button>

                {/* Entry Action - Responsive Width */}
                <Link
                    href={`/lobby/${song.id}`}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-white text-black rounded-full font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-green-400 transition-all shadow-lg active:scale-95"
                >
                    <Play size={10} fill="black" className="sm:w-[12px] sm:h-[12px]" />
                    <span className="whitespace-nowrap">Enter Stage</span>
                </Link>
            </div>
            
            {/* Subtle Mobile Edge Glow */}
            <div className="absolute inset-0 rounded-2xl sm:rounded-4xl pointer-events-none border border-white/0 group-hover:border-white/5 transition-colors hidden sm:block" />
        </div>
    )
}