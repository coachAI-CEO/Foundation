# GTM_READINESS.md

## Purpose
Defines readiness for distribution, marketing, and user acquisition.
This layer determines if the product is ready to be seen, shared, and adopted.

---

## 1. Domain & Access

- [ ] **Domain secured**: Need to secure `foundation-app.com` or similar.
- [x] **App accessible via public URL**: Code is on GitHub (private/public depending on repo setting).
- [ ] **SSL / HTTPS enabled**: Pending Vercel/Cloudflare deployment.
- [ ] **Clean, shareable link**: Needs a production URL.

---

## 2. Positioning (CRITICAL)

- [x] **Clear one-liner**: "Home improvement planning for couples."
- [x] **Target user defined**: Homeowning couples managing multi-step renovations.
- [x] **Core problem clearly stated**: Fragmentation of planning tools resulting in stress and overspending.
- [x] **Why this is better/different**: Unified tracking + Gemini-powered blueprints designed for collaborative use.

---

## 3. Landing Presence

- [ ] **Landing page exists**: Currently users land directly in the App/Onboarding. Need a public marketing page.
- [ ] **Explains product in <10 seconds**: Needs a high-conversion landing page.
- [ ] **Clear CTA**: Needs "Join Waitlist" or "Get Started."
- [ ] **Basic visuals or screenshots**: Have them in the `docs`, need to move to landing page.

---

## 4. Social Presence (Optional Early)

- [ ] **Twitter/X account created**
- [ ] **LinkedIn page created**
- [ ] **Username consistent with brand**
- [ ] **Bio aligned with positioning**

---

## 5. Content / Messaging

- [ ] **2–3 posts explaining the product**
- [ ] **Demo or walkthrough ready**: The HTML prototype acts as a perfect interactive demo.
- [ ] **Simple pitch ready**: Ready in `PROJECT_GOALS.md`.
- [ ] **Problem → Solution narrative clear**.

---

## 6. Outreach Readiness

- [ ] **List of target users or testers**
- [ ] **Message template for outreach**
- [ ] **Ability to onboard users manually**
- [ ] **Feedback capture method ready**

---

## 7. Feedback Loop (IMPORTANT)

- [ ] **Users can give feedback**: Need to add a "Feedback" button or AI-prompted survey.
- [ ] **You can observe usage**: Need PostHog or Umami analytics.
- [ ] **Issues can be tracked**: GitHub Issues are active.
- [ ] **Iteration cycle defined**.

---

## 8. GTM Readiness Levels

### Level 1 — Shareable (CURRENT STATUS)
- [x] Public URL exists (GitHub)
- [x] Can send code/prototypes to individuals
- [ ] No structured outreach

---

## Notes for AI Agents

- **Do NOT recommend GTM before core flow works**: Focus on finishing the Supabase integration first.
- **Prioritize positioning**: Use the "Foundation" brand voice — professional, architectural, and reliable.
- **Flag Early Sharing**: If the backend/auth isn't stable, do not recommend a public launch.
