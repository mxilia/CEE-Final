'use client'

import { env } from '@/src/config/env'
import useSWRInfinite from 'swr/infinite'
import { SongBox } from './song-box'
import { Music2, Sparkles, Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { cn } from '@/src/lib/utils'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SongList() {
    const searchParams = useSearchParams()
    const query = searchParams.get('q') || '' // Changed to 'q' to match your SearchBar

    // 1. Define the Key Generator for SWR Infinite
    const getKey = (pageIndex: number, previousPageData: any) => {
        // If we reached the end, return null
        if (previousPageData && pageIndex >= previousPageData.meta.totalPages) return null
        
        // SWR pageIndex is 0-based, but most APIs use 1-based pagination
        return `${env.API_URL}/songs?title=${query}&page=${pageIndex + 1}&limit=10`
    }

    const { data, error, size, setSize, isValidating, isLoading } = useSWRInfinite(getKey, fetcher)

    // 2. Flatten the nested data [ [{song}, {song}], [{song}, {song}] ]
    const songs = data ? data.flatMap((page) => page.data).map((song: any) => ({
        id: song.id,
        name: song.title,
        artist: song.artist || "Unknown Artist"
    })) : []

    const isEmpty = data?.[0]?.data.length === 0
    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.meta.page >= data[data.length - 1]?.meta.totalPages)
    const isRefreshing = isValidating && data && data.length === size

    // 3. Infinite Scroll Observer
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !isReachingEnd && !isValidating) {
                setSize(size + 1)
            }
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [size, isReachingEnd, isValidating, setSize])

    if (isLoading) return (
        <div className="flex flex-col gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 w-full bg-zinc-900/50 rounded-3xl border border-white/5" />
            ))}
        </div>
    )

    if (error) return <p className="text-red-500 font-bold uppercase tracking-tighter">Stage connection lost</p>

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                        <Music2 className="text-green-500 w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Available Tracks</h2>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Select your stage</p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    <Sparkles size={12} className={cn(isValidating ? "animate-spin text-green-500" : "text-yellow-500")} />
                    {songs.length} Tracks Loaded
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {songs.map((song: any) => (
                    <SongBox key={song.id} song={song} />
                ))}
            </div>

            {/* LOADING STATE FOR NEW PAGES */}
            {isValidating && !isRefreshing && (
                <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-green-500" size={32} />
                </div>
            )}

            {isEmpty && (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
                    <p className="text-lg text-zinc-600 font-black uppercase italic">No tracks found for "{query}"</p>
                </div>
            )}

            {isReachingEnd && !isEmpty && (
                <div className="py-10 text-center">
                    <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.4em]">End of Playlist</p>
                </div>
            )}
        </div>
    )
}