# Foundation — Client State (Zustand Store)

The prototype uses a single `STORE` object. In production, mirror this with
Zustand. Server state (DB data) uses Supabase queries. This store handles
UI state and optimistic updates.

## Store Definition

```typescript
// src/lib/store/useStore.ts
import { create } from 'zustand'
import { Project, Task, Expense, Material, Phase } from '@/lib/db/types'

interface AppStore {
  // Navigation
  activeScreen:    string
  activeProjectId: string | null
  viewMode:        'mobile' | 'desktop'

  // UI State
  bgFilter:        string        // budget filter: 'all' | project_id
  pjFilter:        string        // projects filter: 'all' | status
  mtFilter:        string        // materials filter: 'all' | 'pending' | 'done' | project_id
  mtQuery:         string        // materials search query
  openDrawer:      string | null // budget expense drawer: project_id | null
  bsActiveTab:     'notes' | 'ai' | 'log'

  // Optimistic task state (before DB confirms)
  tasksDone:       Record<string, boolean>

  // Brainstorm
  bsMsgs:          BsMessage[]
  bsLog:           BsLogEntry[]

  // Actions
  setActiveScreen:    (screen: string) => void
  setActiveProjectId: (id: string) => void
  setViewMode:        (mode: 'mobile' | 'desktop') => void
  setBgFilter:        (f: string) => void
  setPjFilter:        (f: string) => void
  setMtFilter:        (f: string) => void
  setMtQuery:         (q: string) => void
  setOpenDrawer:      (id: string | null) => void
  setBsActiveTab:     (tab: 'notes' | 'ai' | 'log') => void
  toggleTaskOptimistic: (taskId: string) => void
  addBsMsg:           (msg: BsMessage) => void
  addBsLogEntry:      (entry: BsLogEntry) => void
  clearBsLog:         () => void
}

interface BsMessage {
  role:  'user' | 'ai' | 'typing'
  text:  string
  time:  string
}

interface BsLogEntry {
  text: string
  type: 'note' | 'ai' | 'insight' | 'action'
  time: string
}

export const useStore = create<AppStore>((set) => ({
  activeScreen:    'dashboard',
  activeProjectId: null,
  viewMode:        'mobile',
  bgFilter:        'all',
  pjFilter:        'all',
  mtFilter:        'all',
  mtQuery:         '',
  openDrawer:      null,
  bsActiveTab:     'notes',
  tasksDone:       {},
  bsMsgs:          [],
  bsLog:           [],

  setActiveScreen:    (screen) => set({ activeScreen: screen }),
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  setViewMode:        (mode) => set({ viewMode: mode }),
  setBgFilter:        (f) => set({ bgFilter: f }),
  setPjFilter:        (f) => set({ pjFilter: f }),
  setMtFilter:        (f) => set({ mtFilter: f }),
  setMtQuery:         (q) => set({ mtQuery: q }),
  setOpenDrawer:      (id) => set({ openDrawer: id }),
  setBsActiveTab:     (tab) => set({ bsActiveTab: tab }),

  toggleTaskOptimistic: (taskId) => set((state) => ({
    tasksDone: {
      ...state.tasksDone,
      [taskId]: !state.tasksDone[taskId],
    }
  })),

  addBsMsg: (msg) => set((state) => ({
    bsMsgs: [...state.bsMsgs, msg]
  })),

  addBsLogEntry: (entry) => set((state) => ({
    bsLog: [entry, ...state.bsLog]
  })),

  clearBsLog: () => set({ bsLog: [] }),
}))
```

## Cross-Screen Sync Pattern

When a task is toggled (checked/unchecked), the update must propagate to:
- Dashboard task list
- Blueprint task list
- Project card progress bars
- Dashboard stat tiles

Use optimistic updates + Supabase real-time:

```typescript
// hooks/useToggleTask.ts
export function useToggleTask() {
  const { toggleTaskOptimistic } = useStore()
  const supabase = useSupabase()

  return async (taskId: string, currentDone: boolean) => {
    // 1. Update local state immediately (optimistic)
    toggleTaskOptimistic(taskId)

    // 2. Sync to DB
    const { error } = await supabase
      .from('tasks')
      .update({ done: !currentDone })
      .eq('id', taskId)

    // 3. If DB fails, roll back
    if (error) {
      toggleTaskOptimistic(taskId)  // toggle back
      showToast('Failed to update task')
    }
    // 4. Supabase real-time subscription fires on other devices automatically
  }
}
```

## Project Progress Computation

```typescript
// Compute project stats from tasks — do this in queries, not in components
export function computeProjectStats(project: Project, tasks: Task[], expenses: Expense[]) {
  const projectTasks = tasks.filter(t => t.project_id === project.id)
  const doneTasks    = projectTasks.filter(t => t.done)
  const spent        = expenses.filter(e => e.project_id === project.id)
                              .reduce((a, e) => a + Number(e.amount), 0)

  return {
    ...project,
    tasks_total: projectTasks.length,
    tasks_done:  doneTasks.length,
    progress:    projectTasks.length > 0
                   ? Math.round(doneTasks.length / projectTasks.length * 100)
                   : 0,
    spent,
    next_task:   projectTasks.find(t => !t.done)?.name ?? null,
  }
}
```
