"use client"

import { env } from "@/src/config/env"
import { cn } from "@/src/lib/utils"
import { useEffect, useMemo, useRef, useState } from "react"
import useSWR from "swr"

type Segment = { start: number; end: number; text: string }
type PitchPoint = { t: number; f: number; note: string; confidence: number }

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function Karaoke({ songId }: { songId: string }) {
    // Refs for non-reactive audio and game state
    const audioRef = useRef<HTMLAudioElement>(null)
    const rafRef = useRef<number | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    
    // Performance Tracking Refs
    const scoreRef = useRef(0)
    const comboRef = useRef(0)
    const maxComboRef = useRef(0)
    const totalPossibleHits = useRef(0)
    const successfulHits = useRef(0)

    // UI & Game State
    const [time, setTime] = useState(0)
    const [userPitch, setUserPitch] = useState<{ f: number, m: number } | null>(null)
    const [score, setScore] = useState(0)
    const [combo, setCombo] = useState(0)
    const [accuracy, setAccuracy] = useState(0)
    const [isStarted, setIsStarted] = useState(false)
    const [micActive, setMicActive] = useState(false)
    const [isEnded, setIsEnded] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isError, setIsError] = useState(false)

    // Fetch Song Data
    const { data: lyricsData } = useSWR(`${env.API_URL}/songs/${songId}/lyrics`, fetcher)
    const { data: pitchData, isLoading } = useSWR<PitchPoint[]>(`${env.API_URL}/songs/${songId}/pitch`, fetcher)

    const submitScore = async () => {
        try {
            setIsSubmitting(true)
            const finalAccuracy = totalPossibleHits.current > 0 
                ? (successfulHits.current / totalPossibleHits.current) * 100 
                : 0

            const response = await fetch(`${env.API_URL}/play-history`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    total_score: scoreRef.current,
                    max_combo: maxComboRef.current,
                    accuracy: parseFloat(finalAccuracy.toFixed(2)),
                    song_id: Number(songId),
                    minutes_played: audioRef.current ? audioRef.current.duration / 60.0 : 0
                }),
                credentials: "include",
            })
            setIsSubmitting(false)
            if (!response.ok) {
                setIsError(true)
                return
            }
        } catch (err) {
            setIsSubmitting(false)
            setIsError(true)
        }
    }

    // 1. Initialize Audio Worklet and Microphone
    const startSession = async () => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
            if (ctx.state === 'suspended') await ctx.resume()

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
            })

            await ctx.audioWorklet.addModule("/worklets/pitch-processor.js")

            const micNode = ctx.createMediaStreamSource(stream)
            const pitchNode = new AudioWorkletNode(ctx, "pitch-processor")

            pitchNode.port.onmessage = (event) => {
                const { pitch } = event.data
                const curTime = audioRef.current?.currentTime || 0
                const target = pitchData?.find(p => Math.abs(p.t - curTime) < 0.1)

                if (pitch && pitch > 60 && pitch < 1000) {
                    const midi = 12 * Math.log2(pitch / 440) + 69
                    setUserPitch({ f: pitch, m: midi })
                    setMicActive(true)

                    if (target && target.f > 0) {
                        totalPossibleHits.current += 1
                        const targetMidi = 12 * Math.log2(target.f / 440) + 69
                        const diff = Math.abs(midi - targetMidi)

                        if (diff < 1.5) {
                            // HIT
                            const points = Math.floor((1.5 - diff) * 10)
                            scoreRef.current += points
                            successfulHits.current += 1
                            comboRef.current += 1
                            if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current
                            
                            setScore(scoreRef.current)
                            setCombo(comboRef.current)
                        } else {
                            // MISS (Wrong Pitch)
                            comboRef.current = 0
                            setCombo(0)
                        }
                    }
                } else {
                    setUserPitch(null)
                    setMicActive(false)
                    // MISS (Silence during a note)
                    if (target && target.f > 0) {
                        comboRef.current = 0
                        setCombo(0)
                    }
                }

                // Update accuracy based on total opportunities seen so far
                if (totalPossibleHits.current > 0) {
                    setAccuracy((successfulHits.current / totalPossibleHits.current) * 100)
                }
            }

            micNode.connect(pitchNode)
            audioContextRef.current = ctx
            setIsStarted(true)

            if (audioRef.current) {
                audioRef.current.play().catch(() => {
                    setTimeout(() => audioRef.current?.play(), 150)
                })
            }
        } catch (err) {
            alert("Could not access microphone.")
        }
    }

    // 2. Audio Sync Loop
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const update = () => {
            setTime(audio.currentTime)
            rafRef.current = requestAnimationFrame(update)
        }

        audio.addEventListener("play", () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
            rafRef.current = requestAnimationFrame(update)
        })

        audio.addEventListener("ended", () => {
            setIsEnded(true)
            submitScore()
        });

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [isLoading])

    // 3. Current lyric logic
    const currentLyric: Segment | null = useMemo(() => {
        if (!lyricsData?.segments) return null
        return lyricsData.segments.find((s: Segment) => time >= s.start && time <= s.end)
    }, [lyricsData, time])

    const getMidiY = (midi: number) => {
        const mMin = 45, mMax = 85
        const clamped = Math.max(mMin, Math.min(mMax, midi))
        return `${100 - ((clamped - mMin) / (mMax - mMin)) * 100}%`
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center font-mono text-zinc-500 uppercase tracking-widest animate-pulse">
                Preparing Stage...
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-6 flex flex-col font-sans select-none overflow-hidden touch-none">
    {/* MODAL: Performance Result */}
    {isEnded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-zinc-900 border border-white/10 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] w-full max-w-md text-center shadow-2xl animate-in zoom-in duration-300">
                <div className="space-y-6">
                    <div>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Performance Result</p>
                        <h2 className="text-5xl md:text-7xl font-black text-green-400 tabular-nums leading-none">{score.toLocaleString()}</h2>
                        <div className="flex justify-center gap-4 mt-4">
                            <span className="text-zinc-400 text-[10px] font-black uppercase bg-white/5 px-3 py-1 rounded-full border border-white/5">Combo: {maxComboRef.current}x</span>
                            <span className="text-zinc-400 text-[10px] font-black uppercase bg-white/5 px-3 py-1 rounded-full border border-white/5">Acc: {accuracy.toFixed(1)}%</span>
                        </div>
                    </div>
                    <div className="py-3 px-4 bg-white/5 rounded-xl border border-white/5 text-[10px] font-bold text-zinc-400 italic uppercase tracking-tighter">
                        {isSubmitting ? "Syncing to mainframe..." : isError ? "Connection lost: save failed." : "Neural link synced: profile updated."}
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button onClick={() => window.location.reload()} className="py-4 bg-zinc-800 text-white text-xs font-black rounded-xl uppercase tracking-widest active:scale-95 transition-transform">Retry</button>
                        <button onClick={() => window.location.href = '/home'} className="py-4 bg-green-500 text-black text-xs font-black rounded-xl uppercase tracking-widest active:scale-95 transition-transform">Continue</button>
                    </div>
                </div>
            </div>
        </div>
    )}

    {/* START OVERLAY */}
    {!isStarted && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 p-6 text-center">
            <div className="mb-8">
                <h1 className="text-white font-black italic text-4xl uppercase tracking-tighter mb-2">Ready to <span className="text-green-500">Perform?</span></h1>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Initialize Audio Input</p>
            </div>
            <button onClick={startSession} className="w-full max-w-xs py-6 bg-white text-black font-black text-xl rounded-full hover:bg-green-400 transition-all active:scale-90 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                START SESSION
            </button>
        </div>
    )}

    {/* HUD: Optimized for Mobile Grid */}
    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 relative z-10">
        <div className="grid grid-cols-3 md:flex gap-4 md:gap-8 w-full md:w-auto">
            <div>
                <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-1">Score</p>
                <h2 className="text-2xl md:text-6xl font-black text-green-400 tabular-nums leading-none">{score.toLocaleString()}</h2>
            </div>
            <div className="border-l border-white/10 pl-4 md:pl-0 md:border-none">
                <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-1">Combo</p>
                <h2 className="text-2xl md:text-4xl font-black text-white tabular-nums leading-none">{combo}<span className="text-[10px] ml-1 uppercase">x</span></h2>
            </div>
            <div className="border-l border-white/10 pl-4 md:pl-0 md:border-none">
                <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-1">Accuracy</p>
                <h2 className="text-2xl md:text-4xl font-black text-zinc-300 tabular-nums leading-none">{accuracy.toFixed(0)}%</h2>
            </div>
        </div>

        {/* Mic Indicator - Floats top right on mobile */}
        <div className={cn(
            "absolute top-0 right-0 md:relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all",
            micActive ? "border-green-500/50 text-green-500 bg-green-500/5" : "border-zinc-800 text-zinc-600 bg-zinc-900/20"
        )}>
            <div className={cn("w-1.5 h-1.5 rounded-full", micActive ? "bg-green-500 animate-pulse" : "bg-zinc-600")} />
            <span className="text-[8px] font-black uppercase tracking-widest">{micActive ? "Live" : "Mute"}</span>
        </div>
    </div>

    {/* PITCH BOARD: Responsive sizing */}
    <div className="relative w-full h-48 md:h-64 bg-zinc-900/20 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5 overflow-hidden">
        {/* The 20% Strike Line */}
        <div className="absolute left-[20%] inset-y-0 w-px bg-white/20 z-10 shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
        
        <div className="relative h-full w-full">
            {pitchData?.filter(p => p.t >= time - 2 && p.t <= time + 6).map((p, i) => {
                const midi = 12 * Math.log2(p.f / 440) + 69
                // Responsive X calculation: use 150 pixels per second on mobile vs 250 on desktop
                const xOffset = typeof window !== 'undefined' && window.innerWidth < 768 ? 150 : 250
                const x = (p.t - time) * xOffset + (typeof window !== 'undefined' ? window.innerWidth * 0.20 : 0)
                
                return (
                    <div 
                        key={i} 
                        className={cn(
                            "absolute w-2 h-2 md:w-3 md:h-3 rounded-full transition-opacity duration-300", 
                            p.t >= time ? "opacity-20 bg-green-500" : "bg-zinc-800"
                        )} 
                        style={{ left: x, top: getMidiY(midi) }} 
                    />
                )
            })}
            
            {userPitch && (
                <div 
                    className="absolute left-[20%] w-6 h-6 md:w-8 md:h-8 -ml-3 -mt-3 md:-ml-4 md:-mt-4 bg-white rounded-full shadow-[0_0_30px_white] z-30 border-[2px] md:border-[3px] border-green-500 transition-all duration-75" 
                    style={{ top: getMidiY(userPitch.m) }} 
                />
            )}
        </div>
    </div>

    {/* LYRICS: Centered focus */}
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8">
        <div className={cn(
            "text-2xl sm:text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-tight transition-all duration-500 max-w-lg", 
            currentLyric ? "text-white scale-100" : "text-zinc-800 scale-95 blur-[1px]"
        )}>
            {currentLyric ? currentLyric.text : "•••"}
        </div>
        
        {currentLyric && (
            <div className="w-24 md:w-32 h-1 bg-zinc-900 mt-6 rounded-full overflow-hidden border border-white/5">
                <div 
                    className="h-full bg-green-500 shadow-[0_0_10px_#22c55e]" 
                    style={{ width: `${(((time - currentLyric.start) / (currentLyric.end - currentLyric.start)) * 100).toFixed(0)}%` }} 
                />
            </div>
        )}
    </div>

    <audio ref={audioRef} preload="auto" crossOrigin="anonymous" src={`${env.API_URL}/songs/${songId}/instrumental`} />
</div>
    )
}