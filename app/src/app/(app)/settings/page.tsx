"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";

export default function SettingsPage() {
    const { house, users } = useStore();
    const [saved, setSaved] = useState(false);
    const [apiKey, setApiKey] = useState("");

    function handleSave() {
        if (apiKey) localStorage.setItem("gemini_api_key", apiKey);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    return (
        <div style={{ flex: 1, overflowY: "auto" }}>
            <header style={{ padding: "28px 32px 20px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 30, background: "var(--void)" }}>
                <h1 style={{ fontFamily: "var(--font-cinzel)", fontSize: 22, fontWeight: 700, letterSpacing: "0.1em", color: "var(--white)" }}>Settings</h1>
                <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>House profile & preferences</p>
            </header>

            <div style={{ maxWidth: 720, padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
                {/* House Profile */}
                <section style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "20px 22px" }}>
                    <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 12, letterSpacing: "0.12em", color: "var(--gold)", marginBottom: 16 }}>House Profile</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {[
                            { label: "Address", value: house.address },
                            { label: "City", value: house.city },
                            { label: "State", value: house.state },
                            { label: "Year Built", value: house.yearBuilt },
                            { label: "Sq Footage", value: `${house.sqft.toLocaleString()} sq ft` },
                            { label: "Style", value: house.style },
                        ].map((f) => (
                            <div key={f.label}>
                                <label style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", display: "block", marginBottom: 6 }}>{f.label}</label>
                                <input
                                    defaultValue={f.value}
                                    style={{ width: "100%", background: "var(--raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontFamily: "var(--font-dm)", fontSize: 13, color: "var(--white)", outline: "none", transition: "border-color 0.2s" }}
                                    onFocus={e => (e.target.style.borderColor = "var(--border-warm)")}
                                    onBlur={e => (e.target.style.borderColor = "var(--border)")}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Homeowners */}
                <section style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "20px 22px" }}>
                    <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 12, letterSpacing: "0.12em", color: "var(--gold)", marginBottom: 16 }}>Homeowners</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {users.map((u, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--raised)", borderRadius: 10, padding: "12px 14px" }}>
                                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--gold-dim)", border: "1px solid var(--border-warm)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-cinzel)", fontSize: 12, fontWeight: 700, color: "var(--gold)", flexShrink: 0 }}>
                                    {u.name[0]}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--white)" }}>{u.name}</div>
                                    <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "capitalize" }}>DIY Level: {u.diyLevel}</div>
                                </div>
                                <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", padding: "2px 8px", borderRadius: 20, background: "var(--gold-dim)", color: "var(--gold)", border: "1px solid var(--border-warm)" }}>
                                    {u.diyLevel}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* AI Integration */}
                <section style={{ background: "var(--card)", border: "1px solid var(--border-warm)", borderRadius: "var(--r)", padding: "20px 22px" }}>
                    <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 12, letterSpacing: "0.12em", color: "var(--gold)", marginBottom: 6 }}>AI Integration</div>
                    <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 16 }}>
                        Foundation AI uses Gemini 3 Flash Preview by Google. Enter your API key to enable the AI features — it&apos;s stored locally only.
                    </p>
                    <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", display: "block", marginBottom: 6 }}>Google API Key</label>
                        <input
                            id="settings-api-key"
                            type="password"
                            placeholder="AIzaSy..."
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            style={{ width: "100%", background: "var(--raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontFamily: "var(--font-dm)", fontSize: 13, color: "var(--white)", outline: "none", transition: "border-color 0.2s" }}
                            onFocus={e => (e.target.style.borderColor = "var(--border-warm)")}
                            onBlur={e => (e.target.style.borderColor = "var(--border)")}
                        />
                    </div>
                    <button id="settings-save-btn" className="btn-primary" style={{ minWidth: 140 }} onClick={handleSave}>
                        {saved ? (
                            <>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                Saved
                            </>
                        ) : "Save Settings"}
                    </button>
                </section>

                {/* Rooms */}
                <section style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "20px 22px" }}>
                    <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 12, letterSpacing: "0.12em", color: "var(--gold)", marginBottom: 14 }}>House Rooms</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {house.rooms.map((room) => (
                            <span key={room} style={{ padding: "6px 14px", borderRadius: 8, background: "var(--raised)", border: "1px solid var(--border)", fontSize: 12, color: "var(--soft)" }}>{room}</span>
                        ))}
                        <button className="btn-ghost" style={{ padding: "6px 14px" }}>+ Add Room</button>
                    </div>
                </section>

                {/* Reset */}
                <div style={{ marginTop: 20, textAlign: "center" }}>
                    <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>Need to start over? This won&apos;t delete your projects.</p>
                    <a href="/onboarding" style={{ color: "var(--red-br)", fontSize: 12, textDecoration: "none", fontWeight: 600 }}>重启房屋配置 (Restart Onboarding) →</a>
                </div>
            </div>
        </div>
    );
}
