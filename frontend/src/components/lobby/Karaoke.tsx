"use client"

import { env } from "@/src/config/env"
import { cn } from "@/src/lib/utils"
import { useEffect, useMemo, useRef, useState } from "react"
import useSWR from "swr"

type Segment = { start: number; end: number; text: string }
type PitchPoint = { t: number; f: number; note: string; confidence: number }

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function Karaoke({ songId }: { songId: string }) {
    // Refs for non-reactive audio state
    const audioRef = useRef<HTMLAudioElement>(null)
    const rafRef = useRef<number | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)

    // UI & Game State
    const [time, setTime] = useState(0)
    const [userPitch, setUserPitch] = useState<{ f: number, m: number } | null>(null)
    const [score, setScore] = useState(0)
    const [isStarted, setIsStarted] = useState(false)
    const [micActive, setMicActive] = useState(false)

    // Fetch Song Data
    const { data: lyricsData } = useSWR(`${env.API_URL}/songs/${songId}/lyrics`, fetcher)
    const { data: pitchData, isLoading } = useSWR<PitchPoint[]>(`${env.API_URL}/songs/${songId}/pitch`, fetcher)

    console.log("Lyrics Data:", lyricsData)

    // 1. Initialize Audio Worklet and Microphone
    const startSession = async () => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
            
            // Resume context if suspended (common in Chrome/Safari)
            if (ctx.state === 'suspended') await ctx.resume()

            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: { 
                    echoCancellation: true, 
                    noiseSuppression: true,
                    autoGainControl: true 
                } 
            })
            
            // Load the processor from /public/worklets/pitch-processor.js
            await ctx.audioWorklet.addModule("/worklets/pitch-processor.js")

            const micNode = ctx.createMediaStreamSource(stream)
            const pitchNode = new AudioWorkletNode(ctx, "pitch-processor")

            pitchNode.port.onmessage = (event) => {
                const { pitch } = event.data
                // Basic threshold to ignore ambient background hum
                if (pitch && pitch > 60 && pitch < 1000) {
                    const midi = 12 * Math.log2(pitch / 440) + 69
                    setUserPitch({ f: pitch, m: midi })
                    setMicActive(true)
                    
                    // Real-time Scoring logic
                    const curTime = audioRef.current?.currentTime || 0
                    const target = pitchData?.find(p => Math.abs(p.t - curTime) < 0.1)
                    
                    if (target && target.f > 0) {
                        const targetMidi = 12 * Math.log2(target.f / 440) + 69
                        const diff = Math.abs(midi - targetMidi)
                        // Reward if within 1.5 semitones
                        if (diff < 1.5) {
                            setScore(prev => prev + Math.floor((1.5 - diff) * 10))
                        }
                    }
                } else {
                    setUserPitch(null)
                    setMicActive(false)
                }
            }

            micNode.connect(pitchNode)
            audioContextRef.current = ctx
            setIsStarted(true)

            // Safe play implementation to handle NotSupportedError/Race Conditions
            if (audioRef.current) {
                audioRef.current.play().catch(e => {
                    console.warn("Retrying play after user interaction...", e)
                    // If first attempt fails, browser might need another tick
                    setTimeout(() => audioRef.current?.play(), 150)
                })
            }

        } catch (err) {
            console.error("Setup failed:", err)
            alert("Could not access microphone or load audio processor.")
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

        audio.addEventListener("pause", () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        })

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [isLoading])

    // 3. Logic to determine current lyric
    const currentLyric: Segment | null = useMemo(() => {
        if (!lyricsData?.segments) return null
        return lyricsData.segments.find((s: Segment) => time >= s.start && time <= s.end)
    }, [lyricsData, time])

    // Y-Axis mapping for Pitch Board (Midi 45 to 85)
    const getMidiY = (midi: number) => {
        const mMin = 45, mMax = 85
        const clamped = Math.max(mMin, Math.min(mMax, midi))
        return `${100 - ((clamped - mMin) / (mMax - mMin)) * 100}%`
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-zinc-500 font-mono animate-pulse uppercase tracking-widest">
                    Preparing Stage...
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 flex flex-col font-sans select-none overflow-hidden">
            
            {/* 1. START OVERLAY */}
            {!isStarted && (
                <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl">
                    <button 
                        onClick={startSession}
                        className="group relative px-16 py-6 bg-white text-black font-black text-2xl rounded-full transition-all hover:scale-105 hover:bg-green-400 active:scale-95"
                    >
                        START SESSION
                        <div className="absolute inset-0 rounded-full bg-white/20 blur-xl group-hover:bg-green-400/40 transition-colors" />
                    </button>
                </div>
            )}

            {/* 2. HUD (Score & Mic Status) */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Total Score</p>
                    <h2 className="text-6xl font-black text-green-400 tabular-nums drop-shadow-lg leading-none">
                        {score.toLocaleString()}
                    </h2>
                </div>
                <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border transition-all",
                    micActive ? "border-green-500 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]" : "border-zinc-800 text-zinc-600"
                )}>
                    <div className={cn("w-2 h-2 rounded-full", micActive ? "bg-green-500 animate-pulse" : "bg-zinc-600")} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Mic {micActive ? "Receiving" : "Waiting"}</span>
                </div>
            </div>

            {/* 3. PITCH BOARD */}
            <div className="relative w-full h-64 bg-zinc-900/10 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-inner ring-1 ring-white/5">
                {/* Vertical Playhead Guide */}
                <div className="absolute left-[20%] inset-y-0 w-px bg-white/10 z-10" />
                
                <div className="relative h-full w-full">
                    {/* Target Pitches (The "Notes" to hit) */}
                    {pitchData?.filter(p => p.t >= time - 2 && p.t <= time + 6).map((p, i) => {
                        const midi = 12 * Math.log2(p.f / 440) + 69
                        const x = (p.t - time) * 250 + (window.innerWidth * 0.20)
                        return (
                            <div 
                                key={i} 
                                className={cn("absolute w-3 h-3 rounded-full transition-opacity duration-300", 
                                    p.t >= time ? "opacity-20 bg-green-500" : "bg-zinc-700")}
                                style={{ left: x, top: getMidiY(midi) }} 
                            />
                        )
                    })}

                    {/* Live User Input Marker */}
                    {userPitch && (
                        <div 
                            className="absolute left-[20%] w-8 h-8 -ml-4 -mt-4 bg-white rounded-full shadow-[0_0_40px_white,0_0_15px_#22c55e] z-30 transition-all duration-75 border-[3px] border-green-500"
                            style={{ top: getMidiY(userPitch.m) }}
                        />
                    )}
                </div>
            </div>

            {/* Hidden Audio Element */}
            <audio 
                ref={audioRef} 
                preload="auto" 
                crossOrigin="anonymous"
                src={`${env.API_URL}/songs/${songId}/instrumental`} 
            />

            {/* 4. LYRICS FALLBACK DISPLAY */}
            <div className="mt-auto mb-auto flex flex-col items-center justify-center min-h-87.5 text-center px-6">
                <div 
                    key={currentLyric?.start || 'fallback'} 
                    className={cn(
                        "text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-[0.9] transition-all duration-500",
                        currentLyric 
                            ? "text-white opacity-100 scale-100 blur-0" 
                            : "text-zinc-800 opacity-40 scale-95 blur-[2px]"
                    )}
                >
                    {currentLyric ? currentLyric.text : "audio sound"}
                </div>
                
                {/* Visual Progress Bar for current line */}
                {currentLyric && (
                    <div className="w-32 h-1 bg-zinc-800 mt-8 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-green-500 transition-all duration-100"
                            style={{ 
                                width: `${(((time - currentLyric.start) / (currentLyric.end - currentLyric.start)) * 100).toFixed(0)}%` 
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}