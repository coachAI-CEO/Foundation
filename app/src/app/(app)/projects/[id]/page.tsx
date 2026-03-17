"use client";

import { use, useState } from "react";
import { useStore, fmtMoney } from "@/lib/store";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { projects, tasks, expenses, materials } = useStore();
    const toggleTask = useStore((s) => s.toggleTask);
    const [view, setView] = useState<"tasks" | "budget" | "photos">("tasks");

    const [lightbox, setLightbox] = useState<string | null>(null);

    const proj = projects.find((p) => p.id === id);
    if (!proj) return notFound();

    const projTasks = tasks.filter((t) => t.proj === id);
    const projExpenses = expenses.filter((e) => e.projId === id);
    const projMaterials = materials.filter((m) => m.proj === id);

    const phases = ["demo", "frame", "finish", "inspect"];
    const phaseColors: Record<string, string> = {
        demo: "var(--red-br)",
        frame: "var(--amber)",
        finish: "var(--green-br)",
        inspect: "var(--blue-br)",
    };

    return (
        <div style={{ flex: 1, overflowY: "auto" }}>
            {/* Lightbox Overlay */}
            <AnimatePresence>
                {lightbox && (
                    <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
                        <button className="lightbox-close">×</button>
                        <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                            <img src={lightbox} alt="Full View" className="lightbox-image" />
                            <div style={{ padding: "16px 0", textAlign: "center" }}>
                                <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 18, fontWeight: 700, color: "var(--white)" }}>{proj.name} Gallery</div>
                                <div style={{ fontSize: 13, color: "var(--gold)" }}>Room: {proj.room}</div>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header / Breadcrumb */}
            <header style={{ padding: "24px 32px 16px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 30, background: "var(--void)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 11, color: "var(--muted)" }}>
                    <Link href="/projects" style={{ color: "inherit", textDecoration: "none" }}>Projects</Link>
                    <span>/</span>
                    <span style={{ color: "var(--white)", fontWeight: 500 }}>{proj.name}</span>
                </div>
                
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                        <h1 style={{ fontFamily: "var(--font-cinzel)", fontSize: 24, fontWeight: 700, color: "var(--white)", marginBottom: 4 }}>{proj.name}</h1>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{proj.room}</span>
                            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--border)" }} />
                            <span style={{ fontSize: 11, color: proj.status === "active" ? "var(--green-br)" : "var(--soft)" }}>{proj.status.toUpperCase()}</span>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button className="btn-ghost" style={{ padding: "8px 16px" }}>Export</button>
                        <button className="btn-primary" style={{ padding: "8px 16px" }}>Share</button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 24, marginTop: 24 }}>
                    {[
                        { id: "tasks", label: "Tasks", icon: "📐" },
                        { id: "budget", label: "Budget & Materials", icon: "💰" },
                        { id: "photos", label: "Photo Log", icon: "📷" },
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setView(t.id as "tasks" | "budget" | "photos")}
                            style={{
                                background: "none", border: "none", padding: "0 0 12px",
                                color: view === t.id ? "var(--gold)" : "var(--muted)",
                                fontSize: 12, fontWeight: 600, letterSpacing: "0.05em",
                                borderBottom: view === t.id ? "2px solid var(--gold)" : "2px solid transparent",
                                cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s",
                            }}
                        >
                            <span>{t.icon}</span>
                            {t.label}
                        </button>
                    ))}
                </div>
            </header>

            <div style={{ padding: "28px 32px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28 }}>
                    
                    {/* Main Section */}
                    <div>
                        {view === "tasks" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                {/* Gantt Strip */}
                                <section style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "20px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                                        <span style={{ fontFamily: "var(--font-cinzel)", fontSize: 11, letterSpacing: "0.1em", color: "var(--gold)" }}>Timeline</span>
                                        <span style={{ fontSize: 10, color: "var(--muted)" }}>Mar – Apr 2025</span>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {phases.map((ph) => {
                                            const pts = projTasks.filter(t => t.phase === ph);
                                            if (pts.length === 0 && ph === "inspect") return null;
                                            const done = pts.filter(t => t.done).length;
                                            const pcent = pts.length > 0 ? (done / pts.length) * 100 : 0;
                                            return (
                                                <div key={ph} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                    <div style={{ width: 80, fontSize: 11, color: "var(--soft)", textTransform: "capitalize" }}>{ph}</div>
                                                    <div style={{ flex: 1, height: 18, background: "var(--raised)", borderRadius: 4, position: "relative", overflow: "hidden" }}>
                                                        <div style={{ height: "100%", width: `${Math.max(pcent, 10)}%`, background: phaseColors[ph], opacity: 0.3, position: "absolute", left: 0 }} />
                                                        <div style={{ height: "100%", width: `${pcent}%`, background: phaseColors[ph], position: "absolute", left: 0, transition: "width 1s ease" }} />
                                                        <span style={{ position: "absolute", left: 8, top: 4, fontSize: 9, fontWeight: 700, color: "var(--white)", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
                                                            {done}/{pts.length} tasks
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* Task List by Phase */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {phases.map((ph) => {
                                        const pts = projTasks.filter(t => t.phase === ph);
                                        if (pts.length === 0) return null;
                                        return (
                                            <div key={ph} style={{ marginBottom: 12 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: phaseColors[ph] }} />
                                                    <span style={{ fontFamily: "var(--font-cinzel)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: phaseColors[ph] }}>{ph}</span>
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                                    {pts.map((t) => (
                                                        <div key={t.id} className={`task-card ${t.done ? "completed" : ""}`} style={{ paddingLeft: 18 }}>
                                                            <div style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 2, background: phaseColors[ph], borderRadius: "0 2px 2px 0" }} />
                                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                                <button
                                                                    onClick={() => toggleTask(t.id)}
                                                                    style={{
                                                                        width: 18, height: 18, borderRadius: 5,
                                                                        border: t.done ? "none" : "1.5px solid var(--border)",
                                                                        background: t.done ? "var(--green)" : "transparent",
                                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                                        cursor: "pointer", transition: "all 0.15s",
                                                                    }}
                                                                >
                                                                    {t.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                                                                </button>
                                                                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: t.done ? "var(--muted)" : "var(--white)" }}>{t.name}</span>
                                                                <span style={{ fontSize: 10, color: "var(--muted)" }}>{t.dur}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {view === "budget" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                <section style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "20px" }}>
                                    <h3 style={{ fontFamily: "var(--font-cinzel)", fontSize: 14, color: "var(--white)", marginBottom: 16 }}>Materials Needed</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {projMaterials.length === 0 ? (
                                            <p style={{ fontSize: 12, color: "var(--muted)" }}>No materials listed for this project.</p>
                                        ) : projMaterials.map(m => (
                                            <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "var(--raised)", borderRadius: 10 }}>
                                                <div>
                                                    <div style={{ fontSize: 13, color: "var(--white)", fontWeight: 500 }}>{m.name}</div>
                                                    <div style={{ fontSize: 10, color: "var(--muted)" }}>{m.qty} from {m.source}</div>
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{fmtMoney(m.price)}</div>
                                                    <div style={{ fontSize: 9, color: m.priority === "urgent" ? "var(--red-br)" : "var(--muted)", textTransform: "uppercase" }}>{m.priority}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "20px" }}>
                                    <h3 style={{ fontFamily: "var(--font-cinzel)", fontSize: 14, color: "var(--white)", marginBottom: 16 }}>Recent Expenses</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {projExpenses.length === 0 ? (
                                            <p style={{ fontSize: 12, color: "var(--muted)" }}>No expenses logged yet.</p>
                                        ) : projExpenses.map(e => (
                                            <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", borderBottom: "1px solid var(--border)" }}>
                                                <div>
                                                    <div style={{ fontSize: 13, color: "var(--white)" }}>{e.desc}</div>
                                                    <div style={{ fontSize: 10, color: "var(--muted)" }}>{e.date} • {e.who}</div>
                                                </div>
                                                <div style={{ fontSize: 13, fontWeight: 600 }}>{fmtMoney(e.amount)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}

                        {view === "photos" && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <div style={{ gridColumn: "1/-1", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                    <h3 style={{ fontFamily: "var(--font-cinzel)", fontSize: 14, color: "var(--white)" }}>Before & After</h3>
                                    <button className="btn-ghost" style={{ fontSize: 11 }}>+ Add Photo</button>
                                </div>
                                
                                <div 
                                    onClick={() => setLightbox("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200")}
                                    style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", overflow: "hidden", cursor: "zoom-in" }}>
                                    <div style={{ aspectRatio: "4/3", background: "url('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800') center/cover", position: "relative" }}>
                                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--white)", fontSize: 11, fontWeight: 600 }}>BEFORE</div>
                                    </div>
                                    <div style={{ padding: 12 }}>
                                        <div style={{ fontSize: 12, color: "var(--white)", fontWeight: 500 }}>Original State</div>
                                        <div style={{ fontSize: 10, color: "var(--muted)" }}>Logged Feb 12</div>
                                    </div>
                                </div>

                                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", overflow: "hidden", borderStyle: "dashed", opacity: 0.6 }}>
                                    <div style={{ aspectRatio: "4/3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                        <span style={{ fontSize: 24 }}>📸</span>
                                        <span style={{ fontSize: 10, color: "var(--muted)" }}>Upload After Photo</span>
                                    </div>
                                    <div style={{ padding: 12 }}>
                                        <div style={{ fontSize: 12, color: "var(--muted)" }}>Pending Completion...</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Rail */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {/* Progress Circle */}
                        <section style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "24px", textAlign: "center" }}>
                            <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 16px" }}>
                                <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
                                    <circle cx="60" cy="60" r="54" fill="none" stroke="var(--raised)" strokeWidth="8" />
                                    <circle cx="60" cy="60" r="54" fill="none" stroke={proj.progress > 80 ? "var(--green-br)" : "var(--gold)"}
                                        strokeWidth="8" strokeDasharray={`${2 * Math.PI * 54}`}
                                        strokeDashoffset={`${2 * Math.PI * 54 * (1 - proj.progress / 100)}`}
                                        strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.5s ease" }} />
                                </svg>
                                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                    <span style={{ fontFamily: "var(--font-cinzel)", fontSize: 24, fontWeight: 700, color: "var(--white)" }}>{proj.progress}%</span>
                                    <span style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Complete</span>
                                </div>
                            </div>
                            <div style={{ fontSize: 11, color: "var(--soft)" }}>
                                {proj.tasksDone} of {proj.tasksTotal} tasks finished
                            </div>
                        </section>

                        {/* Budget Stats */}
                        <section style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "20px" }}>
                            <h4 style={{ fontFamily: "var(--font-cinzel)", fontSize: 11, letterSpacing: "0.1em", color: "var(--gold)", marginBottom: 14 }}>Project Budget</h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: 12, color: "var(--muted)" }}>Budget</span>
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{fmtMoney(proj.budget)}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: 12, color: "var(--muted)" }}>Spent</span>
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{fmtMoney(proj.spent)}</span>
                                </div>
                                <div style={{ height: 1, background: "var(--border)" }} />
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: 12, color: "var(--white)", fontWeight: 500 }}>Remaining</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green-br)" }}>{fmtMoney(proj.budget - proj.spent)}</span>
                                </div>
                            </div>
                        </section>

                        {/* Next Up */}
                        <section style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "20px" }}>
                            <h4 style={{ fontFamily: "var(--font-cinzel)", fontSize: 11, letterSpacing: "0.1em", color: "var(--gold)", marginBottom: 12 }}>Next Decision</h4>
                            <div style={{ background: "var(--raised)", borderRadius: 10, padding: 12, border: "1px solid var(--border-warm)" }}>
                                <div style={{ fontSize: 11, color: "var(--white)", fontWeight: 600, marginBottom: 4 }}>Tile Selection Cutoff</div>
                                <div style={{ fontSize: 9, color: "var(--muted)", marginBottom: 8 }}>Master Bath • Showroom pickup</div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{ fontSize: 10, color: "var(--red-br)", fontWeight: 700 }}>DUE IN 2 DAYS</span>
                                    <span style={{ fontSize: 10, color: "var(--muted)" }}>• Thu, Mar 20</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
