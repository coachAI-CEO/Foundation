import type { Metadata } from "next";
import { Sidebar, MobileNav } from "@/components/Nav";

export const metadata: Metadata = {
    title: { default: "Foundation", template: "%s — Foundation" },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1, background: "var(--void)" }}>
            {/* Atmosphere */}
            <div className="atmo" />
            <div className="grid-bg" />
            <div className="grain" />

            {/* Desktop sidebar */}
            <div className="hidden md:flex" style={{ flexShrink: 0, position: "relative", zIndex: 10 }}>
                <Sidebar />
            </div>

            {/* Main content */}
            <main style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", overflow: "hidden", position: "relative", zIndex: 5 }}>
                {children}

                {/* Mobile bottom nav */}
                <div className="md:hidden">
                    <MobileNav />
                </div>
            </main>
        </div>
    );
}
