"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore, fmtMoney } from "@/lib/store";
import type { Project } from "@/lib/types";

const STEPS = ["Type", "Details", "Budget", "AI Plan", "Review"];
const ROOMS = ["Kitchen", "Master Bath", "Living Room", "Bedroom", "Garage", "Backyard", "Basement", "Office", "Dining Room", "Other"];
const COLORS = ["#d4b978", "#7aaac8", "#72b08a", "#cc8888", "#d4903a", "#a07ac8", "#5c8fd4", "#c87878"];

export default function NewProjectPage() {
    const router = useRouter();
    const addProject = useStore((s) => s.addProject);
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "", room: "", color: COLORS[0], style: "", budget: "", timeline: "", notes: "", diy: "hands-on",
    });
    const [aiPlan, setAiPlan] = useState<{ aiNote: string; phases: { name: string; tasks: string[]; days: number }[] } | null>(null);

    function next() { setStep((s) => Math.min(s + 1, STEPS.length - 1)); }
    function back() { setStep((s) => Math.max(s - 1, 0)); }

    async function generatePlan() {
        setLoading(true);
        try {
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json", 
                    "x-api-key": localStorage.getItem("gemini_api_key") || ""
                },
                body: JSON.stringify({
                    message: `Generate a JSON project plan for: ${form.name} in ${form.room}. Budget: $${form.budget}. Timeline: ${form.timeline}. Style: ${form.style}. Notes: ${form.notes}. Return raw JSON only: { "aiNote": "brief advice", "phases": [{ "name": "Phase name", "days": 5, "tasks": ["Task 1", "Task 2"] }] }`,
                    context: `New project planning. Room: ${form.room}. DIY level: ${form.diy}.`,
                }),
            });
            const data = await res.json();
            try {
                const json = JSON.parse(data.reply.replace(/```json\n?|\n?```/g, "").trim());
                setAiPlan(json);
            } catch {
                setAiPlan({ aiNote: data.reply, phases: [{ name: "Phase 1", tasks: ["Research and planning", "Order materials", "Execute work", "Final inspection"], days: 7 }] });
            }
        } catch {
            setAiPlan({ aiNote: "Plan generated. Add your tasks in Blueprint.", phases: [{ name: "Getting Started", tasks: ["Define scope", "Set budget", "Order materials"], days: 3 }] });
        } finally {
            setLoading(false);
        }
    }

    function createProject() {
        const proj: Project = {
            id: form.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
            name: form.name,
            room: form.room,
            color: form.color,
            progress: 0,
            budget: parseFloat(form.budget) || 0,
            spent: 0,
            tasksTotal: aiPlan?.phases.reduce((a, p) => a + p.tasks.length, 0) || 0,
            tasksDone: 0,
            status: "planning",
            daysLeft: null,
            nextTask: aiPlan?.phases[0]?.tasks[0] || null,
            nextDate: null,
        };
        addProject(proj);
        router.push("/projects");
    }

    return (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", overflowY: "auto" }}>
            <div style={{ width: "100%", maxWidth: 600 }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 24, fontWeight: 700, letterSpacing: "0.1em", color: "var(--white)", marginBottom: 8 }}>New Project</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>AI-powered project wizard — {STEPS.length} steps</div>
                </div>

                {/* Step indicators */}
                <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28, justifyContent: "center" }}>
                    {STEPS.map((s, i) => (
                        <div key={s} style={{ display: "flex", alignItems: "center" }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: "50%",
                                background: i < step ? "var(--green-dim)" : i === step ? "var(--gold-dim)" : "var(--raised)",
                                border: `1px solid ${i < step ? "rgba(78,122,94,0.4)" : i === step ? "var(--border-warm)" : "var(--border)"}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 10, fontWeight: 600, color: i < step ? "var(--green-br)" : i === step ? "var(--gold)" : "var(--muted)",
                                transition: "all 0.3s",
                            }}>
                                {i < step ? "✓" : i + 1}
                            </div>
                            {i < STEPS.length - 1 && <div style={{ width: 32, height: 1, background: i < step ? "var(--green-br)" : "var(--border)", transition: "background 0.3s" }} />}
                        </div>
                    ))}
                </div>
                <div style={{ textAlign: "center", fontFamily: "var(--font-cinzel)", fontSize: 11, letterSpacing: "0.12em", color: "var(--gold)", marginBottom: 24 }}>
                    {STEPS[step]}
                </div>

                {/* Step content */}
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "28px 28px 24px" }}>
                    {step === 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", display: "block", marginBottom: 8 }}>Project Name</label>
                                <input id="new-project-name" placeholder="e.g., Kitchen Refresh, Master Bath Reno" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    style={{ width: "100%", background: "var(--raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px", fontFamily: "var(--font-dm)", fontSize: 14, color: "var(--white)", outline: "none", transition: "border-color 0.2s" }}
                                    onFocus={e => (e.target.style.borderColor = "var(--border-warm)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
                            </div>
                            <div>
                                <label style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", display: "block", marginBottom: 8 }}>Room / Area</label>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {ROOMS.map((r) => (
                                        <button key={r} id={`new-project-room-${r}`} className={`ftab ${form.room === r ? "active" : ""}`} onClick={() => setForm({ ...form, room: r })}>{r}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", display: "block", marginBottom: 8 }}>Project Color</label>
                                <div style={{ display: "flex", gap: 8 }}>
                                    {COLORS.map((c) => (
                                        <button key={c} id={`new-project-color-${c}`} onClick={() => setForm({ ...form, color: c })} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: form.color === c ? "2px solid white" : "2px solid transparent", cursor: "pointer", transition: "all 0.15s" }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", display: "block", marginBottom: 8 }}>Style / Aesthetic</label>
                                <input id="new-project-style" placeholder="Modern, Scandinavian, Farmhouse, Craftsman…" value={form.style} onChange={e => setForm({ ...form, style: e.target.value })}
                                    style={{ width: "100%", background: "var(--raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px", fontFamily: "var(--font-dm)", fontSize: 14, color: "var(--white)", outline: "none", transition: "border-color 0.2s" }}
                                    onFocus={e => (e.target.style.borderColor = "var(--border-warm)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
                            </div>
                            <div>
                                <label style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", display: "block", marginBottom: 8 }}>Notes & Goals</label>
                                <textarea id="new-project-notes" placeholder="What's the big picture? What problems are you solving?" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={4}
                                    style={{ width: "100%", background: "var(--raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px", fontFamily: "var(--font-dm)", fontSize: 13, color: "var(--white)", outline: "none", resize: "none", transition: "border-color 0.2s" }}
                                    onFocus={e => (e.target.style.borderColor = "var(--border-warm)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", display: "block", marginBottom: 8 }}>Total Budget</label>
                                <div style={{ position: "relative" }}>
                                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "var(--gold)", fontFamily: "var(--font-cinzel)" }}>$</span>
                                    <input id="new-project-budget" type="number" placeholder="15000" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })}
                                        style={{ width: "100%", background: "var(--raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px 12px 28px", fontFamily: "var(--font-cinzel)", fontSize: 20, color: "var(--white)", outline: "none", transition: "border-color 0.2s" }}
                                        onFocus={e => (e.target.style.borderColor = "var(--border-warm)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
                                </div>
                                {form.budget && <div style={{ marginTop: 8, fontSize: 11, color: "var(--muted)" }}>Formatted: {fmtMoney(parseFloat(form.budget))}</div>}
                            </div>
                            <div>
                                <label style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", display: "block", marginBottom: 8 }}>Target Timeline</label>
                                <input id="new-project-timeline" placeholder="e.g., 6 weeks, before summer, 3 months" value={form.timeline} onChange={e => setForm({ ...form, timeline: e.target.value })}
                                    style={{ width: "100%", background: "var(--raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px", fontFamily: "var(--font-dm)", fontSize: 14, color: "var(--white)", outline: "none", transition: "border-color 0.2s" }}
                                    onFocus={e => (e.target.style.borderColor = "var(--border-warm)")} onBlur={e => (e.target.style.borderColor = "var(--border)")} />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            {!aiPlan ? (
                                <div style={{ textAlign: "center", padding: "20px 0" }}>
                                    <div style={{ width: 60, height: 60, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, var(--gold-br), var(--gold))", boxShadow: "0 0 20px rgba(212,185,120,0.5)", margin: "0 auto 18px", animation: "breathe 3s ease-in-out infinite" }} />
                                    <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 14, letterSpacing: "0.1em", color: "var(--white)", marginBottom: 8 }}>Generate AI Blueprint</div>
                                    <div style={{ fontSize: 12, color: "var(--muted)", maxWidth: 360, margin: "0 auto 20px", lineHeight: 1.6 }}>Foundation AI will build a complete project plan with phases, tasks, and cost estimates based on your details.</div>
                                    <button id="new-project-generate-btn" className="btn-primary" style={{ margin: "0 auto" }} onClick={generatePlan} disabled={loading}>
                                        {loading ? (
                                            <><span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #0b0b0c", borderTopColor: "transparent", display: "inline-block", animation: "spin 0.8s linear infinite" }} /> Generating…</>
                                        ) : "Generate Blueprint"}
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                    <div style={{ background: "var(--gold-dim)", border: "1px solid var(--border-warm)", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "var(--gold-br)", lineHeight: 1.65 }}>{aiPlan.aiNote}</div>
                                    {aiPlan.phases.map((phase, i) => (
                                        <div key={i} style={{ background: "var(--raised)", borderRadius: 10, padding: "12px 14px" }}>
                                            <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 11, letterSpacing: "0.1em", color: "var(--gold)", marginBottom: 8 }}>{phase.name} · {phase.days}d</div>
                                            {phase.tasks.map((t, j) => (
                                                <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 12, color: "var(--soft)" }}>
                                                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--muted)", flexShrink: 0 }} />
                                                    {t}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 4 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 14, letterSpacing: "0.08em", color: "var(--white)", marginBottom: 4 }}>Review & Create</div>
                            {[
                                { label: "Name", value: form.name || "—" },
                                { label: "Room", value: form.room || "—" },
                                { label: "Budget", value: form.budget ? fmtMoney(parseFloat(form.budget)) : "—" },
                                { label: "Timeline", value: form.timeline || "—" },
                                { label: "Style", value: form.style || "—" },
                            ].map((r) => (
                                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{r.label}</span>
                                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--white)" }}>{r.value}</span>
                                </div>
                            ))}
                            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
                                <span style={{ fontSize: 11, color: "var(--muted)" }}>Color</span>
                                <div style={{ marginLeft: "auto", width: 18, height: 18, borderRadius: "50%", background: form.color }} />
                            </div>
                            {aiPlan && <div style={{ textAlign: "center", fontSize: 11, color: "var(--green-br)" }}>✓ AI Blueprint ready — {aiPlan.phases.length} phases generated</div>}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                    {step > 0 && <button id="new-project-back-btn" className="btn-ghost" style={{ flex: 1 }} onClick={back}>← Back</button>}
                    {step < STEPS.length - 1 ? (
                        <button id="new-project-next-btn" className="btn-primary" style={{ flex: 1 }} onClick={next} disabled={step === 0 && !form.name}>
                            {step === 2 ? "Generate Blueprint →" : "Next →"}
                        </button>
                    ) : (
                        <button id="new-project-create-btn" className="btn-primary" style={{ flex: 1 }} onClick={createProject}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                            Create Project
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
