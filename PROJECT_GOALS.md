# PROJECT_GOALS.md

## 1. Project Overview
**Project Name:** Foundation (by Ascension)  
**One-Liner:** A collaborative home improvement planning app for couples to plan, track, and execute renovation projects together.

**Target User:** Homeowning couples who are planning or currently managing property renovations (from minor repairs to major remodels).  

**Core Problem:** Renovation projects are notoriously complex and stressful for couples, often suffering from fragmented communication, hidden costs, and misaligned tasks across multiple tools (Slack, notes, spreadsheets, store apps).

---

## 2. Core Value Proposition
Couples can finally stop arguing about renovation details and execute projects together with a single source of truth for tasks, budget, and materials.

> “Users can instantly see the status of every project, track every dollar spent, and use AI to generate blueprints for complex tasks.”

---

## 3. Primary User Flow (THE MOST IMPORTANT SECTION)

Define the ONE core loop that makes this app valuable.

### Core Flow:
1. **User does** → Creates or selects a renovation project (e.g., "Master Bath Remodel").
2. **System processes** → Generates an AI-powered blueprint (task list), budget tracker, and material list with real-time sync between partners.
3. **System returns** → A step-by-step execution roadmap with live progress tracking and shared financial oversight.
4. **User takes action** → Completes tasks, logs expenses, and buys materials while staying perfectly aligned with their partner.

---

## 4. MVP Scope (What MUST exist)

List ONLY what is required for MVP:

- [x] **Real-time Sync:** Shared house profile where two partners see the same live data (tasks, budget, materials).
- [x] **AI Blueprints:** Multi-step project generator using Google Gemini to create phases and tasks.
- [x] **Project Dashboard:** Central "Command" view showing overall progress and key stats.
- [x] **Task Tracking:** The "Blueprint" view for sequencing and checking off DIY/Pro tasks.
- [x] **Budgeting:** Logging expenses against a set budget with category breakdowns.
- [x] **Materials List:** Shopping list organized by store with priority levels and direct links.
- [x] **AI Brainstorm:** Context-aware chat assistant for project advice and note-taking.

---

## 5. Out of Scope (For Now)

Explicitly define what is NOT part of MVP:

- ❌ **House Memory:** Long-term per-room history, product logs, and warranty tracking.
- ❌ **Calendar Sync:** Integration with Google Calendar or advanced Gantt charts.
- ❌ **Photo Management:** Before/after photo logs and media storage.
- ❌ **Pro Marketplace:** Direct integration or matching with external contractors.
- ❌ **Live Retail APIs:** Real-time stock checking at Home Depot/Lowes (static links for now).

---

## 6. Success Criteria

How do we know this is working?

- [ ] A couple can link accounts and see real-time updates when a task is checked.
- [ ] A user can generate a full project blueprint from a single text prompt using Gemini.
- [ ] The app matches the `foundation-final.html` prototype pixel-for-pixel in dark mode.
- [ ] Budget and material totals stay accurate across all views (Dashboard/Budget/Materials).

---

## 7. Known Assumptions

- Couples share a single "House Profile" entity.
- Users are comfortable using AI to generate the initial project scope.
- The primary usage model is mobile-first, even when viewed on desktop.
- Gemini 1.5 Flash is sufficient for generating high-quality blueprints.

---

## 8. Risks

- **Sync Conflicts:** Concurrent edits to the same task or expense (Supabase real-time is required).
- **AI Hallucinations:** AI might generate unrealistic task durations or costs.
- **Complex Hierarchies:** Managing dependencies between tasks across multiple active projects.
- **Dependency on Gemini:** Changes to Gemini API availability or performance.

---

## 9. Notes for AI Agents

- **Focus on the core flow above all else:** Building the project, tracking tasks, and logging money.
- **Strict Design Adherence:** Match `foundation-final.html` exactly — do NOT take creative liberties.
- **Real-time is Critical:** Any change (task, expense, material) must broadcast to the partner immediately.
- **Performance:** Keep the dark theme transitions smooth (0.32s) as per the prototype spec.
