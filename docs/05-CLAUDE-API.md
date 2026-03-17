# Foundation — Claude API Integration

## Client Setup

```typescript
// src/lib/ai/claude.ts
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 1000
```

## API Route Setup

All Claude calls go through Next.js API routes (never expose key to client):

```typescript
// src/app/api/ai/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { type, payload } = await req.json()
  
  try {
    const prompt = buildPrompt(type, payload)
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })
    
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ text })
  } catch (error) {
    return NextResponse.json({ error: 'AI unavailable' }, { status: 500 })
  }
}
```

---

## Prompt 1 — Dashboard AI Card

**Trigger:** User sends a question in the dashboard AI input, or clicks a quick-prompt chip.

**Input:**
```typescript
interface DashboardAIPayload {
  question: string
  house: {
    address: string
  }
  projects: {
    name: string
    status: string
    progress: number
    budget: number
    spent: number
  }[]
  todayItems: {
    text: string
    time: string
    type: string
  }[]
}
```

**Prompt template:**
```
You are Foundation AI for ${house.address}.

Active projects:
${projects.map(p => `- ${p.name}: ${p.progress}% complete, ${fmtMoney(p.spent)} of ${fmtMoney(p.budget)} spent`).join('\n')}

Today's schedule:
${todayItems.map(i => `- ${i.time}: ${i.text}`).join('\n')}

Be direct and specific in 2-3 sentences max. No lists. Reference specific projects and numbers when relevant.

User: ${question}
```

**Response handling:**
- Display as formatted text (convert `**bold**` → `<strong>`)
- Update the AI card message area
- Add to session if on brainstorm screen

---

## Prompt 2 — New Project Blueprint Generator

**Trigger:** User clicks "Generate Blueprint" in step 5 of the new project wizard.

**Input:**
```typescript
interface BlueprintPayload {
  room: string
  scope: string[]        // e.g. ['Paint', 'Flooring', 'Plumbing']
  budget: number
  timeline: string       // 'This weekend' | '2-4 weeks' | '1-3 months' | 'Flexible'
  diyLevel: string       // 'hands-on' | 'capable' | 'basic' | 'manager'
}
```

**Prompt template:**
```
Generate a realistic home improvement blueprint for:
Room: ${room}
Scope: ${scope.join(', ')}
Budget: $${budget}
Timeline: ${timeline}
DIY Level: ${diyLevel}

Return ONLY valid JSON, no markdown backticks, no explanation:
{
  "aiNote": "2-sentence overall guidance",
  "phases": [
    {
      "name": "Phase name",
      "color": "#hexcolor",
      "days": 2,
      "tasks": [
        {
          "name": "Specific task name",
          "dur": "2h",
          "cost": 200,
          "who": "DIY",
          "tip": "Optional pro tip (omit if not needed)"
        }
      ]
    }
  ]
}

Use realistic costs, durations, and sequences. For DIY level 'capable' or below,
add Pro tasks where professional help is advisable (plumbing, electrical, structural).
Color hex options: #d4903a (demo/rough), #7aaac8 (inspection/prep), 
#d4b978 (finishing/paint), #72b08a (install/complete), #a07ac8 (planning)
```

**Response handling:**
```typescript
// Parse JSON response
const blueprint = JSON.parse(response.text)

// Render in wizard UI
// blueprint.aiNote → display above phases
// blueprint.phases → render each as a collapsible phase section
// Each phase.tasks → render as task rows

// On save:
// 1. Create project record
// 2. For each phase: create phase record
// 3. For each task: create task record with phase_id
// 4. Redirect to /projects/[newId]/blueprint
```

---

## Prompt 3 — Brainstorm AI Coach

**Trigger:** User sends a question in brainstorm AI chat, clicks a quick-prompt, or clicks "Analyze Notes".

**Input:**
```typescript
interface BrainstormAIPayload {
  question: string
  projectName: string
  notes: string          // full notepad content
}
```

**Prompt template:**
```
You are Foundation AI, a practical home improvement coach for project: ${projectName}.
${notes ? `\nUser's brainstorm notes:\n---\n${notes}\n---\n` : ''}
Be direct and specific, under 150 words. Reference the notes when relevant.
No generic advice — only specific, actionable guidance.

User: ${question}
```

**Quick prompt expansions:**
```typescript
const QUICK_PROMPTS = {
  'Prioritize my notes':   'Read my notes and list the 3 most important things to tackle first, in order of priority.',
  'What am I missing?':    'Based on my notes, what important considerations am I not thinking about?',
  'Weekend plan':          'Based on my notes and project status, what is the most valuable thing I can accomplish this weekend?',
  'Cost check':            'Based on my notes, help me identify where I might be underestimating costs or where I could save money.',
}
```

**Analyze Notes prompt:**
```
Read my brainstorm notes and give me:
1) Top 3 priorities in order
2) One thing I might be missing
3) One specific action I can take this weekend

Notes:
---
${notes}
---

Keep each point to 1-2 sentences. Be specific to my actual notes.
```

**Response handling:**
- Add user message to chat
- Show typing indicator (3 bouncing dots)
- Stream or fetch response
- Remove typing indicator
- Add AI message to chat
- Auto-scroll to bottom
- Add "AI responded" entry to session log

---

## Prompt 4 — Blueprint AI Re-sequence *(Blueprint screen)*

**Trigger:** User clicks "AI Sequence" button in blueprint.

**Input:**
```typescript
interface ResequencePayload {
  projectName: string
  tasks: {
    id: string
    name: string
    tag: string
    phase: string
  }[]
}
```

**Prompt template:**
```
Re-sequence these tasks for ${projectName} in the optimal order for a home renovation.
Consider: safety (structural/demo before finish work), inspections before closing walls,
materials delivery lead time, and DIY vs Pro scheduling.

Tasks:
${tasks.map((t, i) => `${i+1}. [${t.phase}] ${t.name} (${t.tag})`).join('\n')}

Return JSON only:
{
  "note": "1-sentence explanation of key sequencing decision",
  "order": ["task_id_1", "task_id_2", ...]
}
```

---

## Error Handling

```typescript
// Standard error handling for all AI calls
try {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, payload }),
  })
  
  if (!response.ok) throw new Error('AI unavailable')
  const { text } = await response.json()
  
  return text
} catch (error) {
  return 'Could not reach AI. Check your connection.'
}
```

## Response Formatting

```typescript
// Convert Claude's markdown to safe HTML (limited set only)
function formatAIResponse(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
}
```

## Rate Limiting

Implement basic rate limiting on the API route:
- Max 10 requests per minute per user
- Show "Thinking..." state immediately on submit
- Disable input while request is in flight
- Re-enable input on response or error
