// app/login/page.tsx
import RedirectButton from '@/src/components/login/redirect-button';
import { Mic2 } from "lucide-react";

export default function LoginPage() {
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
          <RedirectButton />
          <p className="text-center text-[10px] font-medium uppercase tracking-widest text-zinc-600">
            Very Secure Google Authentication
          </p>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="mt-8 text-zinc-700 text-[10px] font-bold uppercase tracking-[0.5em]">
        Please play
      </div>
    </main>
  );
}