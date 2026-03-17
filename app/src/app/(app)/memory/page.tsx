"use client";

import { useState } from "react";
import { useStore, fmtMoney } from "@/lib/store";

const ROOM_ICONS: Record<string, React.ReactNode> = {
  Kitchen: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11V3h8v8H3zM13 11V3h8v8h-8zM3 21v-6h8v6H3zM18 21v-6M15 18h6" /></svg>,
  "Master Bath": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 8H4a2 2 0 0 0-2 2v6a6 6 0 0 0 12 0v-1" /><path d="M9 8V5a2 2 0 0 1 2-2 2 2 0 0 1 2 2v3" /><line x1="12" y1="8" x2="22" y2="8" /></svg>,
  "Living Room": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="10" width="18" height="11" rx="2" /><path d="M7 10V7h10v3" /><path d="M7 14h10" /></svg>,
  Garage: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10V3h18v7" /><rect x="3" y="10" width="18" height="11" rx="2" /><path d="M7 14h10" /><path x1="7" y1="18" x2="17" y2="18" /></svg>,
  Backyard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12m0 0c0-5.5-4-7-4-7s.5 3.5 4 7zm0 0c0-5.5 4-7 4-7s-.5 3.5-4 7z" /><path d="M5 22h14" /></svg>,
  Other: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="3" y1="9" x2="21" y2="9" /></svg>,
};

export default function MemoryPage() {
  const { memory, house } = useStore();
  const [selectedRoom, setSelectedRoom] = useState<string>("Kitchen");
  const [quickLog, setQuickLog] = useState("");

  const roomData = memory[selectedRoom] || {
    totalSpent: 0,
    projectCount: 0,
    lastWork: "Never",
    entries: [],
    products: []
  };

  const rooms = house.rooms;

  return (
    <div style={{ flex: 1, display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Sidebar - Rooms */}
      <div style={{ width: 280, background: "var(--base)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "28px 24px 16px" }}>
            <h1 style={{ fontFamily: "var(--font-cinzel)", fontSize: 18, fontWeight: 700, letterSpacing: "0.1em", color: "var(--white)" }}>House Memory</h1>
            <p style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>Per-Room History</p>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
            {rooms.map(room => {
                const isActive = room === selectedRoom;
                const m = memory[room];
                return (
                    <div 
                        key={room} 
                        onClick={() => setSelectedRoom(room)}
                        style={{ 
                            display: "flex", alignItems: "center", gap: 12, padding: "14px 24px", 
                            cursor: "pointer", background: isActive ? "var(--gold-dim)" : "transparent",
                            borderLeft: isActive ? "2px solid var(--gold)" : "none",
                            transition: "all 0.2s"
                        }}
                    >
                        <div style={{ color: isActive ? "var(--gold)" : "var(--soft)" }}>{ROOM_ICONS[room] || ROOM_ICONS.Other}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, color: isActive ? "var(--white)" : "var(--soft)" }}>{room}</div>
                            <div style={{ fontSize: 10, color: "var(--muted)" }}>{m ? `${m.entries.length} entries` : "No entries"}</div>
                        </div>
                    </div>
                );
            })}
        </div>

        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)" }}>
            <button className="btn-ghost" style={{ width: "100%", justifyContent: "center" }}>Log New Entry</button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--void)", overflow: "hidden" }}>
        {/* Room Header */}
        <div style={{ padding: "28px 32px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
                <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 24, fontWeight: 700, color: "var(--white)" }}>{selectedRoom}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{roomData.projectCount} Projects • Last work: {roomData.lastWork}</div>
            </div>
            <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Room Investment</div>
                <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 20, fontWeight: 700, color: "var(--gold)" }}>{fmtMoney(roomData.totalSpent)}</div>
            </div>
        </div>

        {/* Scrollable Feed */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                {roomData.entries.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        {roomData.entries.map(entry => (
                            <div key={entry.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", overflow: "hidden" }}>
                                <div style={{ padding: "20px 24px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                                        <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 11, color: "var(--gold)", letterSpacing: "0.1em" }}>{entry.date}</div>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            {entry.tags.map(tag => (
                                                <span key={tag} style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", background: "var(--raised)", padding: "3px 8px", borderRadius: 10, color: "var(--soft)" }}>{tag}</span>
                                            ))}
                                            {entry.cost > 0 && <span style={{ fontFamily: "var(--font-cinzel)", fontSize: 12, fontWeight: 700, color: "var(--white)" }}>{fmtMoney(entry.cost)}</span>}
                                        </div>
                                    </div>
                                    <h3 style={{ fontFamily: "var(--font-cinzel)", fontSize: 16, color: "var(--white)", marginBottom: 8 }}>{entry.title}</h3>
                                    <p style={{ fontSize: 13, color: "var(--soft)", lineHeight: 1.6 }}>{entry.desc}</p>
                                    
                                    {entry.products.length > 0 && (
                                        <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 6 }}>
                                            {entry.products.map(p => (
                                                <div key={p} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontSize: 11, color: "var(--white)", display: "flex", alignItems: "center", gap: 6 }}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                                                    {p}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: "center", padding: "80px 0" }}>
                        <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--raised)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "var(--soft)" }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M2 12h20"/></svg>
                        </div>
                        <h2 style={{ fontFamily: "var(--font-cinzel)", fontSize: 18, color: "var(--white)", marginBottom: 8 }}>No Memories Yet</h2>
                        <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 300, margin: "0 auto" }}>Start logging work, paint colors, or product purchases for the {selectedRoom}.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Quick Log Input */}
        <div style={{ padding: "16px 32px 24px", borderTop: "1px solid var(--border)", background: "rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", gap: 10, maxWidth: 800, margin: "0 auto" }}>
                <input 
                    className="ai-input" 
                    placeholder="Quick log: paint color, product, observation..." 
                    value={quickLog}
                    onChange={(e) => setQuickLog(e.target.value)}
                    style={{ flex: 1 }}
                />
                <button 
                  className="ai-send"
                  disabled={!quickLog.trim()}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="2" x2="2" y2="7"/><line x1="12" y1="2" x2="8" y2="12"/><line x1="2" y1="7" x2="8" y2="12"/></svg>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
