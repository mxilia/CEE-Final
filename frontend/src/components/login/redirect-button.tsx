"use client"

export default function RedirectButton() {
    
    const handleRedirect = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login`;
        //console.log("Redirecting to Google Sign-In...  najaaa");
    };

    return (
        <button onClick={handleRedirect}
                className="w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-200">
            Sign in with Google
        </button>
    );
}