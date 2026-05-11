"use client"

import { use } from "react"
import useSWR from "swr"
import { env } from "@/src/config/env"
import FavoriteSong from "@/src/components/users/favorite-song"
import FullUser from "@/src/components/users/full-user"
import GraphHistory from "@/src/components/users/graph-history"
import PlayHistory from "@/src/components/users/play-history"
import UserNotFound from "@/src/components/users/user-not-found"
import BestPlay from "@/src/components/users/best-score"

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) throw new Error("API Fetch Error");
    return res.json()
});

export default function UserPage({ params }: { params: Promise<{ name: string }> }) {
    const { name } = use(params)

    const { data: user, error: userError } = useSWR(`${env.API_URL}/users/handler/${name}`, fetcher)
    
    console.log("Fetched user data:", user) // Debug log to verify fetched data
    // Fetch current logged in user to verify edit permissions
    const { data: me } = useSWR(`${env.API_URL}/me`, fetcher, { shouldRetryOnError: false })

    if (userError) return <UserNotFound />
    if (!user) return <div className="text-white text-center mt-20 animate-pulse">Loading Profile...</div>

    const isCurrentUser = me?.id === user.id

    return (
        <div className="min-h-screen bg-[rgb(4, 9, 14)] text-sky-200 px-4 sm:px-6 lg:px-12 py-8 bg-[radial-gradient(circle_at_top,rgba(78, 78, 78, 0.18),transparent_55%)]">
            <div className="mx-auto flex flex-col gap-y-6 w-full max-w-6xl">
                <FullUser User={user} isCurrentUser={isCurrentUser} />
                <FavoriteSong userId={user.id} isCurrentUser={isCurrentUser} />
                <GraphHistory userId={user.id} />
                <BestPlay />
                <PlayHistory userId={user.id} />
            </div>
        </div>
    );
}