"use client"

import { UserX, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function UserNotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
            {/* Animated Icon Container */}
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-red-500/20 blur-[60px] rounded-full animate-pulse" />
                <div className="relative w-24 h-24 bg-zinc-900 border border-white/10 rounded-4xl flex items-center justify-center shadow-2xl">
                    <UserX size={40} className="text-zinc-600" />
                </div>
                {/* Glitch Effect Element */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full border-4 border-black flex items-center justify-center">
                    <span className="text-[10px] font-black text-white">!</span>
                </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2 mb-10">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                    User <span className="text-red-500">Not Found</span>
                </h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] max-w-xs mx-auto leading-relaxed">
                    The requested profile does not exist.
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link 
                    href="/home"
                    className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:bg-green-400 transition-all active:scale-95 shadow-xl"
                >
                    <ArrowLeft size={14} />
                    Back to Lobby
                </Link>
            </div>

            {/* Decorative Background Text */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-[0.02] pointer-events-none select-none">
                <h3 className="text-[15vw] font-black italic uppercase leading-none">
                    404 ERROR
                </h3>
            </div>
        </div>
    )
}