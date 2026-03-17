# Foundation by Ascension — Developer Handoff

Home improvement planning app for couples. Dark geometric brand, gold accents,
Cinzel + DM Sans typography. Built as standalone HTML prototypes ready to be
ported to a production stack.

---

## Recommended Stack

| Layer       | Technology                        | Why                              |
|-------------|-----------------------------------|----------------------------------|
| Framework   | Next.js 14 (App Router)           | SSR + client components, clean   |
| Language    | TypeScript                        | Already typed in the prototype   |
| Database    | Supabase (Postgres)               | Auth + real-time + storage       |
| ORM         | Drizzle ORM                       | Type-safe, lightweight           |
| AI          | Google Gemini 3 Flash Preview | Already wired in prototypes |
| Styling     | Tailwind CSS + CSS Variables      | Matches the token system used    |
| Auth        | Supabase Auth                     | Couples share one house profile  |
| Deploy      | Vercel                            | Zero config for Next.js          |

---

## File Index

### `/core/`
**`foundation-app.html`** — The primary deliverable. All 6 main screens wired
into a single navigable app with shared data store, slide transitions, and live
Claude API integration. Open this first.

Screens inside:
- Dashboard (Command)
- Projects
- Blueprint (task sequencer)
- Budget & Spend Tracker
- Materials & Shopping List
- Brainstorm (notepad + AI chat + session log)

### `/screens/`
Individual screen prototypes — each self-contained with mobile + desktop views,
view toggle, and full interactivity. Use these as isolated references when
building each route.

| File | Screen | Status |
|------|--------|--------|
| `foundation-onboarding.html` | 6-step house + couple setup wizard | Complete |
| `foundation-new-project.html` | AI-powered project wizard (5 steps) | Complete |
| `foundation-dashboard.html` | Command dashboard | Complete |
| `foundation-projects.html` | Projects list with filters | Complete |
| `foundation-blueprint.html` | Task sequencer with phases | Complete |
| `foundation-brainstorm.html` | Notes + AI coach + session log | Complete |
| `foundation-budget.html` | Budget tracker + expense log | Complete |
| `foundation-materials.html` | Shopping list by store | Complete |
| `foundation-settings.html` | House profile + preferences | Complete |
| `foundation-memory.html` | House Memory per-room history | Stub — needs build |
| `foundation-calendar.html` | Calendar & timeline view | Stub — needs build |

---

## Design Tokens

All tokens are CSS variables — map directly to Tailwind config:

```css
--void:        #0b0b0c   /* page background */
--base:        #111113   /* sidebar/header bg */
--card:        #161618   /* card background */
--raised:      #1c1c1f   /* elevated surfaces */
--lift:        #242428   /* highest elevation */

--border:      rgba(255,255,255,0.055)    /* default border */
--border-warm: rgba(210,185,130,0.22)     /* gold-tinted border */

--gold:        #d4b978   /* primary accent */
--gold-br:     #ecd49a   /* bright gold / hover */
--gold-dim:    rgba(212,185,120,0.08)     /* gold tinted background */

--white:       #ede9e3   /* primary text */
--muted:       #5c5850   /* tertiary text */
--soft:        #8a8478   /* secondary text */

--green-br:    #72b08a   /* success / active */
--amber:       #d4903a   /* warning / spent */
--red-br:      #cc8888   /* error / over budget */
--blue-br:     #7aaac8   /* info / planning */
--purple:      #a07ac8   /* insight / AI */
```

Fonts:
- **Cinzel** — all headings, page titles, numbers, stat values
- **DM Sans** — all body text, labels, inputs

---

## Data Model

```typescript
// Core entities extracted from STORE in foundation-app.html

interface Project {
  id:         string
  name:       string
  room:       string
  color:      string          // hex, per-project accent
  progress:   number          // 0-100
  budget:     number
  spent:      number
  tasksTotal: number
  tasksDone:  number
  status:     'active' | 'planning' | 'paused' | 'done'
  daysLeft:   number | null
  nextTask:   string | null
  nextDate:   string | null
}

interface Task {
  id:        number
  name:      string
  proj:      string           // project id
  projColor: string
  phase:     string           // phase id
  who:       string           // 'Leo' | 'Both' | 'Pro'
  date:      string
  dur:       string           // '2h', '30m', '1d'
  cost:      number
  tag:       'DIY' | 'Pro'
}

interface Expense {
  id:     number
  desc:   string
  amount: number
  cat:    'materials' | 'labor' | 'tools' | 'fixtures' | 'permits' | 'other'
  who:    string
  date:   string
}

interface Material {
  id:       number
  name:     string
  price:    number
  qty:      string
  proj:     string
  source:   'amazon' | 'hd' | 'lowes' | 'local' | 'other'
  priority: 'urgent' | 'needed' | 'planned' | 'optional'
  by:       string
  note:     string
  done:     boolean
}

interface Phase {
  id:      string
  name:    string
  color:   string
  taskIds: number[]
}

interface HouseProfile {
  address:   string
  city:      string
  state:     string
  yearBuilt: number
  sqft:      number
  ownership: 'own' | 'rent'
  style:     string
  rooms:     string[]
}

interface UserProfile {
  name:      string
  diyLevel:  'hands-on' | 'capable' | 'basic' | 'manager'
}
```

---

## Supabase Schema (suggested)

```sql
-- One row per house
create table houses (
  id          uuid primary key default gen_random_uuid(),
  address     text,
  city        text,
  state       text,
  year_built  int,
  sqft        int,
  style       text,
  created_at  timestamptz default now()
);

-- Users belong to a house (couples share one)
create table profiles (
  id          uuid primary key references auth.users,
  house_id    uuid references houses,
  name        text,
  diy_level   text,
  avatar_url  text
);

create table projects (
  id          uuid primary key default gen_random_uuid(),
  house_id    uuid references houses,
  name        text not null,
  room        text,
  color       text,
  status      text default 'planning',
  budget      numeric default 0,
  created_at  timestamptz default now()
);

create table tasks (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references projects,
  name        text not null,
  phase       text,
  who         text,
  due_date    text,
  duration    text,
  cost        numeric default 0,
  tag         text default 'DIY',
  done        boolean default false,
  position    int default 0
);

create table expenses (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references projects,
  description text not null,
  amount      numeric not null,
  category    text,
  paid_by     text,
  logged_at   timestamptz default now()
);

create table materials (
  id          uuid primary key default gen_random_uuid(),
  house_id    uuid references houses,
  project_id  uuid references projects,
  name        text not null,
  price       numeric,
  qty         text,
  source      text,
  priority    text default 'needed',
  needed_by   text,
  note        text,
  done        boolean default false,
  created_at  timestamptz default now()
);

create table brainstorm_sessions (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references projects,
  notes       text,
  created_at  timestamptz default now()
);
```

---

## Gemini API Usage

Already integrated in `foundation-app.html`. Key prompts:

**Dashboard AI** — context-aware, reads active project state:
```
Model: gemini-3-flash-preview
Max tokens: 1000
System: house context + active projects summary
```

**Brainstorm AI** — reads notepad content:
```
Model: gemini-3-flash-preview
Max tokens: 1000
System: project context + full notepad text
```

**Blueprint AI** (New Project wizard) — generates full JSON blueprint:
```json
{
  "aiNote": "string",
  "phases": [{
    "id": "string",
    "name": "string",
    "days": 2,
    "tasks": [{
      "name": "string",
      "dur": "2h",
      "cost": 200,
      "who": "DIY",
      "tip": "optional"
    }]
  }]
}
```

---

## Route Map (Next.js)

```
app/
  (auth)/
    onboarding/     → foundation-onboarding.html
  (app)/
    layout.tsx      → sidebar + bottom nav shell
    page.tsx        → dashboard
    projects/
      page.tsx      → projects list
      [id]/
        page.tsx    → project detail + blueprint
    budget/
      page.tsx      → budget tracker
    materials/
      page.tsx      → shopping list
    brainstorm/
      page.tsx      → notes + AI
    memory/
      page.tsx      → house memory (stub)
    calendar/
      page.tsx      → calendar (stub)
    settings/
      page.tsx      → settings
  new-project/      → foundation-new-project.html (multi-step wizard)
```

---

## Key Interaction Patterns

1. **Cross-screen sync** — checking a task anywhere updates progress %, stat
   tiles, and dashboard simultaneously. In production: optimistic UI updates
   + Supabase real-time subscriptions.

2. **Shared nav** — bottom nav (mobile) + sidebar (desktop) live in a shared
   layout component. Active state driven by router path.

3. **View toggle** — mobile/desktop prototype toggle becomes responsive layout
   in production (CSS breakpoints, no JS toggle needed).

4. **Project color system** — each project gets a hex accent color. Used for
   progress bars, stat highlights, category dots throughout the app.

5. **Money formatting** — `fmtMoney(n)` helper: `$38` / `$1.2k` / `$12k`.
   Sub-$1k shows exact, $1k-$10k shows one decimal, $10k+ rounds.

---

## What Still Needs Building

| Feature | Notes |
|---------|-------|
| House Memory | Per-room history, product log, warranty tracker |
| Calendar | Gantt / month view across all projects |
| Photo Log | Before/after photos tagged to tasks |
| Notifications | Task due dates, delivery windows |
| Google Calendar sync | Push tasks to shared couple calendar |
| Amazon / HD deep links | Already in Materials, needs real product search API |
| Offline support | PWA service worker |
| Push notifications | Mobile task reminders |

---

*Prototype built in Claude.ai — Anthropic, 2025*
