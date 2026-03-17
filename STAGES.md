# STAGES.md

## Purpose
Defines the lifecycle stages of this project so both humans and AI agents can evaluate progress consistently.

---

## 1. Idea
- Concept only
- No working code
- May include notes or designs

---

## 2. Prototype
- Basic UI or scripts exist
- May use mock or static data
- Core idea is demonstrated
- Not stable or complete
- *Note: `screens/` directory contains full HTML prototypes.*

---

## 3. Local Development (CURRENT STAGE)
- [x] App runs locally (Next.js 14 App Router)
- [x] Frontend shell exists and matches prototype
- [x] Local state management implemented (Zustand + Persist)
- [ ] Backend (Supabase) fully connected
- [ ] Features may be incomplete
- [ ] No deployment or sharing yet

---

## 4. Pre-MVP
- Core flow is partially working
- Real data may be used (Supabase connected)
- Some features still missing or unreliable
- Integration gaps may exist

---

## 5. MVP Ready
- One complete core user flow works end-to-end (Onboarding → Project → Blueprint → Execution)
- Real data persistence in place (Auth + Database)
- App can be deployed or shared
- Basic error handling exists
- Known issues documented

---

## 6. Post-MVP / Beta
- Multiple users can use the system (Partner sync active)
- Feedback loop implemented
- Bugs being fixed actively
- Performance not fully optimized

---

## 7. Production Ready
- Stable and reliable
- Deployed in live environment (Vercel)
- Monitoring/logging in place
- Security considerations implemented (RLS policies)
- Scalable architecture begins

---

## Stage Progression Rule

A project is considered in a stage ONLY if:
- All requirements of that stage are met
- And most requirements of the previous stage are stable

---

## Notes for AI Agents

When evaluating stage:
- Prioritize **core flow completeness**
- Do NOT overvalue UI or design
- Penalize broken or missing integrations
- Deployment readiness is required for MVP Ready
