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
        artist?: string // Adding artist field
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

    // Prevents the favorite button click from triggering the Link redirect
    const toggleFavorite = async (e: React.MouseEvent, songId: number) => {
        e.preventDefault()
        e.stopPropagation()
        setIsFavorite(!isFavorite)
        const response = await fetch(`${env.API_URL}/favorite-songs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                song_id: songId
            }),
            credentials: "include",
        })
    }

    return (
        <div className="group relative flex items-center justify-between p-4 bg-zinc-900/40 hover:bg-zinc-900/60 border border-white/5 rounded-4xl transition-all duration-300 hover:scale-[1.01] hover:border-white/10 ring-1 ring-white/5 shadow-xl">

            <div className="flex items-center gap-4">
                {/* Visual Thumbnail */}
                <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/5 overflow-hidden">
                    <Mic2
                        className={cn(
                            "transition-colors duration-500",
                            isFavorite ? "text-green-500" : "text-zinc-600 group-hover:text-zinc-400"
                        )}
                        size={20}
                    />
                </div>

                <div className="flex flex-col">
                    <h3 className="text-lg font-black uppercase italic tracking-tighter text-white leading-tight">
                        {song.name}
                    </h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-0.5">
                        {song.artist || "Unknown Artist"}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Favorite Toggle */}
                <button
                    onClick={(e) => toggleFavorite(e, song.id)}
                    className={cn(
                        "p-3 rounded-full transition-all active:scale-75",
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

                {/* Entry Action */}
                <Link
                    href={`/lobby/${song.id}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-green-400 transition-all shadow-lg active:scale-95"
                >
                    <Play size={12} fill="black" />
                    Enter Stage
                </Link>
            </div>
        </div>
    )
}