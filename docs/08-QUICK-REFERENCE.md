# Foundation — Quick Reference

## The One Rule
Open `screens/foundation-final.html`. Match it exactly. Every pixel, animation, color, and interaction.

## Fonts
```
Cinzel    → ALL headings, numbers, stat values, page titles, card names
DM Sans   → ALL body text, labels, inputs, descriptions
```

## Colors (memorize these 5)
```
#0b0b0c  void      (page background)
#161618  card      (card background)
#d4b978  gold      (primary accent, active state, gold text)
#ede9e3  white     (primary text)
#5c5850  muted     (tertiary text, inactive nav)
```

## Border Radii
```
16px  cards, modals, phone shell
10px  inputs, buttons, tags
20px  pills, filter chips
50%   dots, avatars
```

## The Phone Shell
Width: 390px. Height: 844px. Border-radius: 44px.
Box-shadow: `0 0 0 10px #0d0d0f, 0 0 0 12px #1e1e22, 0 0 0 13px #0d0d0f, 0 40px 100px rgba(0,0,0,0.9)`
Notch: 126px wide, 34px tall, centered, border-radius 0 0 22px 22px.

## Animations
```
Screen slide:   transform 0.32s cubic-bezier(0.4,0,0.2,1)
Progress bars:  width 0.7s ease  (trigger on mount)
Card hover:     border-color 0.18s
Button press:   scale(0.97)
Pulse dot:      pulseDot keyframe 2.5s ease-in-out infinite
```

## Layout
```
Mobile:  Single column, bottom nav (5 items), no sidebar
Desktop: 64px sidebar + main content area
Padding: 18px mobile, 32px desktop
```

## Status Pills
```
active:   green-dim bg, green-br text
planning: blue-dim bg, blue-br text  
paused:   amber-dim bg, amber text
done:     gold-dim bg, gold text
```

## Category Colors (Budget + Materials)
```
materials: #7aaac8 (blue)
labor:     #d4903a (amber)
tools:     #72b08a (green)
fixtures:  #d4b978 (gold)
permits:   #a07ac8 (purple)
other:     #8a8478 (muted)
```

## Material Priority Dots
```
urgent:   var(--red-br)   #cc8888
needed:   var(--amber)    #d4903a
planned:  var(--blue-br)  #7aaac8
optional: var(--muted)    #5c5850
```

## Money Format
```
$38      under $1k  (exact)
$1.2k    $1k-$10k   (one decimal)
$12k     over $10k  (rounded)
```

## AI Model
`claude-sonnet-4-20250514` — always. Never change this.

## Route Map
```
/                           → Dashboard
/projects                   → Projects list
/projects/new               → New project wizard
/projects/[id]/blueprint    → Blueprint
/projects/[id]/brainstorm   → Brainstorm
/budget                     → Budget
/materials                  → Materials
/settings                   → Settings
/memory                     → House Memory
/calendar                   → Calendar
/onboarding                 → First-run wizard
```

## File Reference
```
screens/foundation-final.html        ← PRIMARY: all screens navigable
screens/foundation-dashboard.html    ← Dashboard isolated
screens/foundation-projects.html     ← Projects isolated
screens/foundation-blueprint.html    ← Blueprint isolated
screens/foundation-budget.html       ← Budget isolated
screens/foundation-materials.html    ← Materials isolated
screens/foundation-brainstorm.html   ← Brainstorm isolated
screens/foundation-onboarding.html   ← Onboarding wizard isolated
screens/foundation-new-project.html  ← New project wizard isolated
screens/foundation-settings.html     ← Settings isolated
screens/foundation-memory.html       ← Memory (stub)
screens/foundation-calendar.html     ← Calendar (stub)
```

## Doc Reference
```
docs/00-MASTER-PROMPT.md   ← Start here. Overall brief.
docs/01-TECH-STACK.md      ← Setup, dependencies, config
docs/02-DATA-MODEL.md      ← TypeScript types + Supabase schema
docs/03-SCREEN-SPECS.md    ← Every screen: data + interactions
docs/04-COMPONENTS.md      ← Component library with CSS
docs/05-CLAUDE-API.md      ← All AI prompts
docs/06-STATE.md           ← Zustand store + sync patterns
docs/07-GAPS-AND-TODOS.md  ← What still needs to be built
```
