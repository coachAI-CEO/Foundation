# Foundation — Build Gaps & Todo List

## Screens: Fully Prototyped (Build from prototype exactly)

| Screen | File | All Interactions Defined |
|--------|------|--------------------------|
| Dashboard | `foundation-dashboard.html` | Yes |
| Projects | `foundation-projects.html` | Yes |
| New Project Wizard | `foundation-new-project.html` | Yes |
| Blueprint | `foundation-blueprint.html` | Yes |
| Budget | `foundation-budget.html` | Yes |
| Materials | `foundation-materials.html` | Yes |
| Brainstorm | `foundation-brainstorm.html` | Yes |
| Onboarding | `foundation-onboarding.html` | Yes |
| Settings | `foundation-settings.html` | Yes |

## Screens: Stubs (Design intent shown, needs full build)

| Screen | File | What Needs Building |
|--------|------|---------------------|
| House Memory | `foundation-memory.html` | Per-room entry list, add entry form, photo upload, tag system |
| Calendar | `foundation-calendar.html` | Monthly grid, task event display, project timeline view, Google Calendar sync |

## Features Present in Prototype but Need Production Wiring

### Authentication
- [ ] Supabase Auth setup (email + magic link)
- [ ] Onboarding → create house + profiles in DB
- [ ] Partner invite flow (share house_id, both link to same house)
- [ ] Session persistence across reloads
- [ ] Protected routes (redirect to /onboarding if no house)

### Real-time Sync
- [ ] Supabase real-time subscriptions for tasks, expenses, materials
- [ ] Optimistic UI for task toggling (update local before DB confirms)
- [ ] Conflict resolution for simultaneous edits
- [ ] Presence indicators (show when partner is online)

### Data Persistence
- [ ] Auto-save brainstorm notes every 30 seconds
- [ ] Draft state for new project wizard (persist across page refresh)
- [ ] Local storage fallback for offline use

### Materials
- [ ] Amazon product search API (real product links vs. search links)
- [ ] Home Depot product search (or affiliate links)
- [ ] Share list → send SMS/email with formatted shopping list

### Budget
- [ ] Receipt photo upload (Supabase Storage)
- [ ] Export to CSV/PDF
- [ ] Budget alerts (notify when project is at 80% of budget)

### Blueprint
- [ ] Drag-to-reorder tasks (implement with @dnd-kit/core)
- [ ] Add task inline form
- [ ] Delete task with confirmation
- [ ] AI re-sequence (full prompt defined in 05-CLAUDE-API.md)
- [ ] Gantt mini chart (task durations on timeline)
- [ ] Decisions Needed panel (tasks tagged as blocking decisions)
- [ ] Next Up strip (upcoming tasks in chronological order)

### Notifications (Future)
- [ ] Push notifications for task due dates
- [ ] Delivery window reminders
- [ ] Weekly summary email
- [ ] Partner activity notifications ("Alex checked off 3 tasks")

### Calendar
- [ ] Monthly view with task due dates
- [ ] Project timeline (Gantt view)
- [ ] Google Calendar OAuth + sync
- [ ] Add task from calendar

### House Memory
- [ ] Room selector (matches rooms from onboarding)
- [ ] Entry list per room (date, title, description, tags)
- [ ] Photo upload per entry (Supabase Storage)
- [ ] Search entries
- [ ] Tag filter

### Settings
- [ ] Save house profile changes
- [ ] Update partner names and DIY levels
- [ ] Toggle notifications
- [ ] Delete project confirmation
- [ ] Export all data

## Performance Requirements

- [ ] Initial page load < 2 seconds
- [ ] Task toggle responds in < 100ms (optimistic UI)
- [ ] AI responses stream (don't wait for full response)
- [ ] Images lazy-loaded
- [ ] Progress bars animate on first render (IntersectionObserver)

## Responsive Breakpoints

The prototype has exactly two modes:
```css
/* Mobile shell (phone frame): max-width 430px context */
/* Desktop sidebar layout: > 768px */

@media (max-width: 768px) {
  /* Mobile: bottom nav, full-width content, no sidebar */
}
@media (min-width: 769px) {
  /* Desktop: 64px sidebar + main content area */
}
```

**Do not add intermediate breakpoints.** The design is intentionally binary —
phone view or desktop view. No tablet in-between state.

## Known Prototype Limitations to Fix in Production

1. **Data is hardcoded** — All projects, tasks, expenses in prototype are static.
   Replace with live Supabase queries.

2. **No persistence between sessions** — Prototype resets on reload.
   Production uses Supabase + Zustand with hydration.

3. **Single user** — Prototype shows "Leo" hardcoded.
   Production shows the authenticated user's name + partner's name.

4. **No photos** — Prototype has no photo upload.
   Production: Supabase Storage for receipt photos and project photos.

5. **AI is client-side** — Prototype calls Claude API directly from browser.
   Production: all Claude calls go through `/api/ai` server route.

6. **No error states** — Prototype shows no empty states or error UI.
   Production needs: empty state for no projects, error state for failed loads,
   skeleton loading states for all data-driven screens.

## Empty States Needed

Each screen needs a designed empty state:

| Screen | Empty State |
|--------|-------------|
| Dashboard | "No active projects yet. Start your first →" |
| Projects | "No projects yet. Create your first →" |
| Blueprint | "No tasks yet. Add your first task or use AI to generate a blueprint." |
| Budget | "No expenses logged yet. Log your first →" |
| Materials | "Shopping list is empty. Add items →" |
| Brainstorm | Ready state with suggested prompts |
| Memory | "No entries yet. Start documenting your home →" |

## Seed Data

For development, use this seed data (matches prototype):

```typescript
// The exact projects, tasks, expenses from STORE in foundation-p3.html
// See screens/foundation-p3.html → var STORE = { ... }
// Extract and convert to Supabase insert statements for dev seeding
```
