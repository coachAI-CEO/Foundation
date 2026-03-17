"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore, fmtMoney } from "@/lib/store";

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
}

export default function DashboardPage() {
    const { house, users, projects, tasks, expenses, materials } = useStore();
    const [aiMsg, setAiMsg] = useState(
        "You have <strong>2 active projects</strong> this week. The kitchen lighting install is your next critical path item — finish that before starting cabinet painting. Your bath budget is on track at 12% spent with good runway."
    );
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const toggleTask = useStore((s) => s.toggleTask);

    const totalBudget = projects.reduce((a, p) => a + p.budget, 0);
    const totalSpent = projects.reduce((a, p) => a + p.spent, 0);
    const activeTasks = tasks.filter((t) => !t.done);
    const urgentMaterials = materials.filter((m) => m.priority === "urgent" && !m.done);
    const nextTasks = tasks.filter((t) => !t.done).slice(0, 5);

    async function sendMessage() {
        if (!input.trim() || loading) return;
        const userQ = input.trim();
        setInput("");
        setLoading(true);
        setAiMsg("Thinking...");

        try {
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userQ,
                    context: `House: ${house.address}, ${house.city} TX. Active projects: ${projects.filter((p) => p.status === "active").map((p) => p.name).join(", ")}. Total budget: ${fmtMoney(totalBudget)}, spent: ${fmtMoney(totalSpent)}.`,
                }),
            });
            const data = await res.json();
            setAiMsg(data.reply || "I couldn't process that request.");
        } catch {
            setAiMsg("Connection error — please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ flex: 1, overflowY: "auto" }}>
            {/* ── Desktop Header ── */}
            <header style={{
                padding: "28px 32px 20px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--void)",
                position: "sticky",
                top: 0,
                zIndex: 30,
            }}>
                <div>
                    <h1 style={{ fontFamily: "var(--font-cinzel)", fontSize: 22, fontWeight: 700, letterSpacing: "0.08em", color: "var(--white)" }}>
                        {getGreeting()}, {users[0]?.name}
                    </h1>
                    <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>
                        {house.address} · {house.city}, {house.state}
                    </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <Link href="/new-project" className="btn-primary" id="dashboard-new-project-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        New Project
                    </Link>
                </div>
            </header>

            <div style={{ padding: "24px 32px" }}>
                {/* ── Welcome / Onboarding Prompt ── */}
                {!house.address && (
                    <div style={{
                        background: "linear-gradient(135deg, rgba(212,185,120,0.1) 0%, rgba(212,185,120,0.05) 100%)",
                        border: "1px solid var(--border-warm)",
                        borderRadius: "var(--r)",
                        padding: "32px",
                        marginBottom: 24,
                        textAlign: "center",
                        position: "relative",
                        overflow: "hidden"
                    }}>
                        <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.1 }}>
                            <svg width="120" height="120" viewBox="0 0 24 24" fill="var(--gold)"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                        </div>
                        <h2 style={{ fontFamily: "var(--font-cinzel)", fontSize: 20, fontWeight: 700, color: "var(--white)", marginBottom: 8 }}>Complete Your Home Profile</h2>
                        <p style={{ fontSize: 13, color: "var(--soft)", maxWidth: 440, margin: "0 auto 20px" }}>
                            Foundation works best when it knows your home&apos;s DNA. Map your rooms and set your team to unlock AI sequencing.
                        </p>
                        <Link href="/onboarding" className="btn-primary" style={{ display: "inline-flex", padding: "12px 24px" }}>
                            Get Started ✦
                        </Link>
                    </div>
                )}

                {/* ── Stat Bar ── */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r)",
                    overflow: "hidden",
                    marginBottom: 24,
                }}>
                    {[
                        { label: "Active Projects", value: projects.filter(p => p.status === "active").length, sub: `${projects.length} total` },
                        { label: "Tasks This Week", value: activeTasks.length, sub: `${tasks.filter(t => t.done).length} done` },
                        { label: "Total Budget", value: fmtMoney(totalBudget), sub: `${fmtMoney(totalSpent)} spent` },
                        { label: "Urgent Items", value: urgentMaterials.length, sub: "need ordering", warn: urgentMaterials.length > 0 },
                    ].map((stat, i) => (
                        <div key={i} style={{
                            padding: "18px 22px",
                            borderRight: i < 3 ? "1px solid var(--border)" : undefined,
                        }}>
                            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--muted)", marginBottom: 8 }}>
                                {stat.label}
                            </div>
                            <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 26, fontWeight: 700, color: stat.warn ? "var(--amber)" : "var(--white)" }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>{stat.sub}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
                    {/* ── Left column ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                        {/* Projects strip */}
                        <section aria-label="Active projects">
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                <span className="sec-title">Projects</span>
                                <Link href="/projects" style={{ fontSize: 11, color: "var(--gold)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                                    View all →
                                </Link>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                                {projects.map((p) => (
                                    <Link key={p.id} href={`/projects/${p.id}`} style={{ textDecoration: "none" }}>
                                        <article style={{
                                            background: "var(--card)",
                                            border: "1px solid var(--border)",
                                            borderRadius: "var(--r)",
                                            overflow: "hidden",
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                        }}
                                            onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-warm)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                                            onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.transform = ""; }}
                                        >
                                            <div style={{ height: 4, background: p.color }} />
                                            <div style={{ padding: "14px 16px 10px" }}>
                                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                                                    <div>
                                                        <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", color: "var(--white)", marginBottom: 3 }}>{p.name}</div>
                                                        <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{p.room}</div>
                                                    </div>
                                                    <span className={`status-pill sp-${p.status}`}>{p.status}</span>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                                    <span style={{ fontFamily: "var(--font-cinzel)", fontSize: 11, color: p.color }}>{p.progress}%</span>
                                                    <div className="prog-track" style={{ flex: 1 }}>
                                                        <div className="prog-fill" style={{ width: `${p.progress}%`, background: p.color }} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", background: "rgba(0,0,0,0.2)", borderTop: "1px solid var(--border)" }}>
                                                <span style={{ fontSize: 11, color: "var(--muted)" }}>{fmtMoney(p.budget)} budget</span>
                                                <span style={{ fontSize: 11, fontWeight: 600, color: p.spent > p.budget * 0.8 ? "var(--amber)" : "var(--white)" }}>{fmtMoney(p.spent)} spent</span>
                                            </div>
                                        </article>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* Next tasks */}
                        <section aria-label="Upcoming tasks">
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                <span className="sec-title">Next Up</span>
                                <Link href="/blueprint" style={{ fontSize: 11, color: "var(--gold)", textDecoration: "none" }}>Blueprint →</Link>
                            </div>
                            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", overflow: "hidden" }}>
                                {nextTasks.map((t, i) => (
                                    <div key={t.id} style={{
                                        display: "flex", alignItems: "center", gap: 12, padding: "11px 18px",
                                        borderBottom: i < nextTasks.length - 1 ? "1px solid var(--border)" : undefined,
                                        transition: "background 0.15s",
                                    }}
                                        onMouseOver={e => (e.currentTarget.style.background = "rgba(255,255,255,0.015)")}
                                        onMouseOut={e => (e.currentTarget.style.background = "")}
                                    >
                                        <button
                                            id={`dashboard-task-check-${t.id}`}
                                            onClick={() => toggleTask(t.id)}
                                            style={{
                                                width: 18, height: 18, borderRadius: 5,
                                                border: t.done ? "none" : "1px solid var(--border)",
                                                background: t.done ? "var(--green-dim)" : "transparent",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                cursor: "pointer", flexShrink: 0, transition: "all 0.18s",
                                            }}
                                            aria-label={`Mark ${t.name} ${t.done ? "incomplete" : "complete"}`}
                                        >
                                            {t.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--green-br)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                                        </button>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, color: "var(--white)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
                                            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: t.projColor, display: "inline-block" }} />
                                                {t.proj} · {t.dur}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 10, color: "var(--muted)", flexShrink: 0 }}>{t.date}</div>
                                        <div style={{ fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 10, background: "var(--raised)", color: "var(--soft)" }}>{t.who}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* ── Right column ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                        {/* AI Brief */}
                        <section aria-label="AI assistant" style={{ background: "var(--card)", border: "1px solid var(--border-warm)", borderRadius: "var(--r)", overflow: "hidden" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--gold-dim)", border: "1px solid var(--border-warm)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--gold)"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                                </div>
                                <div>
                                    <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "var(--gold)" }}>Foundation AI</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--green-br)" }}>
                                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green-br)", display: "inline-block" }} className="house-pulse" />
                                        Online
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: "14px 16px" }}>
                                <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--white)" }}
                                    dangerouslySetInnerHTML={{ __html: loading ? "<em style='color:var(--muted)'>Thinking…</em>" : aiMsg }}
                                />
                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                                    {["What's blocking me?", "Budget status", "This weekend tasks"].map((chip) => (
                                        <button key={chip} className="ftab" onClick={() => setInput(chip)} style={{ fontSize: 10, padding: "4px 10px" }}>
                                            {chip}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 8, padding: "10px 14px", borderTop: "1px solid var(--border)" }}>
                                <input
                                    id="dashboard-ai-input"
                                    className="ai-input"
                                    placeholder="Ask about your projects…"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                />
                                <button id="dashboard-ai-send" className="ai-send" onClick={sendMessage} aria-label="Send message">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                                    </svg>
                                </button>
                            </div>
                        </section>

                        {/* Budget snapshot */}
                        <section aria-label="Budget snapshot" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "16px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                                <span className="sec-title">Budget</span>
                                <Link href="/budget" style={{ fontSize: 11, color: "var(--gold)", textDecoration: "none" }}>Details →</Link>
                            </div>
                            {projects.map((p) => {
                                const pct = Math.min(Math.round((p.spent / p.budget) * 100), 100);
                                return (
                                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                                        <span style={{ fontSize: 11, color: "var(--soft)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                                        <div className="prog-track" style={{ width: 80 }}>
                                            <div className="prog-fill" style={{ width: `${pct}%`, background: pct > 80 ? "var(--amber)" : p.color }} />
                                        </div>
                                        <span style={{ fontSize: 11, color: "var(--white)", fontWeight: 500, minWidth: 38, textAlign: "right" }}>{fmtMoney(p.spent)}</span>
                                    </div>
                                );
                            })}
                            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 4, display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontSize: 11, color: "var(--muted)" }}>Total remaining</span>
                                <span style={{ fontFamily: "var(--font-cinzel)", fontSize: 14, fontWeight: 600, color: "var(--green-br)" }}>{fmtMoney(totalBudget - totalSpent)}</span>
                            </div>
                        </section>

                        {/* Urgent materials */}
                        {urgentMaterials.length > 0 && (
                            <section aria-label="Urgent materials" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", overflow: "hidden" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                                    <span className="sec-title" style={{ color: "var(--amber)" }}>Urgent Orders</span>
                                    <Link href="/materials" style={{ fontSize: 11, color: "var(--gold)", textDecoration: "none" }}>View all →</Link>
                                </div>
                                {urgentMaterials.map((m, i) => (
                                    <div key={m.id} style={{
                                        display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
                                        borderBottom: i < urgentMaterials.length - 1 ? "1px solid var(--border)" : undefined,
                                    }}>
                                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--amber)", flexShrink: 0 }} />
                                        <span style={{ flex: 1, fontSize: 12, color: "var(--white)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--white)" }}>{fmtMoney(m.price)}</span>
                                    </div>
                                ))}
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
