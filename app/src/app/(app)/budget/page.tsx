"use client";

import { useState } from "react";
import { useStore, fmtMoney } from "@/lib/store";
import type { ExpenseCategory } from "@/lib/types";

const CATS: { label: string; value: ExpenseCategory; color: string }[] = [
    { label: "Materials", value: "materials", color: "var(--gold)" },
    { label: "Labor", value: "labor", color: "var(--purple)" },
    { label: "Tools", value: "tools", color: "var(--blue-br)" },
    { label: "Fixtures", value: "fixtures", color: "var(--green-br)" },
    { label: "Permits", value: "permits", color: "var(--amber)" },
    { label: "Other", value: "other", color: "var(--soft)" },
];

export default function BudgetPage() {
    const { projects, expenses } = useStore();
    const addExpense = useStore((s) => s.addExpense);
    const [selectedProj, setSelectedProj] = useState("all");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ desc: "", amount: "", cat: "materials" as ExpenseCategory, who: "Leo", projId: "" });

    const filteredExpenses = selectedProj === "all"
        ? expenses
        : expenses.filter((e) => e.projId === selectedProj);

    const totalBudget = projects.reduce((a, p) => a + p.budget, 0);
    const totalSpent = projects.reduce((a, p) => a + p.spent, 0);
    const pct = Math.min(Math.round((totalSpent / totalBudget) * 100), 100);

    function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        if (!form.desc || !form.amount) return;
        addExpense({
            id: Date.now(),
            desc: form.desc,
            amount: parseFloat(form.amount),
            cat: form.cat,
            who: form.who,
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            projId: form.projId || undefined,
        });
        setForm({ desc: "", amount: "", cat: "materials", who: "Leo", projId: "" });
        setShowForm(false);
    }

    return (
        <div style={{ flex: 1, overflowY: "auto" }}>
            <header style={{ padding: "28px 32px 20px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 30, background: "var(--void)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                        <h1 style={{ fontFamily: "var(--font-cinzel)", fontSize: 22, fontWeight: 700, letterSpacing: "0.1em", color: "var(--white)" }}>Budget</h1>
                        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{expenses.length} expenses logged</p>
                    </div>
                    <button id="budget-add-expense-btn" className="btn-primary" onClick={() => setShowForm(!showForm)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Log Expense
                    </button>
                </div>

                {/* Project filter */}
                <div style={{ display: "flex", gap: 6 }}>
                    <button className={`ftab ${selectedProj === "all" ? "active" : ""}`} onClick={() => setSelectedProj("all")}>All Projects</button>
                    {projects.map((p) => (
                        <button key={p.id} id={`budget-filter-${p.id}`} className={`ftab ${selectedProj === p.id ? "active" : ""}`} onClick={() => setSelectedProj(p.id)}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, display: "inline-block", marginRight: 4 }} />
                            {p.name}
                        </button>
                    ))}
                </div>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, padding: "24px 32px" }}>
                {/* Left — expense log */}
                <div>
                    {/* Add form */}
                    {showForm && (
                        <form onSubmit={handleAdd} style={{ background: "var(--card)", border: "1px solid var(--border-warm)", borderRadius: "var(--r)", padding: "18px 20px", marginBottom: 20 }}>
                            <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 12, letterSpacing: "0.1em", color: "var(--gold)", marginBottom: 14 }}>Log Expense</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                                <input id="budget-expense-desc" required placeholder="Description" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })}
                                    style={{ gridColumn: "1/-1", background: "var(--raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontFamily: "var(--font-dm)", fontSize: 13, color: "var(--white)", outline: "none" }} />
                                <input id="budget-expense-amount" required type="number" placeholder="Amount ($)" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                                    style={{ background: "var(--raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontFamily: "var(--font-dm)", fontSize: 13, color: "var(--white)", outline: "none" }} />
                                <select id="budget-expense-cat" value={form.cat} onChange={e => setForm({ ...form, cat: e.target.value as ExpenseCategory })}
                                    style={{ background: "var(--raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontFamily: "var(--font-dm)", fontSize: 13, color: "var(--white)", outline: "none" }}>
                                    {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                                <select id="budget-expense-proj" value={form.projId} onChange={e => setForm({ ...form, projId: e.target.value })}
                                    style={{ background: "var(--raised)", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontFamily: "var(--font-dm)", fontSize: 13, color: "var(--white)", outline: "none" }}>
                                    <option value="">— Project (optional)</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Expense</button>
                                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </form>
                    )}

                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", overflow: "hidden" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 0, padding: "10px 18px", borderBottom: "1px solid var(--border)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)" }}>
                            <span>Description</span>
                            <span>Category</span>
                            <span style={{ textAlign: "right", minWidth: 80 }}>Who</span>
                            <span style={{ textAlign: "right", minWidth: 80 }}>Amount</span>
                        </div>
                        {filteredExpenses.length === 0 ? (
                            <div className="empty-state">
                                <div style={{ fontSize: 36, opacity: 0.3 }}>💰</div>
                                <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 14, color: "var(--white)" }}>No expenses yet</div>
                                <div style={{ fontSize: 12, color: "var(--muted)" }}>Log your first expense above.</div>
                            </div>
                        ) : filteredExpenses.map((e, i) => {
                            const cat = CATS.find(c => c.value === e.cat);
                            return (
                                <div key={e.id} style={{
                                    display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 16, padding: "12px 18px",
                                    borderBottom: i < filteredExpenses.length - 1 ? "1px solid var(--border)" : undefined,
                                    transition: "background 0.15s",
                                    alignItems: "center",
                                }}
                                    onMouseOver={ev => (ev.currentTarget.style.background = "rgba(255,255,255,0.015)")}
                                    onMouseOut={ev => (ev.currentTarget.style.background = "")}
                                >
                                    <div>
                                        <div style={{ fontSize: 13, color: "var(--white)", fontWeight: 500 }}>{e.desc}</div>
                                        <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{e.date}</div>
                                    </div>
                                    <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 20, background: "var(--raised)", color: cat?.color || "var(--soft)" }}>
                                        {cat?.label}
                                    </span>
                                    <span style={{ fontSize: 11, color: "var(--soft)", minWidth: 80, textAlign: "right" }}>{e.who}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--white)", minWidth: 80, textAlign: "right" }}>{fmtMoney(e.amount)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right — budget ring + per-project */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Overall ring */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "18px" }}>
                        <span className="sec-title" style={{ display: "block", marginBottom: 14 }}>Overall Budget</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                            <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                                <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
                                    <circle cx="40" cy="40" r="32" fill="none" stroke="var(--raised)" strokeWidth="8" />
                                    <circle cx="40" cy="40" r="32" fill="none" stroke={pct > 80 ? "var(--amber)" : "var(--gold)"}
                                        strokeWidth="8" strokeDasharray={`${2 * Math.PI * 32}`}
                                        strokeDashoffset={`${2 * Math.PI * 32 * (1 - pct / 100)}`}
                                        strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
                                </svg>
                                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                    <span style={{ fontFamily: "var(--font-cinzel)", fontSize: 16, fontWeight: 700, color: "var(--white)" }}>{pct}%</span>
                                    <span style={{ fontSize: 8, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>used</span>
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {[
                                    { label: "Total Budget", value: fmtMoney(totalBudget), color: "var(--white)" },
                                    { label: "Total Spent", value: fmtMoney(totalSpent), color: pct > 80 ? "var(--amber)" : "var(--green-br)" },
                                    { label: "Remaining", value: fmtMoney(totalBudget - totalSpent), color: "var(--green-br)" },
                                ].map(r => (
                                    <div key={r.label} style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                                        <span style={{ fontSize: 11, color: "var(--muted)" }}>{r.label}</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: r.color }}>{r.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Per-project bars */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {projects.map((p) => {
                                const ppct = Math.min(Math.round((p.spent / p.budget) * 100), 100);
                                return (
                                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                                        <span style={{ fontSize: 11, color: "var(--soft)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                                        <div className="prog-track" style={{ width: 80 }}>
                                            <div className="prog-fill" style={{ width: `${ppct}%`, background: ppct > 80 ? "var(--amber)" : p.color }} />
                                        </div>
                                        <span style={{ fontSize: 11, color: "var(--white)", fontWeight: 500, minWidth: 40, textAlign: "right" }}>{fmtMoney(p.spent)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Category breakdown */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "14px 16px" }}>
                        <span className="sec-title" style={{ display: "block", marginBottom: 12 }}>By Category</span>
                        {CATS.map((cat) => {
                            const total = filteredExpenses.filter(e => e.cat === cat.value).reduce((a, e) => a + e.amount, 0);
                            if (total === 0) return null;
                            return (
                                <div key={cat.value} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: cat.color }} />
                                        <span style={{ fontSize: 11, color: "var(--soft)" }}>{cat.label}</span>
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--white)" }}>{fmtMoney(total)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
