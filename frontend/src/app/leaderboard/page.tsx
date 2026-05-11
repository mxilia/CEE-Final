"use client"

import Image from "next/image"
import Link from "next/link"
import useSWRInfinite from "swr/infinite"
import { env } from "@/src/config/env"
import { ArrowLeft } from "lucide-react"

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

    if (!res.ok) {
        throw new Error("Failed to fetch leaderboard")
    }

    return res.json()
}

const getKey = (
    pageIndex: number,
    previousPageData: LeaderboardResponse | null
) => {

    // stop when last page reached
    if (
        previousPageData &&
        previousPageData.meta.page >= previousPageData.meta.totalPages
    ) {
        return null
    }

    return `${env.API_URL}/users?page=${pageIndex + 1}`
}

export default function Leaderboard() {

    const {
        data,
        isLoading,
        size,
        setSize,
        isValidating,
    } = useSWRInfinite<LeaderboardResponse>(
        getKey,
        fetcher,
        {
            revalidateOnFocus: false,
            persistSize: true,
        }
    )

    // flatten pages
    const leaderboard =
        data?.flatMap((page) => page.data) || []

    // latest meta
    const meta = data?.[data.length - 1]?.meta

    const hasMore =
        meta ? meta.page < meta.totalPages : false

    console.log("Leaderboard data:", data)

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-green-500 font-mono animate-pulse uppercase tracking-[0.3em]">
                    Loading Rankings...
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 pt-0 font-sans">
            <div className="max-w-4xl mx-auto pb-12">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-12">

                    <Link
                        href="/home"
                        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
                    >
                        <ArrowLeft
                            size={20}
                            className="group-hover:-translate-x-1 transition-transform"
                        />

                        <span className="text-xs font-bold uppercase tracking-widest">
                            Back to Lobby
                        </span>
                    </Link>

                    <div className="text-right">
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
                            Top <span className="text-green-500">Performers</span>
                        </h1>

                        <p className="text-zinc-500 text-xs uppercase tracking-[0.2em] mt-2 font-bold">
                            Global Standings
                        </p>
                    </div>
                </div>

                {/* LIST */}
                <div className="space-y-2">

                    {leaderboard.map((player, i) => (
                        
                        <Link
                            href={`/user/${player.handler}`}
                            key={`${player.handler}-${i}`}
                            className="group flex items-center justify-between p-4 bg-zinc-900/20 hover:bg-zinc-800/40 border border-white/5 rounded-2xl transition-all hover:scale-[1.01] cursor-pointer"
                        >

                            <div className="flex items-center gap-4">

                                <span className="w-8 font-mono text-zinc-600 font-bold">
                                    #{(i + 1).toString().padStart(2, "0")}
                                </span>

                                <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-white/10">

                                    <Image
                                        src={
                                            player.profile_url ||
                                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.handler}`
                                        }
                                        alt={player.handler}
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-cover"
                                        unoptimized
                                    />

                                </div>

                                <span className="font-bold text-zinc-200">
                                    {player.handler}
                                </span>

                            </div>

                            <div className="text-right">

                                <span className="font-mono text-white font-black">
                                    {player.total_score ?? 0}
                                </span>

                                <span className="ml-2 text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">
                                    PTS
                                </span>

                            </div>

                        </Link>
                    ))}

                </div>

                {/* LOAD MORE */}
                {hasMore && (
                    <div className="flex justify-center mt-8">

                        <button
                            onClick={() => setSize(size + 1)}
                            disabled={isValidating}
                            className="px-6 py-3 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-bold uppercase tracking-widest transition-all"
                        >
                            {isValidating
                                ? "Loading..."
                                : "Load More"}
                        </button>

                    </div>
                )}

            </div>
        </div>
    )
}