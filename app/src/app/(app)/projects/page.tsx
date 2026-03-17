"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore, fmtMoney } from "@/lib/store";
import type { ProjectStatus } from "@/lib/types";

const STATUS_FILTERS: { label: string; value: "all" | ProjectStatus }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Planning", value: "planning" },
    { label: "Paused", value: "paused" },
    { label: "Done", value: "done" },
];

const ROOM_ICONS: Record<string, React.ReactNode> = {
    Kitchen: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11V3h8v8H3zM13 11V3h8v8h-8zM3 21v-6h8v6H3z" /><path d="M18 21v-6M15 18h6" /></svg>,
    "Master Bath": <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 8H4a2 2 0 0 0-2 2v6a6 6 0 0 0 12 0v-1" /><path d="M9 8V5a2 2 0 0 1 2-2 2 2 0 0 1 2 2v3" /><line x1="12" y1="8" x2="22" y2="8" /></svg>,
    Backyard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12m0 0c0-5.5-4-7-4-7s.5 3.5 4 7zm0 0c0-5.5 4-7 4-7s-.5 3.5-4 7z" /><path d="M5 22h14" /></svg>,
};

function ProjectIcon({ room }: { room: string }) {
    return ROOM_ICONS[room] || (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    );
}

export default function ProjectsPage() {
    const { projects, tasks } = useStore();
    const [filter, setFilter] = useState<"all" | ProjectStatus>("all");
    const [search, setSearch] = useState("");

    const filtered = projects.filter((p) => {
        const matchFilter = filter === "all" || p.status === filter;
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.room.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const totalBudget = projects.reduce((a, p) => a + p.budget, 0);
    const totalSpent = projects.reduce((a, p) => a + p.spent, 0);
    const totalTasks = projects.reduce((a, p) => a + p.tasksTotal, 0);
    const doneTasks = projects.reduce((a, p) => a + p.tasksDone, 0);

    return (
        <div style={{ flex: 1, overflowY: "auto" }}>
            {/* Header */}
            <header style={{
                padding: "28px 32px 20px",
                borderBottom: "1px solid var(--border)",
                position: "sticky",
                top: 0,
                zIndex: 30,
                background: "var(--void)",
            }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                        <h1 style={{ fontFamily: "var(--font-cinzel)", fontSize: 22, fontWeight: 700, letterSpacing: "0.1em", color: "var(--white)" }}>Projects</h1>
                        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{projects.length} projects · {projects.filter(p => p.status === "active").length} active</p>
                    </div>
                    <Link href="/new-project" className="btn-primary" id="projects-new-btn">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        New Project
                    </Link>
                </div>

                {/* House summary bar */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
                    {[
                        { label: "Projects", value: projects.length },
                        { label: "Budget", value: fmtMoney(totalBudget) },
                        { label: "Spent", value: fmtMoney(totalSpent) },
                        { label: "Tasks Done", value: `${doneTasks}/${totalTasks}` },
                    ].map((s, i) => (
                        <div key={i} style={{ padding: "10px 12px", textAlign: "center", borderRight: i < 3 ? "1px solid var(--border)" : undefined }}>
                            <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 16, fontWeight: 600, color: "var(--white)" }}>{s.value}</div>
                            <div style={{ fontSize: 8, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Search + filters */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "var(--raised)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 12px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        <input
                            id="projects-search"
                            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "var(--font-dm)", fontSize: 13, color: "var(--white)" }}
                            placeholder="Search projects…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                        {STATUS_FILTERS.map((f) => (
                            <button
                                key={f.value}
                                id={`projects-filter-${f.value}`}
                                className={`ftab ${filter === f.value ? "active" : ""}`}
                                onClick={() => setFilter(f.value)}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Project grid */}
            <div style={{ padding: "24px 32px" }}>
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <div style={{ fontSize: 48, opacity: 0.3 }}>🏗️</div>
                        <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 16, letterSpacing: "0.1em", color: "var(--white)" }}>No projects found</div>
                        <div style={{ fontSize: 12, color: "var(--muted)", maxWidth: 240, lineHeight: 1.5 }}>Try adjusting your filters or start a new project.</div>
                        <Link href="/new-project" className="btn-primary" style={{ marginTop: 8 }}>Start a Project</Link>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
                        {filtered.map((p, idx) => {
                            const projTasks = tasks.filter((t) => t.proj === p.id);
                            const icon = <ProjectIcon room={p.room} />;
                            return (
                                <Link key={p.id} href={`/projects/${p.id}`} style={{ textDecoration: "none" }}>
                                    <article
                                        className="animate-fade-up"
                                        style={{
                                            background: "var(--card)",
                                            border: "1px solid var(--border)",
                                            borderRadius: "var(--r)",
                                            overflow: "hidden",
                                            cursor: "pointer",
                                            transition: "all 0.22s",
                                            animationDelay: `${idx * 0.06}s`,
                                        }}
                                        onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border-warm)"; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)"; }}
                                        onMouseOut={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border)"; el.style.transform = ""; el.style.boxShadow = ""; }}
                                    >
                                        <div style={{ height: 6, background: p.color }} />
                                        <div style={{ padding: "18px 20px 14px" }}>
                                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                                                <div style={{ display: "flex", gap: 12 }}>
                                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${p.color}20`, border: `1px solid ${p.color}40`, display: "flex", alignItems: "center", justifyContent: "center", color: p.color, flexShrink: 0 }}>
                                                        {icon}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 14, fontWeight: 600, letterSpacing: "0.07em", color: "var(--white)", marginBottom: 4 }}>{p.name}</div>
                                                        <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{p.room}</div>
                                                    </div>
                                                </div>
                                                <span className={`status-pill sp-${p.status}`}>{p.status}</span>
                                            </div>

                                            {/* Progress */}
                                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                                                <span style={{ fontFamily: "var(--font-cinzel)", fontSize: 12, color: p.color, minWidth: 36 }}>{p.progress}%</span>
                                                <div className="prog-track" style={{ flex: 1 }}>
                                                    <div className="prog-fill" style={{ width: `${p.progress}%`, background: p.color }} />
                                                </div>
                                            </div>

                                            {/* Stats row */}
                                            <div style={{ display: "flex", gap: 20, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--white)" }}>{p.tasksDone}/{p.tasksTotal}</div>
                                                    <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Tasks</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--white)" }}>{fmtMoney(p.budget)}</div>
                                                    <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Budget</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: p.spent > p.budget * 0.8 ? "var(--amber)" : "var(--white)" }}>{fmtMoney(p.spent)}</div>
                                                    <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Spent</div>
                                                </div>
                                                {p.daysLeft !== null && (
                                                    <div>
                                                        <div style={{ fontSize: 13, fontWeight: 600, color: p.daysLeft < 7 ? "var(--amber)" : "var(--white)" }}>{p.daysLeft}d</div>
                                                        <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Left</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {p.nextTask && (
                                            <div style={{ padding: "10px 20px", background: "rgba(0,0,0,0.2)", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                                                    <span style={{ fontSize: 11, color: "var(--white)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nextTask}</span>
                                                </div>
                                                {p.nextDate && <span style={{ fontSize: 10, color: "var(--soft)", flexShrink: 0 }}>{p.nextDate}</span>}
                                            </div>
                                        )}
                                    </article>
                                </Link>
                            );
                        })}

                        {/* Add Project card */}
                        <Link href="/new-project" style={{ textDecoration: "none" }}>
                            <div style={{
                                background: "transparent",
                                border: "1px dashed rgba(212,185,120,0.2)",
                                borderRadius: "var(--r)",
                                minHeight: 200,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 12,
                                cursor: "pointer",
                                transition: "border-color 0.18s",
                            }}
                                onMouseOver={e => (e.currentTarget.style.borderColor = "var(--gold)")}
                                onMouseOut={e => (e.currentTarget.style.borderColor = "rgba(212,185,120,0.2)")}
                            >
                                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--gold-dim)", border: "1px solid var(--border-warm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                </div>
                                <span style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", lineHeight: 1.5 }}>Start a new project</span>
                            </div>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
