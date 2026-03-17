# BRAND_READINESS.md

## Purpose
Defines the visual and presentation readiness of the product.
This is NOT required for MVP functionality, but impacts trust, usability, and shareability.

---

## 1. Brand Identity

- [x] **Logo exists**: SVG geometric mark used throughout the prototype.
- [x] **Logo works on light and dark backgrounds**: Optimized for the signature "Void" dark theme.
- [x] **Simple brand mark/icon available**: Consistent geometric set for dashboard tiles.
- [x] **Name is consistent across app**: "Foundation" by Ascension.

---

## 2. Visual System

- [x] **Primary color defined**: Gold accent (`#d4b978`).
- [x] **Background colors defined**: Void (`#0b0b0c`) and Base (`#111113`).
- [x] **Text colors readable and consistent**: White (`#ede9e3`), Soft (`#8a8478`), Muted (`#5c5850`).
- [x] **Basic spacing system**: Strict adherence to the 0.32s animation and layout grid from the prototype.

---

## 3. UI Consistency

- [x] **Buttons look consistent**: Gold primary buttons and tinted secondary tabs.
- [x] **Inputs/forms styled consistently**: Custom styled for dark mode with gold-tinted borders.
- [x] **Cards/containers follow same pattern**: Reusable `--card` and `--raised` elevations.
- [x] **No broken or default browser styles**: Custom CSS resets and typography (`Cinzel` / `DM Sans`).

---

## 4. Landing / Entry Experience

- [x] **Landing page OR clear entry screen exists**: Dashboard serves as the "Command Center."
- [x] **User understands what the app does in <10 seconds**: High-impact "Complete Your Home Profile" and active project tiles.
- [ ] **Clear CTA (Call To Action)**: "New Project" is the primary action, but could be reinforced.
- [x] **No confusion on where to start**: Onboarding flow is built to guide new users.

---

## 5. Product Credibility

- [x] **App does not look broken**: High-fidelity prototype gives it a premium feel.
- [x] **No placeholder text**: Current seed data uses realistic Austin-based renovation scenarios.
- [x] **No obvious UI bugs**: CSS transitions and mobile shell are stable.
- [x] **Basic loading states exist**: AI input fields include "Thinking..." states.

---

## 6. Shareability (Important)

- [ ] **Can send link to someone**: Currently private/manual (needs Vercel deployment).
- [x] **First impression is clear**: The "Cinzel" typography creates a premium architectural feel instantly.
- [x] **Screenshot looks presentable**: Desktop and mobile layouts are both high-fidelity.
- [ ] **Works on common screen sizes**: Responsive between mobile shell and desktop sidebar (Stage: Testing).

---

## 7. Brand Readiness Levels

### Level 3 — Polished (CURRENT STATUS)
- [x] Strong visual identity
- [x] Smooth interactions
- [x] Consistent design system

*Note: While functionality is MVP/Local, the brand readiness is extremely high because it was built from a pixel-perfect design system from day one.*

---

## Notes for AI Agents

- **Do NOT block MVP on branding**: The brand is already baked into the CSS variables.
- **Maintain Typography**: Always use `Cinzel` for headings and `DM Sans` for body.
- **Preserve the "Void"**: Ensure all new screens maintain the `#0b0b0c` background to keep the premium feel.
