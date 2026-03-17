// ── Core Entity Types ──────────────────────────────────────────────────────

export type ProjectStatus = "active" | "planning" | "paused" | "done";
export type TaskTag = "DIY" | "Pro";
export type DiyLevel = "hands-on" | "capable" | "basic" | "manager";
export type MaterialSource = "amazon" | "hd" | "lowes" | "local" | "other";
export type MaterialPriority = "urgent" | "needed" | "planned" | "optional";
export type ExpenseCategory =
    | "materials"
    | "labor"
    | "tools"
    | "fixtures"
    | "permits"
    | "other";

export interface Project {
    id: string;
    name: string;
    room: string;
    color: string; // hex accent color
    progress: number; // 0–100
    budget: number;
    spent: number;
    tasksTotal: number;
    tasksDone: number;
    status: ProjectStatus;
    daysLeft: number | null;
    nextTask: string | null;
    nextDate: string | null;
}

export interface Task {
    id: number;
    name: string;
    proj: string; // project id
    projName?: string;
    projColor: string;
    phase: string; // phase id
    who: string; // 'Leo' | 'Both' | 'Pro'
    date: string;
    dur: string; // '2h', '30m', '1d'
    cost: number;
    tag: TaskTag;
    done: boolean;
    tip?: string;
}

export interface Expense {
    id: number;
    desc: string;
    amount: number;
    cat: ExpenseCategory;
    who: string;
    date: string;
    projId?: string;
}

export interface Material {
    id: number;
    name: string;
    price: number;
    qty: string;
    proj: string; // project id
    projName?: string;
    projColor?: string;
    source: MaterialSource;
    priority: MaterialPriority;
    by: string;
    note: string;
    done: boolean;
}

export interface Phase {
    id: string;
    name: string;
    color: string;
    taskIds: number[];
}

export interface HouseProfile {
    address: string;
    city: string;
    state: string;
    yearBuilt: number;
    sqft: number;
    ownership: "own" | "rent";
    style: string;
    rooms: string[];
}

export interface UserProfile {
    name: string;
    diyLevel: DiyLevel;
    avatar?: string;
}

export interface BrainstormSession {
    id: string;
    projId: string;
    notes: string;
    createdAt: string;
}

// ── Blueprint AI Response ──────────────────────────────────────────────────

export interface BlueprintPhase {
    id: string;
    name: string;
    days: number;
    tasks: {
        name: string;
        dur: string;
        cost: number;
        who: string;
        tip?: string;
    }[];
}

export interface BlueprintResponse {
    aiNote: string;
    phases: BlueprintPhase[];
}

// ── Store State ────────────────────────────────────────────────────────────

export interface ProductReference {
    name: string;
    brand: string;
    tags: string[];
}

export interface MemoryEntry {
    id: number;
    roomId: string; // "kitchen", etc.
    date: string;
    title: string;
    desc: string;
    cost: number;
    tags: string[];
    products: string[];
}

export interface AppStore {
    house: HouseProfile;
    users: UserProfile[];
    projects: Project[];
    tasks: Task[];
    expenses: Expense[];
    materials: Material[];
    phases: Phase[];
    memory: Record<string, {
        totalSpent: number;
        projectCount: number;
        lastWork: string;
        entries: MemoryEntry[];
        products: ProductReference[];
    }>;
}
