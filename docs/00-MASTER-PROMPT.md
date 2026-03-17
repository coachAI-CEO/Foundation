# Foundation by Ascension — Master Coding Agent Prompt

## What You Are Building

Foundation is a home improvement planning app for couples. It helps homeowners
plan, track, and execute renovation projects from a $30 caulk job to a full
kitchen remodel — all in one place, together.

## Your Primary Reference

**`screens/foundation-final.html`** is the pixel-perfect prototype. Every screen,
interaction, animation, component, and data flow is already designed and working
in that file. Your job is to convert it into a production Next.js application
that looks and behaves identically.

Do not redesign anything. Do not improve anything visually. Match the prototype exactly.

## The Other Screen Files

Each file in `screens/` is an isolated prototype of one screen. Use them as
per-route references when building each page — they are the source of truth for
that screen's layout, components, and behavior.

| File | Route | Priority |
|------|-------|----------|
| `foundation-final.html` | All screens navigable | PRIMARY reference |
| `foundation-onboarding.html` | `/onboarding` | P1 |
| `foundation-dashboard.html` | `/` | P1 |
| `foundation-new-project.html` | `/projects/new` | P1 |
| `foundation-projects.html` | `/projects` | P1 |
| `foundation-blueprint.html` | `/projects/[id]/blueprint` | P1 |
| `foundation-budget.html` | `/budget` | P1 |
| `foundation-materials.html` | `/materials` | P1 |
| `foundation-brainstorm.html` | `/projects/[id]/brainstorm` | P1 |
| `foundation-settings.html` | `/settings` | P2 |
| `foundation-memory.html` | `/memory` | P2 |
| `foundation-calendar.html` | `/calendar` | P2 |

## Core Rules

1. **Match the prototype exactly.** Every color, font, spacing, border radius,
   animation, and interaction must match `foundation-final.html`.

2. **Mobile-first, desktop-second.** The prototype has both layouts. The mobile
   view is the primary experience. Desktop is a sidebar + main area layout.

3. **Dark theme only.** No light mode. Background is `#0b0b0c`.

4. **Cinzel + DM Sans always.** Cinzel for all headings, numbers, titles.
   DM Sans for all body text, labels, inputs.

5. **Gold accent system.** Primary interactive color is `#d4b978`. Use it exactly
   as shown in the prototype — not more, not less.

6. **Real-time sync.** Supabase real-time subscriptions for all shared data
   (tasks, expenses, materials). When one partner checks a task, the other
   partner's screen updates immediately.

7. **Claude API is already wired.** The prototype shows the exact prompts used.
   Keep them exactly as implemented.

## What Must NOT Change

- All CSS custom properties (design tokens) — copy them verbatim from the prototype
- The phone shell appearance (border-radius, notch, box-shadow)
- All animation timings (0.32s slide, 0.7s progress bars, 2.5s pulse)
- The geometric SVG icon system (no emoji, no icon fonts)
- Gold/dark color relationships throughout

## Build Order

1. Project setup (Next.js, Supabase, Tailwind config with tokens)
2. Shared layout (sidebar + bottom nav shell)
3. Auth + onboarding flow
4. Dashboard
5. Projects list + New Project wizard
6. Blueprint (task sequencer)
7. Budget + expense tracking
8. Materials + shopping list
9. Brainstorm + AI chat
10. Settings, Memory, Calendar
