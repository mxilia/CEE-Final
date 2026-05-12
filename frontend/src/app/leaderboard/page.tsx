"use client"

import Image from "next/image"
import Link from "next/link"
import useSWRInfinite from "swr/infinite"
import { env } from "@/src/config/env"
import { ArrowLeft, Trophy, Activity, Loader2 } from "lucide-react"
import { cn } from "@/src/lib/utils"

type LeaderboardEntry = {
    handler: string
    profile_url?: string
    total_score: number
}

type LeaderboardResponse = {
    data: LeaderboardEntry[]
    meta: {
        page: number
        total: number
        totalPages: number
    }
}

const fetcher = async (url: string): Promise<LeaderboardResponse> => {
    const res = await fetch(url)
    if (!res.ok) throw new Error("Failed to fetch leaderboard")
    return res.json()
}

const getKey = (pageIndex: number, previousPageData: LeaderboardResponse | null) => {
    if (previousPageData && previousPageData.meta.page >= previousPageData.meta.totalPages) return null
    return `${env.API_URL}/users?page=${pageIndex + 1}`
}

export default function Leaderboard() {
    const { data, isLoading, size, setSize, isValidating } = useSWRInfinite<LeaderboardResponse>(
        getKey,
        fetcher,
        { revalidateOnFocus: false, persistSize: true }
    )

    const leaderboard = data?.flatMap((page) => page.data) || []
    const meta = data?.[data.length - 1]?.meta
    const hasMore = meta ? meta.page < meta.totalPages : false

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
                <Loader2 className="text-green-500 animate-spin" size={40} />
                <div className="text-green-500 font-black uppercase tracking-[0.4em] text-xs">
                    Syncing Rankings...
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-8 pt-0 font-sans selection:bg-green-500 selection:text-black">
            <div className="max-w-4xl mx-auto pb-12">

                {/* NAVIGATION */}
                <div className="py-6 flex items-center">
                    <Link
                        href="/home"
                        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exit to Lobby</span>
                    </Link>
                </div>

                {/* HEADER CARD */}
                <div className="relative mb-12 p-8 rounded-2xl border border-white/5 bg-zinc-900/20 overflow-hidden">
                    <div className="absolute top-0 left-0 bg-zinc-800 text-green-500 text-[10px] font-black px-4 py-1 rounded-br-xl uppercase tracking-widest z-10">
                        Live Standings
                    </div>
                    {/* Scanning Grid Background */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-5xl sm:text-7xl font-black italic uppercase tracking-tighter leading-none">
                                Top <span className="text-green-500 underline decoration-green-500/30 underline-offset-8">Performers</span>
                            </h1>
                            <div className="flex items-center gap-3 mt-4">
                                <Trophy size={14} className="text-green-500" />
                                <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-black">
                                    Leaderboard!!
                                </p>
                            </div>
                        </div>
                        <div className="hidden sm:block text-right border-l border-white/10 pl-6">
                            <div className="text-xs font-black text-zinc-600 uppercase tracking-widest">Total Registered</div>
                            <div className="text-3xl font-black tabular-nums">{meta?.total.toLocaleString() ?? "---"}</div>
                        </div>
                    </div>
                </div>

                {/* LIST HEADERS */}
                <div className="px-6 mb-4 flex items-center justify-between text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-12">
                        <span>Rank</span>
                        <span>User Profile</span>
                    </div>
                    <span>Accumulated Score</span>
                </div>

                {/* LIST */}
                <div className="space-y-3">
                    {leaderboard.map((player, i) => (
                        <Link
                            href={`/user/${player.handler}`}
                            key={`${player.handler}-${i}`}
                            className="group relative flex items-center justify-between p-4 bg-zinc-950 hover:bg-zinc-900 border border-white/5 hover:border-green-500/30 rounded-xl transition-all hover:scale-[1.01] cursor-pointer"
                        >
                            <div className="flex items-center gap-4 sm:gap-8">
                                <span className={cn(
                                    "w-8 font-black italic text-sm transition-colors",
                                    i === 0 ? "text-green-500" : i === 1 ? "text-green-400/70" : i === 2 ? "text-green-300/50" : "text-zinc-700 group-hover:text-zinc-400"
                                )}>
                                    #{(i + 1).toString().padStart(2, "0")}
                                </span>

                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border-2 border-white/5 group-hover:border-green-500/50 transition-all">
                                        <Image
                                            src={player.profile_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.handler}`}
                                            alt={player.handler}
                                            width={40}
                                            height={40}
                                            className="w-full h-full object-cover"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-white tracking-tight group-hover:text-green-400 transition-colors">
                                            {player.handler}
                                        </span>
                                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                                            Verified Account
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <span className="text-xl font-black text-white tabular-nums tracking-tighter">
                                        {(player.total_score ?? 0).toLocaleString()}
                                    </span>
                                    <span className="ml-2 text-[9px] text-green-500 font-black uppercase tracking-tighter bg-green-500/10 px-1.5 py-0.5 rounded">
                                        PTS
                                    </span>
                                </div>
                                <Activity size={14} className="text-zinc-800 group-hover:text-green-500/20 transition-colors" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* LOAD MORE */}
                {hasMore && (
                    <div className="flex flex-col items-center justify-center mt-12 gap-4">
                        <div className="h-px w-full bg-white/5 max-w-xs" />
                        <button
                            onClick={() => setSize(size + 1)}
                            disabled={isValidating}
                            className={cn(
                                "group relative px-8 py-3 rounded-full bg-zinc-950 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-white hover:text-black hover:border-white disabled:opacity-50 disabled:cursor-not-allowed",
                                isValidating && "animate-pulse"
                            )}
                        >
                            {isValidating ? "Updating Stream..." : "Load Next Segment"}
                        </button>
                        <p className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">
                            Showing {leaderboard.length} of {meta?.total} entries
                        </p>
                    </div>
                )}

            </div>
        </div>
    )
}