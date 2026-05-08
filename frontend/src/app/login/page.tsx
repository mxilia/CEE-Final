// I want to sign in with google I want a button that redirect to goole

// app/login/page.tsx
import RedirectButton from '../components/login/RedirectButton';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">Login</h1>
        </div>

        <div className="mt-8 space-y-6">
          <RedirectButton />
        </div>

        
      </div>
    </main>
  );
}