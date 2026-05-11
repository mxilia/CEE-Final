"use client";

import { useEffect, useState } from "react";
import RedirectButton from '@/src/components/login/redirect-button';
import { Mic2, ArrowRight, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { env } from "@/src/config/env";
import Link from "next/link";

export default function LoginContent() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${env.API_URL}/me`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          // Important: 'include' allows sending/receiving cookies for custom auth
          credentials: "include", 
        });

        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black p-4">
      {/* Background Neon Glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-green-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="z-10 w-full max-w-md space-y-10 rounded-[2.5rem] border border-white/5 bg-zinc-900/40 p-10 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <Mic2 size={32} />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">
              KaraOkay<span className="text-green-500">.</span>
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
              CEE FINAL PROJECT
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {isLoggedIn === null ? (
            /* Loading State */
            <div className="flex w-full items-center justify-center py-4">
              <Loader2 className="animate-spin text-zinc-500" size={24} />
            </div>
          ) : isLoggedIn ? (
            /* Authenticated: Enter Dashboard */
            <Link 
              href="/home" 
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-green-500 px-6 py-4 text-sm font-black uppercase tracking-widest text-black transition-all hover:bg-green-400 hover:shadow-[0_0_25px_rgba(34,197,94,0.4)] active:scale-[0.98]"
            >
              Enter Dashboard
              <ArrowRight size={18} />
            </Link>
          ) : (
            /* Unauthenticated: Show Login */
            <RedirectButton />
          )}
          
          <div className="flex items-center justify-center gap-2 text-zinc-600">
            {isLoggedIn ? (
                <ShieldCheck size={12} className="text-green-500/50" />
            ) : (
                <ShieldAlert size={12} className="text-zinc-700" />
            )}
            <p className="text-center text-[10px] font-medium uppercase tracking-widest">
                {isLoggedIn === null ? "Verifying Session..." : isLoggedIn ? "Identity Verified" : "Authentication Required"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="mt-8 text-zinc-700 text-[10px] font-bold uppercase tracking-[0.5em]">
        Please play
      </div>
    </main>
  );
}