import Navbar from "@/src/components/shared/navbar";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Navbar />
            <div className="pt-16 bg-black min-h-screen">
                {children}
            </div>
        </>
    );
}