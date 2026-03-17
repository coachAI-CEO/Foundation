# Foundation — Tech Stack & Project Setup

## Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Next.js | 14 (App Router) | Server + client components |
| Language | TypeScript | 5.x | Strict mode on |
| Database | Supabase | Latest | Postgres + Auth + Realtime + Storage |
| ORM | Drizzle ORM | Latest | Type-safe, lightweight |
| Styling | Tailwind CSS | 3.x | + CSS variables for tokens |
| AI | Anthropic Claude API | claude-sonnet-4-20250514 | Already wired in prototype |
| Auth | Supabase Auth | Built-in | Email + magic link |
| Deploy | Vercel | Latest | Zero config for Next.js |
| State | Zustand | Latest | Client-side store |
| Forms | React Hook Form | Latest | + Zod validation |
| Animations | Framer Motion | Latest | For screen transitions |

## Initial Setup Commands

```bash
npx create-next-app@latest foundation --typescript --tailwind --app --src-dir
cd foundation
npm install @supabase/supabase-js @supabase/ssr
npm install drizzle-orm postgres
npm install -D drizzle-kit
npm install @anthropic-ai/sdk
npm install zustand
npm install react-hook-form @hookform/resolvers zod
npm install framer-motion
npm install lucide-react
```

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Tailwind Config

This is critical — copy the design tokens from the prototype exactly into Tailwind:

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        void:   '#0b0b0c',
        base:   '#111113',
        card:   '#161618',
        raised: '#1c1c1f',
        lift:   '#242428',
        gold:   {
          DEFAULT: '#d4b978',
          bright:  '#ecd49a',
          dim:     'rgba(212,185,120,0.08)',
        },
        white:  '#ede9e3',
        muted:  '#5c5850',
        soft:   '#8a8478',
        green:  {
          DEFAULT: '#4e7a5e',
          bright:  '#72b08a',
          dim:     'rgba(78,122,94,0.12)',
        },
        red:    { bright: '#cc8888', dim: 'rgba(204,136,136,0.1)' },
        amber:  { DEFAULT: '#d4903a', dim: 'rgba(212,144,58,0.12)' },
        blue:   { bright: '#7aaac8', dim: 'rgba(122,170,200,0.1)' },
        purple: { DEFAULT: '#a07ac8', dim: 'rgba(160,122,200,0.1)' },
        orange: { DEFAULT: '#c87941', dim: 'rgba(200,121,65,0.12)' },
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        sans:   ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '16px',
        sm:      '10px',
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.055)',
        warm:    'rgba(210,185,130,0.22)',
      },
    },
  },
  plugins: [],
}
export default config
```

## CSS Global Variables

In `src/app/globals.css` — copy VERBATIM from prototype:

```css
:root {
  --void:#0b0b0c; --base:#111113; --card:#161618;
  --raised:#1c1c1f; --lift:#242428;
  --border:rgba(255,255,255,0.055);
  --border-warm:rgba(210,185,130,0.22);
  --gold:#d4b978; --gold-br:#ecd49a;
  --gold-dim:rgba(212,185,120,0.08);
  --white:#ede9e3; --muted:#5c5850; --soft:#8a8478;
  --green:#4e7a5e; --green-br:#72b08a;
  --green-dim:rgba(78,122,94,0.12);
  --red-br:#cc8888; --red-dim:rgba(204,136,136,0.1);
  --amber:#d4903a; --amber-dim:rgba(212,144,58,0.12);
  --blue-br:#7aaac8; --blue-dim:rgba(122,170,200,0.1);
  --purple:#a07ac8; --purple-dim:rgba(160,122,200,0.1);
  --orange:#c87941; --orange-dim:rgba(200,121,65,0.12);
  --r:16px; --r-sm:10px;
}

* { margin:0; padding:0; box-sizing:border-box; }
html, body { height:100%; background:#080809; color:var(--white); }
body { font-family:'DM Sans',sans-serif; }

::-webkit-scrollbar { width:4px; height:4px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:rgba(212,185,120,0.18); border-radius:4px; }

@keyframes fadeUp {
  from { opacity:0; transform:translateY(8px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes pulseDot {
  0%,100% { box-shadow:0 0 0 0 rgba(114,176,138,0.35); }
  70%     { box-shadow:0 0 0 7px rgba(114,176,138,0); }
}
```

## Next.js App Directory Structure

```
src/
  app/
    (auth)/
      onboarding/
        page.tsx          -- Multi-step onboarding wizard
    (app)/
      layout.tsx          -- Shell: sidebar (desktop) + bottom nav (mobile)
      page.tsx            -- Dashboard / Command screen
      projects/
        page.tsx          -- Projects list
        new/
          page.tsx        -- New project wizard (AI blueprint generator)
        [id]/
          page.tsx        -- Project detail
          blueprint/
            page.tsx      -- Task sequencer
          brainstorm/
            page.tsx      -- Notes + AI coach + session log
      budget/
        page.tsx          -- Budget tracker
      materials/
        page.tsx          -- Shopping list
      memory/
        page.tsx          -- House Memory
      calendar/
        page.tsx          -- Calendar & timeline
      settings/
        page.tsx          -- Settings
  components/
    layout/
      Sidebar.tsx         -- Desktop sidebar nav
      BottomNav.tsx       -- Mobile bottom nav
      TopBar.tsx          -- Desktop topbar (title + actions)
    ui/
      Button.tsx          -- btn-primary, btn-ghost variants
      Card.tsx            -- Base card component
      StatusPill.tsx      -- active/planning/paused/done pills
      ProgressBar.tsx     -- Animated progress bar (data-w pattern)
      Modal.tsx           -- Sheet modal (slides up from bottom)
      Toast.tsx           -- Toast notification
      FilterTabs.tsx      -- Horizontal scrollable filter tabs
    dashboard/
      HousePill.tsx
      TodayBrief.tsx
      StatTiles.tsx
      ProjectScroll.tsx
      TaskList.tsx
      AICard.tsx
      SpendStrip.tsx
    projects/
      HouseOverviewCard.tsx
      ProjectCard.tsx
      StatCard.tsx
    blueprint/
      PhaseSection.tsx
      TaskRow.tsx
      GanttMini.tsx
    budget/
      SummaryBar.tsx
      ProjectExpenseCard.tsx
      CategoryBreakdown.tsx
    materials/
      PrioritySection.tsx
      MaterialItem.tsx
      StorePanel.tsx
    brainstorm/
      Notepad.tsx
      AIChat.tsx
      SessionLog.tsx
  lib/
    supabase/
      client.ts
      server.ts
      middleware.ts
    db/
      schema.ts           -- Drizzle schema
      queries.ts          -- All DB queries
    ai/
      claude.ts           -- Claude API client + prompt functions
    store/
      useStore.ts         -- Zustand store (mirrors STORE from prototype)
    utils/
      money.ts            -- fmtMoney() helper
      date.ts             -- Date formatting
      colors.ts           -- Project color system
```

## Fonts Setup

In `src/app/layout.tsx`:

```typescript
import { Cinzel, DM_Sans } from 'next/font/google'

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cinzel',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
})
```

## Atmosphere Background

Every page has the atmospheric radial gradient overlay. Add to the root layout:

```tsx
// In layout.tsx — always present
<div className="atmo" aria-hidden="true" />
<div className="grid-bg" aria-hidden="true" />
```

CSS (from prototype):
```css
.atmo {
  position:fixed; inset:0; pointer-events:none; z-index:0;
  background:
    radial-gradient(ellipse 65% 45% at 50% -8%,rgba(212,185,120,0.065) 0%,transparent 60%),
    radial-gradient(ellipse 35% 55% at 95% 55%,rgba(78,122,94,0.028) 0%,transparent 55%),
    radial-gradient(ellipse 30% 40% at 5% 85%,rgba(122,170,200,0.02) 0%,transparent 50%);
}
.grid-bg {
  position:fixed; inset:0; pointer-events:none; z-index:0; opacity:0.018;
  background-image:
    linear-gradient(var(--gold) 1px,transparent 1px),
    linear-gradient(90deg,var(--gold) 1px,transparent 1px);
  background-size:48px 48px;
}
```
