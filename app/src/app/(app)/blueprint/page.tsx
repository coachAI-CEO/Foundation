"use client";

import { useState } from "react";
import { useStore, fmtMoney } from "@/lib/store";
import type { Task } from "@/lib/types";

const PHASE_STYLES: Record<string, { color: string; bg: string; label: string }> = {
    demo: { color: "var(--red-br)", bg: "var(--red-dim)", label: "Demo" },
    frame: { color: "var(--amber)", bg: "var(--amber-dim)", label: "Framing" },
    finish: { color: "var(--green-br)", bg: "var(--green-dim)", label: "Finishing" },
    inspect: { color: "var(--blue-br)", bg: "var(--blue-dim)", label: "Inspect" },
};

export default function BlueprintPage() {
    const { projects, tasks, phases } = useStore();
    const toggleTask = useStore((s) => s.toggleTask);
    const [selectedProj, setSelectedProj] = useState(projects[0]?.id || "");
    const [phaseFilter, setPhaseFilter] = useState("all");

    const proj = projects.find((p) => p.id === selectedProj);
    const projTasks = tasks.filter((t) => t.proj === selectedProj);
    const filteredTasks = phaseFilter === "all" ? projTasks : projTasks.filter((t) => t.phase === phaseFilter);

    const tasksByPhase: Record<string, Task[]> = {};
    filteredTasks.forEach((t) => {
        if (!tasksByPhase[t.phase]) tasksByPhase[t.phase] = [];
        tasksByPhase[t.phase].push(t);
    });

    const totalCost = projTasks.reduce((a, t) => a + t.cost, 0);

    return (
        <div style={{ flex: 1, overflowY: "auto" }}>
            <header style={{ padding: "28px 32px 20px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 30, background: "var(--void)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                        <h1 style={{ fontFamily: "var(--font-cinzel)", fontSize: 22, fontWeight: 700, letterSpacing: "0.1em", color: "var(--white)" }}>Blueprint</h1>
                        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>Task sequencer — drag to reorder, click to complete</p>
                    </div>
                    <button className="btn-primary" id="blueprint-add-task-btn" onClick={() => { }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Add Task
                    </button>
                </div>

                {/* Project selector */}
                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                    {projects.map((p) => (
                        <button
                            key={p.id}
                            id={`blueprint-proj-${p.id}`}
                            className={`ftab ${selectedProj === p.id ? "active" : ""}`}
                            onClick={() => setSelectedProj(p.id)}
                            style={{ borderLeftColor: selectedProj === p.id ? p.color : undefined }}
                        >
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, display: "inline-block", marginRight: 4 }} />
                            {p.name}
                        </button>
                    ))}
                </div>

                {/* Phase filters */}
                <div style={{ display: "flex", gap: 6 }}>
                    <button className={`ftab ${phaseFilter === "all" ? "active" : ""}`} onClick={() => setPhaseFilter("all")}>All Phases</button>
                    {Object.entries(PHASE_STYLES).map(([key, s]) => (
                        <button
                            key={key}
                            id={`blueprint-phase-${key}`}
                            className={`ftab ${phaseFilter === key ? "active" : ""}`}
                            onClick={() => setPhaseFilter(key)}
                            style={{ borderColor: phaseFilter === key ? s.color : undefined, color: phaseFilter === key ? s.color : undefined }}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, padding: "24px 32px" }}>
                {/* Task list */}
                <div>
                    {proj && (
                        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "16px 18px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(212,185,120,0.04) 0%, transparent 50%)", pointerEvents: "none" }} />
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                                <div>
                                    <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 16, fontWeight: 600, color: "var(--white)", marginBottom: 2 }}>{proj.name}</div>
                                    <div style={{ fontSize: 10, color: "var(--muted)" }}>{proj.room} · {projTasks.length} tasks · est. {fmtMoney(totalCost)}</div>
                                </div>
                                <div style={{ display: "flex", gap: 16, textAlign: "center" }}>
                                    {[["Tasks", `${proj.tasksDone}/${proj.tasksTotal}`], ["Progress", `${proj.progress}%`], ["Budget", fmtMoney(proj.budget)]].map(([l, v]) => (
                                        <div key={l}>
                                            <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 18, fontWeight: 600, color: "var(--white)" }}>{v}</div>
                                            <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ height: 4, background: "var(--raised)", borderRadius: 4, overflow: "hidden" }}>
                                <div style={{ height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${proj.color}, ${proj.color}cc)`, width: `${proj.progress}%`, transition: "width 1.2s ease" }} />
                            </div>
                        </div>
                    )}

                    {Object.keys(PHASE_STYLES).filter(ph => tasksByPhase[ph]?.length).map((ph) => {
                        const s = PHASE_STYLES[ph];
                        const phaseTasks = tasksByPhase[ph] || [];
                        const done = phaseTasks.filter((t) => t.done).length;
                        return (
                            <div key={ph} style={{ marginBottom: 6 }}>
                                {/* Phase header */}
                                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0 8px" }}>
                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                                    <span style={{ fontFamily: "var(--font-cinzel)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: s.color }}>{s.label}</span>
                                    <span style={{ fontSize: 10, color: "var(--muted)" }}>{done}/{phaseTasks.length}</span>
                                    <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                                    <span style={{ fontSize: 10, fontWeight: 500, color: s.color }}>{phaseTasks.length > 0 ? Math.round((done / phaseTasks.length) * 100) : 0}%</span>
                                </div>

                                {/* Tasks */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {phaseTasks.map((t) => (
                                        <div
                                            key={t.id}
                                            className={`task-card ${t.done ? "completed" : ""}`}
                                            style={{ paddingLeft: 18 }}
                                        >
                                            {/* Phase accent bar */}
                                            <div style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 2, background: s.color, borderRadius: "0 2px 2px 0" }} />

                                            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                                                <button
                                                    id={`blueprint-task-${t.id}`}
                                                    onClick={() => toggleTask(t.id)}
                                                    style={{
                                                        width: 18, height: 18, borderRadius: 5,
                                                        border: t.done ? "none" : "1.5px solid var(--border)",
                                                        background: t.done ? "var(--green)" : "transparent",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        cursor: "pointer", flexShrink: 0, marginTop: 1, transition: "all 0.15s",
                                                    }}
                                                    aria-label={`Mark ${t.name} ${t.done ? "incomplete" : "complete"}`}
                                                >
                                                    {t.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                                                </button>
                                                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: t.done ? "var(--muted)" : "var(--white)" }} className="task-name">{t.name}</span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 28, flexWrap: "wrap" }}>
                                                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 4, background: s.bg, color: s.color }}>{ph}</span>
                                                <span style={{ fontSize: 10, color: "var(--muted)", display: "flex", alignItems: "center", gap: 3 }}>
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" /></svg>
                                                    {t.dur}
                                                </span>
                                                {t.cost > 0 && <span style={{ fontSize: 10, color: "var(--muted)" }}>{fmtMoney(t.cost)}</span>}
                                                <span style={{ fontSize: 10, color: "var(--muted)" }}>{t.date}</span>
                                                <div style={{ width: 18, height: 18, borderRadius: "50%", background: t.who === "Leo" ? "rgba(212,185,120,0.15)" : t.who === "Both" ? "var(--raised)" : "rgba(78,122,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 700, color: t.who === "Leo" ? "var(--gold)" : t.who === "Both" ? "var(--soft)" : "var(--green-br)" }}>
                                                    {t.who[0]}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {filteredTasks.length === 0 && (
                        <div className="empty-state">
                            <div style={{ fontSize: 40, opacity: 0.3 }}>📋</div>
                            <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 14, color: "var(--white)" }}>No tasks yet</div>
                            <div style={{ fontSize: 12, color: "var(--muted)" }}>Add tasks or generate a blueprint with AI.</div>
                        </div>
                    )}
                </div>

                {/* Right panel — AI generate */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <button
                        id="blueprint-ai-generate-btn"
                        style={{
                            display: "flex", alignItems: "center", gap: 10, width: "100%",
                            background: "linear-gradient(135deg, rgba(212,185,120,0.1), rgba(212,185,120,0.06))",
                            border: "1px solid var(--border-warm)", borderRadius: "var(--r)", padding: "14px 16px",
                            cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden",
                        }}
                    >
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, var(--gold-br), var(--gold))", boxShadow: "0 0 12px rgba(212,185,120,0.4)", flexShrink: 0, animation: "breathe 3s ease-in-out infinite" }} />
                        <div style={{ textAlign: "left" }}>
                            <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 12, letterSpacing: "0.1em", color: "var(--gold)" }}>Generate Blueprint</div>
                            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>AI builds your full phase plan</div>
                        </div>
                        <svg style={{ marginLeft: "auto" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>

                    {/* Phase summary */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", overflow: "hidden" }}>
                        <div style={{ padding: "12px 14px 8px", borderBottom: "1px solid var(--border)" }}>
                            <span className="sec-title">Phase Summary</span>
                        </div>
                        {Object.entries(PHASE_STYLES).map(([key, s]) => {
                            const pts = (tasksByPhase[key] || []);
                            const done = pts.filter((t) => t.done).length;
                            return (
                                <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
                                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                                    <span style={{ flex: 1, fontSize: 12, color: "var(--soft)" }}>{s.label}</span>
                                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{done}/{pts.length}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Cost breakdown */}
                    {proj && (
                        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "14px 16px" }}>
                            <span className="sec-title" style={{ display: "block", marginBottom: 12 }}>Cost Breakdown</span>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ fontSize: 11, color: "var(--muted)" }}>Estimated tasks</span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--white)" }}>{fmtMoney(totalCost)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ fontSize: 11, color: "var(--muted)" }}>Budget remaining</span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--green-br)" }}>{fmtMoney(proj.budget - proj.spent)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
