"use client";

import dynamic from "next/dynamic";

const VisionStudioContainer = dynamic(
    () => import("@/components/Vision/VisionStudio"),
    { 
        ssr: false,
        loading: () => (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--void)" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ display: "inline-block", width: 40, height: 40, border: "3px solid var(--gold)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: 20 }} />
                    <div style={{ fontFamily: "var(--font-cinzel)", color: "var(--gold)", letterSpacing: "0.2em", fontSize: 14 }}>INITIALIZING STUDIO...</div>
                </div>
            </div>
        )
    }
);

export default function VisionPage() {
    return <VisionStudioContainer />;
}
