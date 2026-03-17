"use client";

import { useState } from "react";
import { useStore, fmtMoney } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function CalendarPage() {
  const { tasks, projects } = useStore();
  // Start at March 12, 2025 per prototype state
  const [currentDate, setCurrentDate] = useState(new Date(2025, 2, 12)); 
  const [view, setView] = useState<"cal" | "upcoming" | "gantt">("cal");
  const [selectedDay, setSelectedDay] = useState(12);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Filter tasks that belong to this month
  const monthTasks = tasks.filter(t => {
      const parts = t.date.split(" "); // "Mar 12" -> ["Mar", "12"]
      const tMonthStr = parts[0];
      const monthPrefix = MONTHS[month].substring(0, 3);
      return tMonthStr === monthPrefix;
  });

  const dayEvents = monthTasks.filter(t => parseInt(t.date.split(" ")[1]) === selectedDay);

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <header style={{ padding: "28px 32px 20px", borderBottom: "1px solid var(--border)", background: "var(--void)", flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-cinzel)", fontSize: 22, fontWeight: 700, letterSpacing: "0.1em", color: "var(--white)" }}>Schedule</h1>
            <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>Integrated timeline for all renovation phases</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-ghost">Sync Outlook</button>
              <button className="btn-primary">Add Event</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {[
            { id: "cal", label: "Monthly Grid" },
            { id: "upcoming", label: "Agenda Feed" },
            { id: "gantt", label: "Gantt Chart" },
          ].map((t) => (
            <button key={t.id} className={`ftab ${view === t.id ? "active" : ""}`} onClick={() => setView(t.id as "cal" | "upcoming" | "gantt")}>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div style={{ flex: 1, overflow: "hidden", display: "grid", gridTemplateColumns: view === "cal" ? "1fr 340px" : "1fr", gap: 0 }}>
        
        {/* Main Grid Area */}
        <div style={{ borderRight: view === "cal" ? "1px solid var(--border)" : "none", overflowY: "auto", background: "rgba(0,0,0,0.15)" }}>
          {view === "cal" && (
            <div style={{ padding: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, maxWidth: 900, margin: "0 auto 32px" }}>
                <button className="cal-nav-btn" onClick={prevMonth}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <div style={{ textAlign: "center" }}>
                  <h2 style={{ fontFamily: "var(--font-cinzel)", fontSize: 24, fontWeight: 700, color: "var(--white)", letterSpacing: "0.1em" }}>{MONTHS[month].toUpperCase()}</h2>
                  <div style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.2em", marginTop: 4 }}>{year}</div>
                </div>
                <button className="cal-nav-btn" onClick={nextMonth}>
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", maxWidth: 900, margin: "0 auto" }}>
                {DAYS.map(d => (
                  <div key={d} style={{ background: "var(--base)", fontSize: 10, fontWeight: 700, color: "var(--muted)", textAlign: "center", padding: "14px 0", textTransform: "uppercase", letterSpacing: "0.15em" }}>{d}</div>
                ))}
                
                {/* Previous month filler */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`prev-${i}`} style={{ background: "var(--void)", opacity: 0.15, padding: 12, height: 110 }}>
                    <span style={{ fontSize: 12, color: "var(--soft)" }}>{prevMonthDays - firstDay + i + 1}</span>
                  </div>
                ))}

                {/* Days of current month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const d = i + 1;
                  const isToday = d === 12 && month === 2 && year === 2025;
                  const isSelected = d === selectedDay;
                  const dayTasks = monthTasks.filter(t => parseInt(t.date.split(" ")[1]) === d);

                  return (
                    <div 
                      key={d} 
                      onClick={() => setSelectedDay(d)}
                      className={`cal-cell ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
                      style={{ 
                        padding: 12, height: 110, cursor: "pointer", 
                        background: isSelected ? "var(--gold-dim)" : "var(--card)",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <span style={{ 
                          fontSize: 14, fontWeight: isToday ? 700 : 500, 
                          color: isToday ? "var(--void)" : isSelected ? "var(--gold)" : "var(--white)",
                          background: isToday ? "var(--gold)" : "transparent",
                          width: 26, height: 26, borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}>{d}</span>
                        {dayTasks.length > 0 && <span style={{ fontSize: 9, color: "var(--soft)" }}>{dayTasks.length} events</span>}
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 8 }}>
                        {dayTasks.slice(0, 3).map(t => (
                          <div key={t.id} style={{ 
                            height: 14, borderRadius: 4, background: t.projColor, padding: "0 6px",
                            fontSize: 8, fontWeight: 700, color: "rgba(0,0,0,0.8)", overflow: "hidden", 
                            textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "uppercase"
                          }}>
                            {t.name}
                          </div>
                        ))}
                        {dayTasks.length > 3 && <div style={{ fontSize: 8, color: "var(--muted)", paddingLeft: 4 }}>+ {dayTasks.length - 3} more</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === "upcoming" && (
            <div style={{ padding: "32px", maxWidth: 800, margin: "0 auto" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {monthTasks.sort((a,b) => parseInt(a.date.split(" ")[1]) - parseInt(b.date.split(" ")[1])).map(t => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={t.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "18px 24px", display: "flex", gap: 24, alignItems: "center" }}>
                    <div style={{ textAlign: "center", minWidth: 50 }}>
                      <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 24, fontWeight: 700, color: "var(--white)" }}>{t.date.split(" ")[1]}</div>
                      <div style={{ fontSize: 10, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{t.date.split(" ")[0]}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--white)", marginBottom: 4 }}>{t.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "20%", background: t.projColor }} />
                          <span style={{ fontSize: 12, color: "var(--soft)" }}>{projects.find(p => p.id === t.proj)?.name}</span>
                          <span style={{ color: "var(--border)", fontSize: 12 }}>|</span>
                          <span style={{ fontSize: 12, color: "var(--muted)" }}>Owner: {t.who}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--white)" }}>{t.dur}</div>
                      <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", marginTop: 2 }}>ESTIMATED DUR</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {view === "gantt" && (
             <div style={{ padding: "32px" }}>
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "32px", overflowX: "auto" }}>
                  <div style={{ minWidth: 800 }}>
                    <div style={{ display: "flex", marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
                        <div style={{ width: 180, fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Project Name</div>
                        <div style={{ flex: 1, display: "flex", position: "relative" }}>
                            {Array.from({ length: 31 }).map((_, i) => (
                                <div key={i} style={{ flex: 1, fontSize: 9, color: "var(--muted)", textAlign: "center", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>{i + 1}</div>
                            ))}
                        </div>
                    </div>
                    {projects.map((p, index) => {
                        const start = 5 + ((index * 13) % 15);
                        const width = 30 + ((index * 27) % 50); 
                        return (
                            <div key={p.id} style={{ display: "flex", padding: "14px 0", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                                <div style={{ width: 180, display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 4, height: 16, background: p.color, borderRadius: 2 }} />
                                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--white)" }}>{p.name}</span>
                                </div>
                                <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", height: 20, borderRadius: 10, position: "relative" }}>
                                    <div className="animate-fade-in" style={{ position: "absolute", left: `${start}%`, width: `${width}%`, height: "100%", background: p.color, borderRadius: 10, opacity: 0.8, boxShadow: `0 0 15px ${p.color}40`, display: "flex", alignItems: "center", padding: "0 10px" }}>
                                        <span style={{ fontSize: 8, fontWeight: 800, color: "rgba(0,0,0,0.6)", textTransform: "uppercase" }}>{p.status}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                  </div>
                </div>
             </div>
          )}
        </div>

        {/* Right Rail - Daily List */}
        {view === "cal" && (
          <aside style={{ background: "var(--base)", borderLeft: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "28px 24px", borderBottom: "1px solid var(--border)", background: "var(--void)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 16, fontWeight: 700, color: "var(--gold)", letterSpacing: "0.05em" }}>MARCH {selectedDay}</div>
                    <button className="icon-btn" style={{ width: 28, height: 28 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg></button>
                </div>
                <div style={{ fontSize: 11, color: "var(--soft)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Renovation Schedule</div>
            </div>
            
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 0" }}>
                <AnimatePresence mode="wait">
                    {dayEvents.length > 0 ? (
                        <motion.div key={selectedDay} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                            {dayEvents.map(e => (
                                <div key={e.id} style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", position: "relative", transition: "all 0.2s" }} className="task-row-hover">
                                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: e.projColor }} />
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--white)" }}>{e.name}</span>
                                        <span style={{ fontSize: 10, fontWeight: 600, color: "var(--gold)" }}>{e.dur}</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: "var(--soft)", display: "flex", alignItems: "center", gap: 6 }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                        Assigned: {e.who}
                                    </div>
                                    <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
                                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: e.projColor }} />
                                        {projects.find(p => p.id === e.proj)?.name}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <div style={{ padding: "80px 32px", textAlign: "center", opacity: 0.5 }}>
                            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--raised)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 10h18M7 10V4M17 10V4M12 18h10"/></svg>
                            </div>
                            <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 14, color: "var(--white)", marginBottom: 8 }}>Rest Day</div>
                            <div style={{ fontSize: 12, color: "var(--muted)" }}>No tasks scheduled for this date. Time to visit the showroom?</div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <div style={{ padding: "24px", borderTop: "1px solid var(--border)", background: "var(--void)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 16 }}>Project Coloring</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {projects.map(p => (
                        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 3, background: p.color, boxShadow: `0 0 8px ${p.color}40` }} />
                            <span style={{ fontSize: 12, color: "var(--soft)", fontWeight: 500 }}>{p.name}</span>
                            <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: "var(--muted)" }}>{tasks.filter(t => t.proj === p.id).length} T</span>
                        </div>
                    ))}
                </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
