"use client"

import { useEffect, useRef, useState, KeyboardEvent } from "react"
import { MessageSquare, Send, X, Loader2 } from "lucide-react"
import { cn } from "@/src/lib/utils"
import { env } from "@/src/config/env"

type ChatMessage = {
    messageId: number
    message: string
    sender: { userId: string; nickname: string }
    createdAt: number
}

type Status = "idle" | "connecting" | "connected" | "error"

const CHANNEL_URL = "karaoke-global-chat"

export default function ChatBox() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState("")
    const [status, setStatus] = useState<Status>("idle")
    const [errorMsg, setErrorMsg] = useState("")
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [currentNickname, setCurrentNickname] = useState("Player")
    const [unread, setUnread] = useState(0)

    const channelRef = useRef<any>(null)
    const sbRef = useRef<any>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Fetch logged-in user, fall back to guest
    useEffect(() => {
        fetch(`${env.API_URL}/me`, { credentials: "include" })
            .then(r => r.ok ? r.json() : null)
            .then(user => {
                if (user?.id) {
                    setCurrentUserId(user.id)
                    setCurrentNickname(user.handler || user.name || "Player")
                } else {
                    // Guest fallback — persist ID in localStorage so it stays consistent
                    let guestId = localStorage.getItem("chat_guest_id")
                    if (!guestId) {
                        guestId = `guest_${Math.random().toString(36).slice(2, 9)}`
                        localStorage.setItem("chat_guest_id", guestId)
                    }
                    setCurrentUserId(guestId)
                    setCurrentNickname("Guest")
                }
            })
            .catch(() => {
                let guestId = localStorage.getItem("chat_guest_id")
                if (!guestId) {
                    guestId = `guest_${Math.random().toString(36).slice(2, 9)}`
                    localStorage.setItem("chat_guest_id", guestId)
                }
                setCurrentUserId(guestId)
                setCurrentNickname("Guest")
            })
    }, [])

    // Init Sendbird
    useEffect(() => {
        if (!env.SENDBIRD_APP_ID || !currentUserId) return

        let isMounted = true

        const init = async () => {
            setStatus("connecting")
            try {
                const { default: SendbirdChat } = await import("@sendbird/chat")
                const { OpenChannelModule, OpenChannelHandler } =
                    await import("@sendbird/chat/openChannel")

                // Reuse existing instance if already initialized (React Strict Mode safe)
                let sb: any
                try {
                    sb = SendbirdChat.init({
                        appId: env.SENDBIRD_APP_ID!,
                        modules: [new OpenChannelModule()],
                    })
                    console.log("[Sendbird] init OK")
                } catch {
                    sb = (SendbirdChat as any).instance
                    console.log("[Sendbird] reusing existing instance")
                }

                if (!isMounted) return
                sbRef.current = sb

                // Sanitize userId — Sendbird only allows alphanumeric, hyphen, underscore, period
                const safeUserId = currentUserId.replace(/[^a-zA-Z0-9\-_.]/g, "_").slice(0, 80)
                const safeNickname = (currentNickname || "Player").slice(0, 80)
                console.log("[Sendbird] connecting as:", safeUserId, "/", safeNickname)

                // Connect only if not already connected
                if ((sb as any).connectionState !== "OPEN") {
                    await sb.connect(safeUserId)
                    console.log("[Sendbird] connected")
                }
                await sb.updateCurrentUserInfo({ nickname: safeNickname })
                console.log("[Sendbird] nickname updated")

                // Get open channel (pre-created via Platform API)
                const channel: any = await sb.openChannel.getChannel(CHANNEL_URL)
                console.log("[Sendbird] got channel")

                if (!isMounted) return
                await channel.enter()
                console.log("[Sendbird] entered channel")
                channelRef.current = channel

                // Load previous messages
                const query = channel.createPreviousMessageListQuery({
                    limit: 50,
                    reverse: false,
                })
                const prev = await query.load()

                if (!isMounted) return
                setMessages(prev as ChatMessage[])

                // Listen for new messages
                const handler = new OpenChannelHandler({
                    onMessageReceived: (_ch: any, msg: any) => {
                        if (!isMounted) return
                        setMessages(prev => [...prev, msg as ChatMessage])
                        setUnread(n => n + 1)
                    },
                })
                sb.openChannel.addOpenChannelHandler("karaoke-handler", handler)

                if (isMounted) setStatus("connected")
            } catch (e: any) {
                console.error("[Sendbird]", e)
                if (isMounted) {
                    setErrorMsg(e?.message || e?.code || String(e))
                    setStatus("error")
                }
            }
        }

        init()

        return () => {
            isMounted = false
            sbRef.current?.openChannel?.removeOpenChannelHandler("karaoke-handler")
            sbRef.current?.disconnect()
        }
    }, [currentUserId, currentNickname])

    // Auto-scroll
    useEffect(() => {
        if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, isOpen])

    // Clear unread when opened
    useEffect(() => {
        if (isOpen) setUnread(0)
    }, [isOpen])

    const sendMessage = () => {
        if (!input.trim() || !channelRef.current || status !== "connected") return
        const text = input.trim()
        setInput("")
        channelRef.current
            .sendUserMessage({ message: text })
            .onSucceeded((msg: any) => {
                setMessages(prev => [...prev, msg as ChatMessage])
            })
            .onFailed((err: any) => {
                console.error("[Sendbird] Send failed:", err)
            })
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const formatTime = (ms: number) => {
        const d = new Date(ms)
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    if (!env.SENDBIRD_APP_ID) return null

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

            {/* Chat Window */}
            {isOpen && (
                <div className="w-80 h-[420px] bg-zinc-900 border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-zinc-800/60 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                status === "connected" ? "bg-green-500 animate-pulse" :
                                status === "connecting" ? "bg-yellow-500 animate-pulse" :
                                status === "error" ? "bg-red-500" : "bg-zinc-500"
                            )} />
                            <span className="text-xs font-black uppercase tracking-widest text-white">
                                🎤 Karaoke Chat
                            </span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-zinc-500 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {status === "connecting" && (
                            <div className="flex flex-col items-center justify-center h-full gap-2">
                                <Loader2 size={20} className="text-zinc-500 animate-spin" />
                                <p className="text-xs text-zinc-500">Connecting...</p>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="text-center mt-8 px-2 space-y-1">
                                <p className="text-xs text-red-400">Failed to connect.</p>
                                <p className="text-[10px] text-zinc-600 break-words">{errorMsg}</p>
                            </div>
                        )}


                        {status === "connected" && messages.length === 0 && (
                            <p className="text-center text-xs text-zinc-600 mt-8">
                                No messages yet. Say hi! 👋
                            </p>
                        )}

                        {messages.map((msg) => {
                            const isMe = msg.sender?.userId === currentUserId
                            return (
                                <div key={msg.messageId} className={cn("flex flex-col gap-0.5", isMe ? "items-end" : "items-start")}>
                                    <div className="flex items-center gap-1 px-1">
                                        <span className="text-[10px] text-zinc-500 font-bold">
                                            {isMe ? "You" : (msg.sender?.nickname || "Unknown")}
                                        </span>
                                        <span className="text-[9px] text-zinc-700">
                                            {formatTime(msg.createdAt)}
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "px-3 py-2 rounded-2xl text-xs max-w-[80%] break-words leading-relaxed",
                                        isMe
                                            ? "bg-green-500 text-black font-semibold rounded-tr-sm"
                                            : "bg-zinc-800 text-white rounded-tl-sm border border-white/5"
                                    )}>
                                        {msg.message}
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="flex items-center gap-2 px-3 py-3 border-t border-white/10 bg-zinc-800/30">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Say something..."
                            disabled={status !== "connected"}
                            className="flex-1 bg-zinc-800 text-white text-xs rounded-full px-4 py-2 outline-none border border-white/5 placeholder:text-zinc-600 disabled:opacity-40 focus:border-green-500/50 transition-colors"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || status !== "connected"}
                            className="w-8 h-8 bg-green-500 hover:bg-green-400 disabled:opacity-30 text-black rounded-full flex items-center justify-center transition-all active:scale-95 shrink-0"
                        >
                            <Send size={12} />
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(o => !o)}
                className="relative w-14 h-14 bg-green-500 hover:bg-green-400 text-black rounded-full flex items-center justify-center shadow-lg shadow-green-500/20 transition-all hover:scale-105 active:scale-95"
            >
                {isOpen ? <X size={20} /> : <MessageSquare size={20} />}

                {/* Unread badge */}
                {!isOpen && unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                        {unread > 9 ? "9+" : unread}
                    </span>
                )}
            </button>
        </div>
    )
}
