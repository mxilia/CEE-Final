"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR, { mutate } from "swr"
import { env } from "@/src/config/env"
import { Camera, Save, X, Star, Trophy, Flame, Mic2, User, Target, Zap, Activity } from "lucide-react"

interface UserDataProps {
    minutes_played: any
    id: string // Updated to string/uuid to match backend
    handler: string
    profile_url: string
    ranking?: string
    streak?: number
    total_score: number
    // --- Added new stats from your Go entity ---
    accuracy: number
    max_combo: number
    sing_count: number
    best_song?: { name: string; score: number }
}

export default function FullUser({ User: userData, isCurrentUser }: { User: UserDataProps, isCurrentUser: boolean }) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        handler: userData?.handler || "",
        profile_url: userData?.profile_url || ""
    })

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const res = await fetch(`${env.API_URL}/users/${userData.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            })
            if (!res.ok) throw new Error()
            if (formData.handler !== userData.handler) {
                router.push(`/user/${formData.handler}`)
            } else {
                await mutate(`${env.API_URL}/users/handler/${userData.handler}`)
                await mutate(`${env.API_URL}/me`)
                setIsEditing(false)
            }
        } catch (error) {
            alert("Update failed.")
        } finally {
            setIsSaving(false)
        }
    }

    const { data: rankingData, isLoading: isRankingLoading } = useSWR(isCurrentUser ? `${env.API_URL}/users/${userData.id}/ranking` : null, {
        fetcher: (url) => fetch(url, { credentials: "include" }).then(res => res.json()),
        suspense: true,
    })

    console.log("userData:", userData) // Debug log to verify user data
    return (
        <div className="w-full space-y-4">
            {/* --- COMPACT MINI PROFILE --- */}
            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-950 p-5 shadow-xl w-full">
                {/* HUD Label */}
                <div className="absolute top-0 left-0 bg-zinc-800 text-zinc-400 text-[10px] font-black px-4 py-1 rounded-br-xl uppercase tracking-widest z-10">
                    Player Profile
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5 mt-4 sm:mt-0">
                    {/* Avatar Block */}
                    <div className="relative group shrink-0">
                        <div className="w-24 h-24 rounded-2xl border-2 border-zinc-800 bg-zinc-900 overflow-hidden relative shadow-lg">
                            {formData.profile_url || userData.profile_url ? (
                                <img 
                                    src={isEditing ? formData.profile_url : userData.profile_url} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-700">
                                    <User size={40} />
                                </div>
                            )}
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-[2px]">
                                    <Camera size={20} className="text-white animate-pulse" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Identity & Stats */}
                    <div className="flex-1 w-full text-center sm:text-left space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {isEditing ? (
                                <div className="flex flex-col gap-2 w-full max-w-xs">
                                    <input 
                                        value={formData.handler} 
                                        onChange={e => setFormData({...formData, handler: e.target.value})}
                                        className="bg-zinc-900 border border-green-500/30 rounded-lg px-3 py-1.5 text-lg font-bold text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                                        placeholder="Username"
                                    />
                                    <input 
                                        value={formData.profile_url} 
                                        onChange={e => setFormData({...formData, profile_url: e.target.value})}
                                        className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-1 text-[10px] text-zinc-500 focus:outline-none"
                                        placeholder="Avatar URL"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center sm:justify-start gap-2">
                                    <h1 className="text-3xl font-black italic tracking-tighter text-white leading-none">
                                        {userData.handler || 'Guest'}
                                    </h1>
                                </div>
                            )}

                            {isCurrentUser && (
                                <div className="flex justify-center gap-2">
                                    {isEditing ? (
                                        <>
                                            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-colors" title="Cancel"><X size={16}/></button>
                                            <button onClick={handleSave} disabled={isSaving} className="p-2 bg-green-500 text-black rounded-full hover:bg-green-400 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50">
                                                <Save size={16}/>
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => setIsEditing(true)} className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white border border-white/5 px-3 py-1 rounded-full transition-all bg-white/5">Settings</button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* --- NEW STATS GRID --- */}
                        <div className="grid grid-cols-2 xs:flex xs:flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-3 pt-2">
                            <MiniStat icon={<Trophy size={14}/>} value={rankingData?.ranking || "—"} label="Rank" color="text-yellow-500" />
                            <MiniStat icon={<Mic2 size={14}/>} value={userData ? userData.total_score?.toLocaleString() || "0" : "0"} label="Total Score" color="text-green-500" />
                            <MiniStat icon={<Target size={14}/>} value={`${userData?.accuracy.toFixed(1) || "0"}%`} label="Accuracy" color="text-blue-500" />
                            <MiniStat icon={<Zap size={14}/>} value={userData?.max_combo ?? 0} label="Max Combo" color="text-orange-500" />
                            <MiniStat icon={<Activity size={14}/>} value={userData?.sing_count ?? 0} label="Sessions" color="text-purple-500" />
                            <MiniStat icon={<Flame size={14}/>} value={userData?.minutes_played?.toFixed(1) || "0"} label="Minutes Played" color="text-red-500" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function MiniStat({ 
    icon, 
    value, 
    label, 
    color = "text-green-500" 
}: { 
    icon: React.ReactNode, 
    value: string | number, 
    label: string,
    color?: string
}) {
    return (
        <div className="flex items-center gap-2 group/stat">
            <div className={`${color} bg-white/5 p-1.5 rounded-lg group-hover/stat:bg-white/10 transition-colors`}>
                {icon}
            </div>
            <div className="flex flex-col leading-none">
                <span className="text-sm font-black text-white">{value}</span>
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
            </div>
        </div>
    )
}