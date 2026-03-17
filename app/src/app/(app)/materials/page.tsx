"use client";

import { useState } from "react";
import { useStore, fmtMoney } from "@/lib/store";
import type { MaterialPriority, MaterialSource } from "@/lib/types";

const PRIORITY_STYLES: Record<MaterialPriority, { label: string; color: string; bg: string }> = {
    urgent: { label: "Urgent", color: "var(--red-br)", bg: "var(--red-dim)" },
    needed: { label: "Needed", color: "var(--amber)", bg: "var(--amber-dim)" },
    planned: { label: "Planned", color: "var(--blue-br)", bg: "var(--blue-dim)" },
    optional: { label: "Optional", color: "var(--muted)", bg: "var(--raised)" },
};

const SOURCE_LABELS: Record<MaterialSource, string> = {
    amazon: "Amazon",
    hd: "Home Depot",
    lowes: "Lowe's",
    local: "Local",
    other: "Other",
};

export default function MaterialsPage() {
    const { materials, projects } = useStore();
    const toggleMaterial = useStore((s) => s.toggleMaterial);
    const addMaterial = useStore((s) => s.addMaterial);
    const [filter, setFilter] = useState<"all" | MaterialPriority>("all");
    const [source, setSource] = useState<"all" | MaterialSource>("all");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: "", price: "", qty: "", proj: "", source: "amazon" as MaterialSource, priority: "needed" as MaterialPriority, by: "", note: "" });

    const filtered = materials.filter((m) => {
        const matchPriority = filter === "all" || m.priority === filter;
        const matchSource = source === "all" || m.source === source;
        return matchPriority && matchSource;
    });

    const pending = materials.filter((m) => !m.done);
    const totalPending = pending.reduce((a, m) => a + m.price, 0);

    function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        if (!form.name || !form.price) return;
        addMaterial({
            id: Date.now(), name: form.name, price: parseFloat(form.price), qty: form.qty,
            proj: form.proj, source: form.source, priority: form.priority,
            by: form.by, note: form.note, done: false,
        });
        setForm({ name: "", price: "", qty: "", proj: "", source: "amazon", priority: "needed", by: "", note: "" });
        setShowForm(false);
    }

    return (
        <div style={{ flex: 1, overflowY: "auto" }}>
            <header style={{ padding: "28px 32px 20px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 30, background: "var(--void)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                        <h1 style={{ fontFamily: "var(--font-cinzel)", fontSize: 22, fontWeight: 700, letterSpacing: "0.1em", color: "var(--white)" }}>Materials</h1>
                        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{pending.length} items pending · {fmtMoney(totalPending)} to order</p>
                    </div>
                    <button id="materials-add-btn" className="btn-primary" onClick={() => setShowForm(!showForm)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Add Item
                    </button>
                </div>

                {/* Filters */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button className={`ftab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
                    {(Object.keys(PRIORITY_STYLES) as MaterialPriority[]).map((p) => (
                        <button key={p} id={`materials-filter-${p}`} className={`ftab ${filter === p ? "active" : ""}`}
                            style={{ borderColor: filter === p ? PRIORITY_STYLES[p].color : undefined, color: filter === p ? PRIORITY_STYLES[p].color : undefined }}
                            onClick={() => setFilter(p)}>
                            {PRIORITY_STYLES[p].label}
                        </button>
                    ))}
                    <div style={{ width: 1, background: "var(--border)", margin: "4px 4px" }} />
                    <button className={`ftab ${source === "all" ? "active" : ""}`} onClick={() => setSource("all")}>All Stores</button>
                    {(Object.keys(SOURCE_LABELS) as MaterialSource[]).map((s) => (
                        <button key={s} id={`materials-source-${s}`} className={`ftab ${source === s ? "active" : ""}`} onClick={() => setSource(s)}>
                            {SOURCE_LABELS[s]}
                        </button>
                    ))}
                </div>
            </header>

            <div style={{ padding: "24px 32px" }}>
                {/* Add form */}
                {showForm && (
                    <form onSubmit={handleAdd} style={{ background: "var(--card)", border: "1px solid var(--border-warm)", borderRadius: "var(--r)", padding: "18px 20px", marginBottom: 20 }}>
                        <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 12, letterSpacing: "0.1em", color: "var(--gold)", marginBottom: 14 }}>Add Material</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                            {[
                                { id: "materials-name", placeholder: "Item name", key: "name", col: "1/-1" },
                                { id: "materials-price", placeholder: "Price ($)", key: "price", type: "number" },
                                { id: "materials-qty", placeholder: "Quantity", key: "qty" },
                                { id: "materials-by", placeholder: "Need by (e.g. Mar 20)", key: "by" },
                                { id: "materials-note", placeholder: "Note", key: "note" },
                            ].map((f) => (
                                <input key={f.key} id={f.id} required={f.key === "name"} type={f.type} placeholder={f.placeholder}
                                    value={(form as Record<string, string>)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                    style={{ gridColumn: (f as { col?: string }).col, background: "var(--raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontFamily: "var(--font-dm)", fontSize: 13, color: "var(--white)", outline: "none" }} />
                            ))}
                            <select id="materials-source-select" value={form.source} onChange={e => setForm({ ...form, source: e.target.value as MaterialSource })}
                                style={{ background: "var(--raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontFamily: "var(--font-dm)", fontSize: 13, color: "var(--white)", outline: "none" }}>
                                {(Object.entries(SOURCE_LABELS)).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                            <select id="materials-priority-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as MaterialPriority })}
                                style={{ background: "var(--raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontFamily: "var(--font-dm)", fontSize: 13, color: "var(--white)", outline: "none" }}>
                                {(Object.keys(PRIORITY_STYLES) as MaterialPriority[]).map(p => <option key={p} value={p}>{PRIORITY_STYLES[p].label}</option>)}
                            </select>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button type="submit" className="btn-primary" style={{ flex: 1 }}>Add Material</button>
                            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                )}

                {/* Materials list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {filtered.map((m) => {
                        const ps = PRIORITY_STYLES[m.priority];
                        const proj = projects.find(p => p.id === m.proj);
                        return (
                            <div key={m.id} style={{
                                background: "var(--card)",
                                border: `1px solid ${m.done ? "var(--border)" : m.priority === "urgent" ? "rgba(204,136,136,0.2)" : "var(--border)"}`,
                                borderRadius: "var(--r)",
                                padding: "14px 16px",
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                                opacity: m.done ? 0.55 : 1,
                                transition: "all 0.2s",
                            }}>
                                {/* Checkbox */}
                                <button
                                    id={`materials-toggle-${m.id}`}
                                    onClick={() => toggleMaterial(m.id)}
                                    style={{
                                        width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                                        border: m.done ? "none" : "1.5px solid var(--border)",
                                        background: m.done ? "var(--green-dim)" : "transparent",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        cursor: "pointer", transition: "all 0.15s",
                                    }}
                                    aria-label={`Mark ${m.name} ${m.done ? "unordered" : "ordered"}`}
                                >
                                    {m.done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--green-br)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                                </button>

                                {/* Dot */}
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: ps.color, flexShrink: 0 }} />

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, color: m.done ? "var(--muted)" : "var(--white)", fontWeight: 500, textDecoration: m.done ? "line-through" : undefined, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                                    <div style={{ display: "flex", gap: 10, marginTop: 3, fontSize: 10, color: "var(--muted)" }}>
                                        {proj && <><span style={{ width: 5, height: 5, borderRadius: "50%", background: proj.color, display: "inline-block" }} /> {proj.name} ·</>}
                                        <span>{m.qty}</span>
                                        {m.by && <span>· By {m.by}</span>}
                                        {m.note && <span>· {m.note}</span>}
                                    </div>
                                </div>

                                {/* Source badge */}
                                <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", padding: "2px 8px", borderRadius: 20, background: "var(--raised)", color: "var(--soft)", flexShrink: 0 }}>
                                    {SOURCE_LABELS[m.source]}
                                </span>

                                {/* Priority badge */}
                                <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", padding: "2px 8px", borderRadius: 20, background: ps.bg, color: ps.color, flexShrink: 0 }}>
                                    {ps.label}
                                </span>

                                {/* Price & Order */}
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                                    <span style={{ fontFamily: "var(--font-cinzel)", fontSize: 14, fontWeight: 700, color: m.done ? "var(--muted)" : "var(--white)" }}>{fmtMoney(m.price)}</span>
                                    {!m.done && (
                                        <a 
                                            href={m.source === "amazon" ? `https://www.amazon.com/s?k=${encodeURIComponent(m.name)}` : `https://www.homedepot.com/s/${encodeURIComponent(m.name)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="order-link"
                                        >
                                            Order Now
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="empty-state" style={{ marginTop: 40 }}>
                        <div style={{ fontSize: 40, opacity: 0.3 }}>📦</div>
                        <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 14, color: "var(--white)" }}>No materials found</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>Add materials to track your shopping list.</div>
                    </div>
                )}
            </div>
        </div>
    );
}
