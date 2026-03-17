# Foundation — Screen Specifications

Each screen has a matching prototype file in `screens/`. The prototype is the
source of truth for layout and visual design. This document specifies the
behavior, data requirements, and interactions for each screen.

---

## 1. Onboarding (`/onboarding`) — `foundation-onboarding.html`

**Purpose:** First-run wizard. Collects house profile + couple setup.

**Steps:**
1. **Splash** — Logo, tagline, Begin button
2. **House Profile** — Address, city, year built, sqft, style selector
3. **Couple Setup** — Both partner names, DIY level selector (4 options each)
4. **Room Map** — Grid of 18 room types, tap to toggle (multi-select)
5. **Goal Style** — 6 style cards (Practical First / Design Forward / Budget Conscious / Resale Value / Weekend Warrior / All-In), single select
6. **First Project** — Optional: pick room, name the first project
7. **Complete** — Summary card with house score, "Enter Foundation" button

**Interactions:**
- `nextStep()` — advance, validate required fields first
- `prevStep()` — go back
- `toggleRoom(room)` — add/remove room from selection
- `toggleGoal(goal)` — select one goal style
- `validateStep1()` — address and city required
- `selectFirstProject(room)` — optional room selection
- `skipToEnd()` — skip first project step
- `enterApp()` — save all data to Supabase, redirect to dashboard

**On Complete:**
1. Create house record in Supabase
2. Update both profiles with house_id, names, diy_levels
3. Save rooms to house.rooms[]
4. If first project selected: create project record
5. Redirect to `/`

---

## 2. Dashboard (`/`) — `foundation-dashboard.html`

**Purpose:** Daily command center. Everything happening today + overview of all projects.

**Mobile Layout:** Vertical scroll — today brief → stat tiles → project cards → task list → AI card → spend strip → urgent materials

**Desktop Layout:** Two-column — left (house banner, stat bar, projects grid, task list, today brief) / right (AI card, budget ring, urgent buy list)

**Data Needed:**
- All active projects with computed spent/progress/next_task
- Today's tasks (due today or overdue, not done)
- All incomplete tasks (for task list)
- Total budget and total spent across all projects
- Urgent materials (priority = 'urgent', done = false)
- Today's scheduled items (hardcoded or from calendar events)

**Interactions:**
- `toggleTask(id)` — mark task done/undone → update DB → recalculate project progress → update all stat tiles in real-time
- `sendAI(question)` — call Claude API → display response in AI card
- `quickAsk()` — cycle through preset AI responses
- Tapping a project card → navigate to `/projects`
- "Blueprint →" link → navigate to `/projects/[id]/blueprint`

**Cross-screen sync:** When a task is toggled, the project's progress bar updates everywhere on the screen simultaneously. Use optimistic UI: update local state first, then sync to DB.

**AI Card Prompt:**
```
You are Foundation AI for [address]. Projects: [list with status/budget].
Today: [today items]. Be direct and specific in 2-3 sentences max.
User: [question]
```

---

## 3. Projects (`/projects`) — `foundation-projects.html`

**Purpose:** Full project list with filters, summary stats, and house overview.

**Desktop Layout:** House overview card (top left) + 4 stat cards with sparklines (top right) + project grid

**Mobile Layout:** Filter tabs → 4-cell summary bar → vertical card list

**Filter Tabs:** All / Active / Planning / Paused / Done

**Project Card Contains:**
- Color accent bar (top)
- Room icon (geometric SVG, see icon system in prototype)
- Project name + room label
- Status pill (active/planning/paused/done)
- Progress bar (animated)
- 3-stat row: Budget / Spent / Days left
- Next task strip (bottom, with colored dot)

**Interactions:**
- `setFilter(status)` — filter project list
- `setGridView(mode)` — toggle grid/list view
- `openProject(id)` — navigate to `/projects/[id]/blueprint`
- `newProject()` — navigate to `/projects/new`

**House Overview Card (Desktop):**
Shows a visual room map with zones colored by project activity. Rooms with active projects glow in that project's color.

---

## 4. New Project Wizard (`/projects/new`) — `foundation-new-project.html`

**Purpose:** 5-step guided flow that uses Claude to generate a full project blueprint.

**Steps:**
1. **Room Selection** — Grid of room icons, tap to select one
2. **Scope** — Chip-based multi-select (Paint / Flooring / Plumbing / Electrical / Cabinetry / Demo / etc.)
3. **Budget** — Slider ($50 → $25,000) + manual input
4. **Timeline** — 4 options: This weekend / 2-4 weeks / 1-3 months / Flexible
5. **AI Generation** → Review phases/tasks → Save

**Step 5 — AI Blueprint Generation:**
- Show loading state ("Foundation AI is building your blueprint...")
- Call Claude API with project details
- Claude returns JSON: `{ aiNote, phases: [{ name, color, days, tasks: [{ name, dur, cost, who, tip }] }] }`
- Render phases with expandable task rows
- User can review before saving
- "Save Project" → write all to Supabase

**Claude Prompt for Blueprint:**
```
Generate a realistic home improvement blueprint for:
Room: [room]
Scope: [scope chips]
Budget: $[budget]
Timeline: [timeline]
DIY Level: [level]

Return ONLY valid JSON (no markdown):
{
  "aiNote": "brief overall guidance",
  "phases": [{
    "name": "phase name",
    "color": "#hexcolor",
    "days": 2,
    "tasks": [{
      "name": "task name",
      "dur": "2h",
      "cost": 200,
      "who": "DIY",
      "tip": "optional pro tip"
    }]
  }]
}
```

**Interactions:**
- `selectRoom(room)` — tap room icon, highlight it
- `nextStep()` / `prevStep()` — wizard navigation
- `goToStep(n)` — jump to step via breadcrumb
- `triggerAIGenerate()` — call Claude, show loading, render result
- `saveProject()` — write house + project + phases + tasks to Supabase → redirect to `/projects/[id]/blueprint`

---

## 5. Blueprint (`/projects/[id]/blueprint`) — `foundation-blueprint.html`

**Purpose:** Task sequencer. Shows all phases and tasks for one project.

**Desktop Layout (3 columns):**
- Left: phase list + tasks (main column)
- Center right: Gantt mini timeline
- Far right: Decisions Needed panel + Next Up strip

**Mobile Layout:** Project switcher bar → phase filter pills → scrollable task list

**Phase Section:**
- Collapsible header with phase name, color dot, task count
- Task rows inside each phase

**Task Row Contains:**
- Checkbox (DIY = green when done, Pro = amber)
- Task name (strikethrough when done)
- Tag chip: DIY (green) or Pro (amber)
- Duration, cost, assignee, due date
- Drag handle (desktop) for reordering

**Interactions:**
- `toggleTask(id)` — check/uncheck → update DB → recalculate project progress
- `filterPhase(id)` — show only tasks in that phase
- `toggleAll()` — check/uncheck all tasks in a phase
- `addTaskPrompt()` — inline form to add a task
- `deleteTask(id)` — remove task
- `triggerAIGenerate()` — AI re-sequence button → call Claude → update task order
- `setMTab(tab)` — mobile: switch between Tasks/Gantt/Notes tabs
- Drag-to-reorder tasks (desktop) — update `position` field in DB

**AI Re-sequence Prompt:**
```
Re-sequence these tasks for optimal workflow. Return as JSON array of task IDs
in the recommended order, with a brief note on why.
Tasks: [task list with deps]
```

---

## 6. Budget (`/budget`) — `foundation-budget.html`

**Purpose:** Financial tracker across all projects.

**Desktop Layout:** 
- Top: Filter tabs + 4-cell summary bar
- Left: Project expense cards (expandable drawers)
- Right: Category breakdown bar chart + Recent expenses panel

**Mobile Layout:** Filter tabs → summary bar → project cards (tap header to expand drawer)

**Project Expense Card:**
- Header: icon + name + total budget + spent + status pill + progress bar
- Category chips row (materials/labor/tools/etc with color dots)
- Drawer (hidden by default): itemized expense list + quick-add bar

**Interactions:**
- `setFilter(projectId | 'all')` — filter to one project
- `toggleDrawer(projectId)` — expand/collapse expense list
- `quickAdd(projectId)` — add expense inline (desc + amount → submit)
- `openModal()` → Full "Log Expense" modal
  - Fields: Description, Amount, Project, Category, Paid By
  - `saveExpense()` → write to DB → update project.spent → update all totals
- `selectCat(cat)` — filter expenses by category

**Category Colors:**
```
materials: #7aaac8  (blue)
labor:     #d4903a  (amber)
tools:     #72b08a  (green)
fixtures:  #d4b978  (gold)
permits:   #a07ac8  (purple)
other:     #8a8478  (muted)
```

---

## 7. Materials (`/materials`) — `foundation-materials.html`

**Purpose:** Shopping list grouped by priority and store.

**Layout:**
- Filter tabs: All / To Buy / Got It / per-project
- 4-stat bar: To Buy / Acquired / Est. Cost / Urgent
- Items grouped by priority: Urgent → Needed → Planned → Optional
- Each priority group has a sticky section header

**Material Item Contains:**
- Checkbox (tap = mark done)
- Item name (strikethrough when done)
- Qty, source badge, project dot + name, needed-by date
- Note line (italic, muted)
- Action row (only when not done): Buy on Amazon / Find at HD + "Mark got it"

**Desktop Side Panel:**
- Progress ring (% acquired)
- Acquired / Remaining / Est. to buy stats
- By store breakdown (store badge + count + total)
- Share List button

**Interactions:**
- `setFilter(f)` — filter items
- `markDone(id)` — toggle item done → update DB
- `deleteItem(id)` — remove item
- `openAmazon(name)` — window.open Amazon search
- `openHD(name)` — window.open Home Depot search
- `quickAdd()` — desktop quick-add bar (name + price + project)
- `openModal()` → Full "Add Material" modal
  - Fields: Name, Price, Qty, Project, Source, Priority
  - `addItem()` → write to DB
- `exportSession()` / share list → generate text list grouped by store → copy to clipboard

---

## 8. Brainstorm (`/projects/[id]/brainstorm`) — `foundation-brainstorm.html`

**Purpose:** Open thinking space — notepad + live AI coach + session log.

**Mobile Layout (3 tabs):**
1. **Notes** — Textarea with tag buttons + word count
2. **AI** — Chat interface with quick prompts
3. **Log** — Session history

**Desktop Layout (3 panels):**
- Top-left: Open Notepad (full textarea)
- Bottom-left: AI Coach chat
- Right: Session Log

**Notepad:**
- Plain textarea, no formatting enforced
- Tag buttons insert at cursor: [IDEA] [?] [COST] [DO] [BLOCKED]
- Word count display (live)
- Auto-save to DB every 30 seconds

**AI Chat:**
- Quick prompt chips: "Prioritize my notes" / "What am I missing?" / "Weekend plan" / "Cost check"
- Free-form input
- AI reads notepad content when answering
- Typing indicator (3 bouncing dots)
- Message timestamps

**AI Prompt:**
```
You are Foundation AI, a practical home improvement coach for: [project name].
User notes:
---
[notepad content]
---
Be direct and specific, under 150 words. Reference notes when relevant.
User: [question]
```

**Session Log:**
- Auto-logs: session start, AI interactions, manual entries
- Types: note (blue) / ai (gold) / insight (purple) / action (green)
- Timestamps (HH:MM format)
- Manual entry via input at bottom
- Clear button

**Interactions:**
- `mTab(tab)` — mobile tab switch
- `insertTag(tag)` / `insertTagD(tag)` — insert tag at cursor
- `sendToAI()` — read notepad + question → Claude API → append to chat
- `analyzeNotes()` — send full notepad to Claude for analysis
- `quickPrompt(text)` — fill input + submit
- `clearLog()` — clear session log
- `saveNote()` — manual save
- `exportSession()` — copy notepad + AI chat + log to clipboard

---

## 9. Settings (`/settings`) — `foundation-settings.html`

**Purpose:** House profile, couple preferences, notifications.

**Sections:**
- House Profile (address, year built, sqft, style)
- Partner Setup (both names, DIY levels)
- Notifications (toggles: task reminders, delivery windows, weekly summary)
- App Preferences (default view, currency format)

**Interactions:**
- `flipToggle(id)` — toggle a setting
- `saveAll()` — write all changes to DB + profile

---

## 10. House Memory (`/memory`) — `foundation-memory.html` *(stub)*

**Purpose:** Per-room history — paint colors used, products bought, work done, warranties.

**Layout:** Room selector → entry list for selected room → Add Entry button

**Entry Contains:** Date, title, description, tags, photos

---

## 11. Calendar (`/calendar`) — `foundation-calendar.html` *(stub)*

**Purpose:** Timeline view across all projects — monthly calendar + Gantt view.

**Interactions:**
- `prevMonth()` / `nextMonth()` — navigate months
- `selectDay(date)` — show tasks due that day
- `syncCal()` — Google Calendar sync (future)

---

## Shared Navigation

### Mobile Bottom Nav (5 items)
```
Home (dashboard) | Projects | [FAB: New Project] | Budget | Shop (materials)
```
Active item highlights in gold. FAB opens New Project wizard.

### Desktop Sidebar (icon + tooltip)
```
Command (dashboard)
Projects
Blueprint
Budget
Materials
Brainstorm
Calendar
---
Settings
[Avatar: L+M]
```

### Topbar (desktop only)
- Left: Page title (Cinzel) + subtitle
- Right: Context actions (New Project / Log Expense / Add Item / etc.)
- Updates per active screen

### Navigate Function
```typescript
function navigate(to: string) {
  // Push to router
  router.push(routeMap[to])
}

const routeMap = {
  dashboard:  '/',
  projects:   '/projects',
  blueprint:  `/projects/${activeProjectId}/blueprint`,
  budget:     '/budget',
  materials:  '/materials',
  brainstorm: `/projects/${activeProjectId}/brainstorm`,
  settings:   '/settings',
  memory:     '/memory',
  calendar:   '/calendar',
}
```
