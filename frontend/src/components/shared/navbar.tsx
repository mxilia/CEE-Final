"use client"

import Link from "next/link"
import Image from "next/image"
import { Trophy, LogOut, User, LogIn ,Home} from "lucide-react"
import useSWR from "swr"
import { env } from "@/src/config/env"
import { logout } from "@/src/lib/auth"

const fetcher = async (url: string) => {
    const res = await fetch(url, {
        credentials: "include",
    })
    if (!res.ok) {
        throw new Error("Failed to fetch user")
    }
    return res.json()
}

export default function KaraokeNavbar() {
    const { data: userData } = useSWR(
        `${env.API_URL}/me`,
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            refreshInterval: 0,
            dedupingInterval: 1000 * 60 * 60, // 1 hour cache
        }
    )
    return (
        <nav className="sticky top-0 bg-black left-0 right-0 z-100 px-6 py-6 pointer-events-none">
            <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
                <div />

                <div className="flex items-center gap-3 pointer-events-auto">

                    {/* USER PROFILE */}
                    <Link className="flex duration-300 hover:border-green-500 items-center gap-3 px-4 py-1.5 bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-full ring-1 ring-white/10" href={`/user/${userData?.handler || "anonymous"}`}>

                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
                                Player
                            </p>

                            <p className="text-xs font-black text-white truncate max-w-25">
                                {userData?.handler || "anonymous"}
                            </p>
                        </div>

                        <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden bg-zinc-800 flex items-center justify-center">

                            {userData?.profile_url ? (
                                <Image
                                    src={userData.profile_url}
                                    alt={userData.handler || "avatar"}
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-cover"
                                    unoptimized
                                    onError={(e) => {
                                        console.error("Avatar failed to load")
                                    }}
                                />
                            ) : (
                                <User size={16} className="text-zinc-500" />
                            )}

                        </div>
                    </Link>

                    <div className="h-8 w-px bg-white/10 mx-1" />

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center gap-2">

                        {/* Home */}
                        <Link
                            href="/home"
                            className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-5 bg-zinc-900/50 hover:bg-zinc-800 backdrop-blur-md border border-white/5 rounded-full transition-all hover:scale-105 active:scale-95 group"
                            title="Home"
                        >
                            {/* I want white home Icon */}
                            <Home
                                size={14}
                                className="text-white group-hover:animate-bounce"
                            />

                            <span className="hidden sm:inline-block ml-2 text-xs font-bold uppercase tracking-widest text-white">
                                Home
                            </span>
                        </Link>


                        <Link
                            href="/leaderboard"
                            className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-5 bg-zinc-900/50 hover:bg-zinc-800 backdrop-blur-md border border-white/5 rounded-full transition-all hover:scale-105 active:scale-95 group"
                            title="Leaderboard"
                        >
                            <Trophy
                                size={14}
                                className="text-yellow-500 group-hover:animate-bounce"
                            />

                            <span className="hidden sm:inline-block ml-2 text-xs font-bold uppercase tracking-widest text-white">
                                Rank
                            </span>
                        </Link>





                        {userData ? <button
                            onClick={async () => {
                                await logout()
                            }}
                            className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-full transition-all active:scale-95 group"
                            title="Logout"
                        >
                            <LogOut
                                size={14}
                                className="text-red-500 group-hover:-translate-x-1 transition-transform"
                            />

                            <span className="hidden sm:inline-block ml-2 text-xs font-bold uppercase tracking-widest text-red-500">
                                LOGOUT
                            </span>
                        </button>
                            : <button
                                onClick={async () => {
                                    // Trigger your login logic or redirect here
                                    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login`;
                                }}
                                className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-5 bg-green-500/10 hover:bg-green-400/20 border border-green-500/20 rounded-full transition-all active:scale-95 group"
                                title="Login"
                            >
                                <LogIn
                                    size={14}
                                    className="text-green-500 group-hover:translate-x-1 transition-transform"
                                />

                                <span className="hidden sm:inline-block ml-2 text-xs font-bold uppercase tracking-widest text-green-500">
                                    LOGIN
                                </span>
                            </button>}

                    </div>
                </div>
            </div>
        </nav>
    )
}