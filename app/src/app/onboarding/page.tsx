"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

export default function OnboardingPage() {
    const router = useRouter();
    const { house, updateProject, addProject } = useStore();
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        address: "",
        city: "",
        state: "TX",
        yearBuilt: 2000,
        sqft: 2000,
        name1: "Leo",
        name2: "Maya",
        rooms: [] as string[],
        goals: [] as string[],
    });

    const totalSteps = 6;

    function next() {
        if (step < totalSteps) setStep(step + 1);
        else finish();
    }

    function back() {
        if (step > 0) setStep(step - 1);
    }

    function finish() {
        // In a real app, we'd save all this to the store
        router.push("/");
    }

    const rooms = ["Kitchen", "Master Bath", "Living Room", "Garage", "Backyard", "Basement", "Attic", "Laundry"];
    const goals = [
        { id: "quick", title: "Quick Fixes", desc: "Small DIY tasks under $500" },
        { id: "reno", title: "Room Renovations", desc: "Full kitchen or bath updates" },
        { id: "systems", title: "Home Systems", desc: "HVAC, roofing, plumbing" },
        { id: "curb", title: "Curb Appeal", desc: "Exterior paint and landscaping" },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "var(--void)", color: "var(--white)", position: "relative", overflow: "hidden" }}>
            {/* Atmosphere */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 70% 55% at 50% -10%, rgba(212,185,120,0.07) 0%, transparent 65%)" }} />
            
            {/* Progress Bar */}
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.05)", zIndex: 100 }}>
                <div style={{ height: "100%", background: "var(--gold)", width: `${(step / totalSteps) * 100}%`, transition: "width 0.5s ease" }} />
            </div>

            <div style={{ position: "relative", zIndex: 1, maxWidth: 520, margin: "0 auto", padding: "80px 24px", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div key="s0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ textAlign: "center" }}>
                            <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 10, letterSpacing: "0.2em", color: "var(--gold)", marginBottom: 16 }}>Welcome to</div>
                            <h1 style={{ fontFamily: "var(--font-cinzel)", fontSize: 32, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 12 }}>FOUNDATION</h1>
                            <p style={{ fontSize: 14, color: "var(--soft)", lineHeight: 1.6, marginBottom: 40 }}>Your home, always under control. Plan every project, track every dollar, remember every decision.</p>
                            <button className="btn-primary" onClick={next} style={{ width: "100%", padding: "16px" }}>Get Started ✦</button>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 10, letterSpacing: "0.15em", color: "var(--gold)", marginBottom: 8 }}>Step 1 of 6</div>
                            <h2 style={{ fontFamily: "var(--font-cinzel)", fontSize: 24, marginBottom: 12 }}>Tell us about your home.</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
                                <div>
                                    <label style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Street Address</label>
                                    <input className="field-input" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="4246 Elmwood Drive" />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div>
                                        <label style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>City</label>
                                        <input className="field-input" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="Austin" />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>State</label>
                                        <input className="field-input" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} placeholder="TX" />
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 12 }}>
                                <button className="btn-ghost" onClick={back} style={{ flex: 1 }}>Back</button>
                                <button className="btn-primary" onClick={next} style={{ flex: 2 }}>Continue</button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 10, letterSpacing: "0.15em", color: "var(--gold)", marginBottom: 8 }}>Step 2 of 6</div>
                            <h2 style={{ fontFamily: "var(--font-cinzel)", fontSize: 24, marginBottom: 12 }}>Who&apos;s on the crew?</h2>
                            <p style={{ fontSize: 13, color: "var(--soft)", marginBottom: 24 }}>Foundation is built for partners. Add your names so tasks and budgets are shared.</p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
                                <div style={{ background: "var(--card)", padding: 16, borderRadius: 14, border: "1px solid var(--border)" }}>
                                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--gold-dim)", color: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, marginBottom: 12 }}>{formData.name1[0] || "L"}</div>
                                    <input className="field-input" value={formData.name1} onChange={e => setFormData({ ...formData, name1: e.target.value })} placeholder="Name 1" />
                                </div>
                                <div style={{ background: "var(--card)", padding: 16, borderRadius: 14, border: "1px solid var(--border)" }}>
                                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--blue-dim)", color: "var(--blue-br)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, marginBottom: 12 }}>{formData.name2[0] || "M"}</div>
                                    <input className="field-input" value={formData.name2} onChange={e => setFormData({ ...formData, name2: e.target.value })} placeholder="Name 2" />
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 12 }}>
                                <button className="btn-ghost" onClick={back} style={{ flex: 1 }}>Back</button>
                                <button className="btn-primary" onClick={next} style={{ flex: 2 }}>Continue</button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 10, letterSpacing: "0.15em", color: "var(--gold)", marginBottom: 8 }}>Step 3 of 6</div>
                            <h2 style={{ fontFamily: "var(--font-cinzel)", fontSize: 24, marginBottom: 12 }}>Map your rooms.</h2>
                            <p style={{ fontSize: 13, color: "var(--soft)", marginBottom: 24 }}>Select the spaces you&apos;ll be working on. This powers your House Memory.</p>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 32 }}>
                                {rooms.map(r => (
                                    <button
                                        key={r}
                                        onClick={() => {
                                            const newRooms = formData.rooms.includes(r) ? formData.rooms.filter(x => x !== r) : [...formData.rooms, r];
                                            setFormData({ ...formData, rooms: newRooms });
                                        }}
                                        style={{
                                            padding: "12px 8px", borderRadius: 12, border: "1px solid",
                                            borderColor: formData.rooms.includes(r) ? "var(--gold)" : "var(--border)",
                                            background: formData.rooms.includes(r) ? "var(--gold-dim)" : "var(--card)",
                                            color: formData.rooms.includes(r) ? "var(--white)" : "var(--soft)",
                                            fontSize: 11, cursor: "pointer", transition: "all 0.15s",
                                        }}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: 12 }}>
                                <button className="btn-ghost" onClick={back} style={{ flex: 1 }}>Back</button>
                                <button className="btn-primary" onClick={next} style={{ flex: 2 }}>Continue</button>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 10, letterSpacing: "0.15em", color: "var(--gold)", marginBottom: 8 }}>Step 4 of 6</div>
                            <h2 style={{ fontFamily: "var(--font-cinzel)", fontSize: 24, marginBottom: 12 }}>What&apos;s your focus?</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
                                {goals.map(g => (
                                    <div
                                        key={g.id}
                                        onClick={() => {
                                            const newGoals = formData.goals.includes(g.id) ? formData.goals.filter(x => x !== g.id) : [...formData.goals, g.id];
                                            setFormData({ ...formData, goals: newGoals });
                                        }}
                                        style={{
                                            padding: 16, borderRadius: 14, border: "1px solid",
                                            borderColor: formData.goals.includes(g.id) ? "var(--gold)" : "var(--border)",
                                            background: formData.goals.includes(g.id) ? "var(--gold-dim)" : "var(--card)",
                                            cursor: "pointer", transition: "all 0.15s",
                                        }}
                                    >
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--white)", marginBottom: 4 }}>{g.title}</div>
                                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{g.desc}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: 12 }}>
                                <button className="btn-ghost" onClick={back} style={{ flex: 1 }}>Back</button>
                                <button className="btn-primary" onClick={next} style={{ flex: 2 }}>Continue</button>
                            </div>
                        </motion.div>
                    )}

                    {step === 5 && (
                        <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ textAlign: "center" }}>
                            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--gold-dim)", border: "1px solid var(--border-warm)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            </div>
                            <h2 style={{ fontFamily: "var(--font-cinzel)", fontSize: 24, marginBottom: 12 }}>You&apos;re ready.</h2>
                            <p style={{ fontSize: 14, color: "var(--soft)", lineHeight: 1.6, marginBottom: 40 }}>Foundation has set up your project workspace, tracked your house memory, and initialized your budget targets.</p>
                            <button className="btn-primary" onClick={finish} style={{ width: "100%", padding: "16px" }}>Enter Foundation</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
