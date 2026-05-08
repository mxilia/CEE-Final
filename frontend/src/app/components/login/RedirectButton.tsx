"use client"

export default function RedirectButton() {
    
    const handleRedirect = () => {
        window.location.href = 'https://accounts.google.com/signin/v2/identifier?service=accountsettings&continue=https%3A%2F%2Fmyaccount.google.com%2F&flowName=GlifWebSignIn&flowEntry=ServiceLogin';
        //console.log("Redirecting to Google Sign-In...  najaaa");
    };

    return (
        <button onClick={handleRedirect}
                className="w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-200">
            Sign in with Google
        </button>
    );
}