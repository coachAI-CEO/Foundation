"use client";

import { useState, useRef } from "react";
import { useStore } from "@/lib/store";

interface Message {
    role: "user" | "ai";
    content: string;
    ts: string;
}

export default function BrainstormPage() {
    const { projects } = useStore();
    const [selectedProj, setSelectedProj] = useState(projects[0]?.id || "");
    const [notes, setNotes] = useState("Ideas so far:\n- Subway tile in shower, floor-to-ceiling\n- Heated floors (check if subfloor allows)\n- Freestanding tub vs. soaker insert?\n- Matte black fixtures throughout\n- Floating vanity for smaller footprint");
    const [messages, setMessages] = useState<Message[]>([
        { role: "ai", content: "I've reviewed your notes. The subway tile choice is solid — very timeless. On heated floors: if you have at least 1.5\" of concrete subfloor depth you're good for electric radiant. For the vanity decision, floating will make the room feel 30% larger visually. Want me to sketch out a rough material list for the tile work?", ts: "now" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);

    const proj = projects.find((p) => p.id === selectedProj);

    async function send() {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput("");
        const userTs = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        setMessages((m) => [...m, { role: "user", content: userMsg, ts: userTs }]);
        setLoading(true);

        try {
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "x-api-key": localStorage.getItem("gemini_api_key") || ""
                },
                body: JSON.stringify({
                    message: userMsg,
                    context: `Project: ${proj?.name || "general"}. Room: ${proj?.room}. User notes: ${notes.slice(0, 500)}`,
                }),
            });
            const data = await res.json();
            const aiTs = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
            setMessages((m) => [...m, { role: "ai", content: data.reply || "I couldn't process that.", ts: aiTs }]);
        } catch {
            setMessages((m) => [...m, { role: "ai", content: "Connection error. Please check your API key in settings.", ts: "" }]);
        } finally {
            setLoading(false);
            setTimeout(() => chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" }), 50);
        }
    }

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <header style={{ padding: "28px 32px 20px", borderBottom: "1px solid var(--border)", flexShrink: 0, background: "var(--void)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div>
                        <h1 style={{ fontFamily: "var(--font-cinzel)", fontSize: 22, fontWeight: 700, letterSpacing: "0.1em", color: "var(--white)" }}>Brainstorm</h1>
                        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>Notepad + AI coach — think out loud</p>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                    {projects.map((p) => (
                        <button key={p.id} id={`brainstorm-proj-${p.id}`} className={`ftab ${selectedProj === p.id ? "active" : ""}`} onClick={() => setSelectedProj(p.id)}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, display: "inline-block", marginRight: 4 }} />
                            {p.name}
                        </button>
                    ))}
                </div>
            </header>

            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, overflow: "hidden" }}>
                {/* Left — Notepad */}
                <div style={{ borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span className="sec-title">Notepad</span>
                        <button className="btn-ghost" style={{ fontSize: 10, padding: "5px 10px" }} onClick={() => { }}>Save</button>
                    </div>
                    <textarea
                        id="brainstorm-notepad"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Dump all your ideas here — materials, layout changes, inspiration…"
                        style={{
                            flex: 1,
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            resize: "none",
                            padding: "18px 20px",
                            fontFamily: "var(--font-dm)",
                            fontSize: 13,
                            lineHeight: 1.8,
                            color: "var(--white)",
                            scrollbarWidth: "thin",
                        }}
                    />
                </div>

                {/* Right — AI chat */}
                <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--gold-dim)", border: "1px solid var(--border-warm)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--gold)"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                        </div>
                        <div>
                            <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 11, letterSpacing: "0.08em", color: "var(--gold)" }}>Foundation AI</div>
                            <div style={{ fontSize: 10, color: "var(--green-br)" }}>Reading your notes</div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                                <div style={{
                                    maxWidth: "85%",
                                    padding: "10px 13px",
                                    borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "4px 14px 14px 14px",
                                    background: msg.role === "user" ? "var(--gold-dim)" : "var(--raised)",
                                    border: msg.role === "user" ? "1px solid var(--border-warm)" : "1px solid var(--border)",
                                    fontSize: 13,
                                    lineHeight: 1.65,
                                    color: msg.role === "user" ? "var(--gold-br)" : "var(--white)",
                                }}>
                                    {msg.content}
                                </div>
                                {msg.ts && <span style={{ fontSize: 9, color: "var(--muted)", marginTop: 4, letterSpacing: "0.05em" }}>{msg.ts}</span>}
                            </div>
                        ))}
                        {loading && (
                            <div style={{ display: "flex", alignItems: "flex-start" }}>
                                <div style={{ padding: "10px 14px", background: "var(--raised)", borderRadius: "4px 14px 14px 14px", border: "1px solid var(--border)", display: "flex", gap: 5, alignItems: "center" }}>
                                    {[0, 1, 2].map((i) => (
                                        <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", opacity: 0.6, animation: `housePulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chips */}
                    <div style={{ padding: "8px 18px", display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {["Analyze my notes", "Suggest materials", "What should I do first?", "Estimate cost"].map((chip) => (
                            <button key={chip} className="ftab" style={{ fontSize: 10, padding: "4px 10px" }} onClick={() => { setInput(chip); }}>
                                {chip}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div style={{ display: "flex", gap: 8, padding: "10px 18px 18px", borderTop: "1px solid var(--border)" }}>
                        <input
                            id="brainstorm-ai-input"
                            className="ai-input"
                            placeholder="Ask about your project ideas…"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && send()}
                        />
                        <button id="brainstorm-ai-send" className="ai-send" onClick={send} disabled={loading} aria-label="Send message">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
