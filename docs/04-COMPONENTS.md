# Foundation — Component Library

Every component listed here exists in the prototype. Extract the HTML/CSS
directly from `screens/foundation-final.html`. This document specifies
the props, variants, and behavior for each.

---

## Design System Foundations

### Typography
```typescript
// Always use these combinations — never mix
Heading:   font-family: 'Cinzel', serif    // page titles, stat numbers, card names
Body:      font-family: 'DM Sans', sans    // everything else
Code/mono: n/a — not used in this app
```

### Spacing Scale
The prototype uses these values consistently:
```
4px   — gap between inline items
6px   — gap between chips/tags
8px   — small padding, gap in rows
10px  — medium padding
12px  — card internal padding (compact)
14px  — card internal padding (standard)
16px  — section padding
18px  — page horizontal padding (mobile)
20px  — section gap
24px  — desktop page padding
32px  — desktop page padding (wide)
```

### Border Radius
```
--r:    16px  — cards, modals, phone shell
--r-sm: 10px  — inputs, buttons, tags, smaller cards
20px          — pills, chips, filter tabs
50%           — avatars, dot indicators
```

---

## Core UI Components

### Button — Primary
```tsx
interface ButtonPrimaryProps {
  children: React.ReactNode
  onClick?: () => void
  size?: 'sm' | 'md'  // sm: padding 9px 13px, font 12px | md: padding 10px 18px, font 13px
  icon?: React.ReactNode
  disabled?: boolean
}
```
CSS from prototype:
```css
.btn-primary {
  display:flex; align-items:center; justify-content:center; gap:7px;
  padding:10px 18px; border-radius:var(--r-sm);
  background:var(--gold); color:#0b0b0c;
  font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
  border:none; cursor:pointer; transition:all 0.2s; white-space:nowrap;
}
.btn-primary:hover { background:var(--gold-br); }
.btn-primary:active { transform:scale(0.97); }
```

### Button — Ghost
```tsx
interface ButtonGhostProps {
  children: React.ReactNode
  onClick?: () => void
  icon?: React.ReactNode
}
```
```css
.btn-ghost {
  display:flex; align-items:center; gap:6px; padding:8px 13px;
  border-radius:8px; background:transparent;
  border:1px solid var(--border); color:var(--soft);
  font-family:'DM Sans',sans-serif; font-size:12px; font-weight:500;
  cursor:pointer; transition:all 0.18s; white-space:nowrap;
}
.btn-ghost:hover { border-color:var(--border-warm); color:var(--white); }
```

### StatusPill
```tsx
interface StatusPillProps {
  status: 'active' | 'planning' | 'paused' | 'done'
  label?: string  // override default label
}
```
```css
.sp-active   { background:var(--green-dim); color:var(--green-br); border:1px solid rgba(78,122,94,0.2); }
.sp-planning { background:var(--blue-dim);  color:var(--blue-br);  border:1px solid rgba(122,170,200,0.18); }
.sp-paused   { background:var(--amber-dim); color:var(--amber);    border:1px solid rgba(212,144,58,0.2); }
.sp-done     { background:var(--gold-dim);  color:var(--gold);     border:1px solid var(--border-warm); }
/* All: padding 3px 9px, border-radius 20px, font-size 9px, font-weight 600, letter-spacing 0.08em, uppercase */
```

### ProgressBar
```tsx
interface ProgressBarProps {
  value: number      // 0-100
  color?: string     // hex, defaults to project color
  height?: number    // px, default 3
  animated?: boolean // default true — uses CSS transition 0.7s ease
}
```
The `data-w` attribute pattern from the prototype:
```html
<div style="height:3px; background:rgba(255,255,255,0.05); border-radius:3px; overflow:hidden;">
  <div data-w="58" style="width:0%; height:100%; background:#d4903a; transition:width 0.7s ease;"></div>
</div>
```
On mount, set `width = data-w + '%'` to trigger animation.

### Card
```tsx
interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean  // adds hover border-warm transition
}
```
```css
.card {
  background:var(--card);
  border:1px solid var(--border);
  border-radius:var(--r);
}
.card:hover { border-color:var(--border-warm); }
```

### FilterTabs
```tsx
interface FilterTabsProps {
  tabs: { id: string; label: string }[]
  active: string
  onChange: (id: string) => void
  scrollable?: boolean  // default true
}
```
```css
.filter-row { display:flex; gap:6px; overflow-x:auto; scrollbar-width:none; }
.ftab {
  padding:6px 14px; border-radius:20px; font-size:11px; font-weight:500;
  cursor:pointer; border:1px solid var(--border);
  background:transparent; color:var(--muted); white-space:nowrap;
  transition:all 0.18s;
}
.ftab.active { background:var(--gold-dim); border-color:var(--border-warm); color:var(--gold); }
```

### Modal (Bottom Sheet)
```tsx
interface ModalProps {
  id: string
  title: string
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  maxWidth?: number  // default 480
}
```
```css
.modal-overlay {
  position:fixed; inset:0; background:rgba(0,0,0,0.72); z-index:5000;
  display:flex; align-items:flex-end; justify-content:center;
  opacity:0; pointer-events:none; transition:opacity 0.25s;
  backdrop-filter:blur(4px);
}
.modal-overlay.open { opacity:1; pointer-events:all; }
.modal-sheet {
  width:100%; max-width:480px; background:var(--base);
  border:1px solid var(--border); border-radius:20px 20px 0 0;
  padding:24px; transform:translateY(40px);
  transition:transform 0.3s cubic-bezier(0.2,0,0.1,1);
}
.modal-overlay.open .modal-sheet { transform:translateY(0); }
```

### Toast
```tsx
function showToast(message: string, duration?: number): void
```
```css
/* Single fixed element, reused for all toasts */
position:fixed; bottom:90px; left:50%; transform:translateX(-50%);
background:var(--raised); border:1px solid var(--border-warm);
color:var(--white); font-size:12px; padding:10px 20px;
border-radius:10px; z-index:9999; white-space:nowrap;
opacity:0; transition:opacity 0.25s;
```

### CheckBox
```tsx
interface CheckBoxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  size?: number  // default 18
}
```
```css
.db-check {
  width:18px; height:18px; border-radius:5px;
  border:1px solid var(--border);
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; flex-shrink:0; transition:all 0.18s;
}
.db-check:hover { border-color:var(--gold); }
.db-check.done { background:var(--green-dim); border-color:rgba(78,122,94,0.4); }
/* When done, show check SVG: */
/* <polyline points="2,5.5 4.5,8 9,3" stroke="var(--green-br)" stroke-width="2" /> */
```

---

## Layout Components

### PhoneShell (Mobile view wrapper)
The phone appearance in mobile mode. Copy exactly:
```css
.mobile-shell {
  width:390px; height:844px; border-radius:44px; overflow:hidden;
  box-shadow:
    0 0 0 10px #0d0d0f,
    0 0 0 12px #1e1e22,
    0 0 0 13px #0d0d0f,
    0 40px 100px rgba(0,0,0,0.9);
  background:var(--void);
}
/* Notch: */
.mobile-shell::before {
  content:''; position:absolute; top:0; left:50%;
  transform:translateX(-50%);
  width:126px; height:34px; background:#0d0d0f;
  border-radius:0 0 22px 22px; z-index:200;
}
```

### BottomNav (Mobile)
5 items: Home, Projects, FAB, Budget, Shop.
Active item: icon + label both turn `var(--gold)`.
FAB: 50px circle, gold background, `box-shadow:0 4px 20px rgba(212,185,120,0.35)`.

### Sidebar (Desktop)
64px wide. Logo at top, nav icons in center, settings+avatar at bottom.
Each nav icon: 40×40px, border-radius 10px.
Active: gold color + gold-dim background + 2px gold left border.
Hover: shows tooltip (absolute, left:50px).

### Topbar (Desktop)
Full-width. Page title in Cinzel 20px. Subtitle in DM Sans 11px muted.
Right: context action buttons.

---

## Screen-Specific Components

### HousePill (Dashboard)
```html
<div class="db-house-pill">
  <div class="db-pulse"></div>  <!-- 8px green dot, animated pulse -->
  <div>
    <div>4246 Elmwood Drive</div>
    <div>Sacramento, CA · 3 active projects</div>
  </div>
  <!-- chevron down icon -->
</div>
```

### TodayBriefCard (Dashboard)
Gold border. Header: date label + weather. Body: list of today items.
Each item: colored dot + text + time badge + type badge (Delivery/Task/Buy/Blocking).
Badge colors: Delivery=gold, Task=blue, Buy=green, Blocking=red.

### StatTile (Dashboard, 4-column grid)
```html
<div class="db-stat">
  <div class="db-stat-val">3</div>    <!-- Cinzel 16px -->
  <div class="db-stat-lbl">Projects</div>  <!-- 8px uppercase muted -->
</div>
```

### ProjectMiniCard (Dashboard scroll)
190px wide, flex-shrink:0. Icon + status pill + name + room + progress bar + pct + next task.

### AICard (Dashboard + Brainstorm)
Gold border. Header: gold avatar circle + "Foundation AI" + green live dot.
Body: message text + quick-prompt chips + input row.
Live dot animation: `pulseDot` keyframe.

### ProjectCard (Projects list)
Full details card. See Section 3 in screen specs.

### HouseOverviewCard (Projects desktop)
Shows a visual map of rooms with project activity colors.

### PhaseSection (Blueprint)
Sticky header with phase name, color dot, done/total count.
Collapsible (click header to toggle).

### TaskRow (Blueprint)
Checkbox + name + DIY/Pro tag + duration + cost + who + date + drag handle.
Done state: checkbox green, name strikethrough.

### ExpenseCard (Budget)
Project header with expand toggle → drawer slides open with itemized list.
Quick-add bar at drawer bottom.

### CategoryBreakdownBar (Budget desktop)
```html
<div>
  <div style="color:[cat_color]">[Category]</div>
  <div style="flex:1; height:4px; background:var(--raised)">
    <div data-w="[pct]" style="background:[cat_color]; width:0%"></div>
  </div>
  <div>[amount]</div>
  <div>[pct]%</div>
</div>
```

### MaterialItem (Materials)
Priority section header + item rows. Each row: checkbox + name + qty + source badge + project dot + needed-by + note + action buttons.

### AIMessage (Brainstorm)
```html
<div class="ai-msg">
  <div class="ai-msg-avatar">AI</div>  <!-- or "You" -->
  <div>
    <div class="ai-msg-who">Foundation AI</div>
    <div class="ai-msg-text">[message with <strong> support]</div>
    <div class="ai-msg-time">14:32</div>
  </div>
</div>
```

### TypingIndicator (Brainstorm)
```html
<div style="display:flex; gap:4px; padding:3px 0;">
  <div class="ai-typing-dot"></div>
  <div class="ai-typing-dot"></div>
  <div class="ai-typing-dot"></div>
</div>
```
```css
.ai-typing-dot {
  width:5px; height:5px; border-radius:50%; background:var(--gold);
  opacity:0.4; animation:bsTyping 1.2s infinite;
}
.ai-typing-dot:nth-child(2) { animation-delay:0.2s; }
.ai-typing-dot:nth-child(3) { animation-delay:0.4s; }
@keyframes bsTyping {
  0%,100% { opacity:0.3; transform:scale(0.8); }
  50%     { opacity:1;   transform:scale(1);   }
}
```

### LogEntry (Brainstorm)
```html
<div class="log-entry">
  <div class="log-time">14:32</div>
  <div class="log-dot" style="background:[type_color]"></div>
  <div class="log-text">
    <strong>[text]</strong>
    <span class="log-tag lt-[type]">[Type]</span>
  </div>
</div>
```
Type colors: note=blue, ai=gold, insight=purple, action=green.

### BudgetRing (Dashboard desktop, Budget desktop)
SVG donut chart. 72×72px. Gold fill for spent percentage.
```html
<svg width="72" height="72" viewBox="0 0 72 72" style="transform:rotate(-90deg)">
  <circle cx="36" cy="36" r="27" fill="none" stroke="var(--raised)" stroke-width="6"/>
  <circle cx="36" cy="36" r="27" fill="none" stroke="var(--amber)" stroke-width="6"
    stroke-dasharray="[spent_arc] [total_circ]" stroke-linecap="round"/>
</svg>
<!-- Center text positioned absolute -->
<div>[pct]%</div>
<div>Used</div>
```
Calculation: `circ = 2π × 27 ≈ 169.6`, `dash = (pct/100) × circ`

### ProgressRing (Materials desktop)
Same pattern as BudgetRing but 60×60px, r=24, stroke green-br.

---

## SVG Icon System

All icons are hand-drawn SVGs with 1.3px stroke weight. No icon fonts. No emojis.
Extract the exact SVG paths from the prototype for each icon. Key icons used:

| Icon | Used In |
|------|---------|
| House | Bottom nav, sidebar |
| Grid (4 squares) | Bottom nav, sidebar |
| Blueprint grid | Sidebar |
| Dollar circle | Bottom nav, sidebar |
| Hexagon | Bottom nav, sidebar |
| Star/spark | Sidebar brainstorm |
| Calendar | Sidebar |
| Gear | Sidebar settings |
| Bell | Dashboard notifications |
| Kitchen (burners) | Project icon |
| Fence posts | Project icon |
| Garage | Project icon |
| Diamond/logo | App logo mark |

---

## Money Formatting

```typescript
// src/lib/utils/money.ts
export function fmtMoney(n: number): string {
  if (n < 0)     return '-' + fmtMoney(-n)
  if (n < 1000)  return '$' + Math.round(n)
  if (n < 10000) return '$' + (n/1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return '$' + Math.round(n/1000) + 'k'
}
// Examples: $38, $1.2k, $12k
```

## Date Formatting

```typescript
// src/lib/utils/date.ts
export function dateLabel(date = new Date()) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  return {
    short: `${months[date.getMonth()]} ${date.getDate()}`,
    full:  `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`,
    greet: date.getHours() < 12 ? 'Good morning'
         : date.getHours() < 17 ? 'Good afternoon'
         : 'Good evening'
  }
}
```

## Project Color System

Each project gets a color from this rotation:
```typescript
const PROJECT_COLORS = [
  '#d4903a',  // amber — Kitchen
  '#7aaac8',  // blue  — Exterior/Fence
  '#d4b978',  // gold  — Hardware
  '#72b08a',  // green — Garage/Yard
  '#a07ac8',  // purple
  '#cc8888',  // red
]
// Assign: colors[projects.length % colors.length]
```
