"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppStore, Project, Task, Expense, Material, MemoryEntry } from "./types";

// ── Seed Data (mirrors the prototype STORE) ────────────────────────────────

const DEFAULT_STORE: AppStore = {
    house: {
        address: "147 Birchwood Lane",
        city: "Austin",
        state: "TX",
        yearBuilt: 1987,
        sqft: 2340,
        ownership: "own",
        style: "Craftsman",
        rooms: ["Kitchen", "Master Bath", "Living Room", "Garage", "Backyard"],
    },
    users: [
        { name: "Leo", diyLevel: "hands-on" },
        { name: "Maya", diyLevel: "capable" },
    ],
    projects: [
        {
            id: "kitchen",
            name: "Kitchen Refresh",
            room: "Kitchen",
            color: "#d4b978",
            progress: 38,
            budget: 18500,
            spent: 7040,
            tasksTotal: 24,
            tasksDone: 9,
            status: "active",
            daysLeft: 14,
            nextTask: "Install under-cabinet lighting",
            nextDate: "Mar 18",
        },
        {
            id: "bath",
            name: "Master Bath Reno",
            room: "Master Bath",
            color: "#7aaac8",
            progress: 12,
            budget: 22000,
            spent: 2640,
            tasksTotal: 31,
            tasksDone: 4,
            status: "active",
            daysLeft: 42,
            nextTask: "Approve tile selection",
            nextDate: "Mar 20",
        },
        {
            id: "deck",
            name: "Deck Build",
            room: "Backyard",
            color: "#72b08a",
            progress: 0,
            budget: 9800,
            spent: 0,
            tasksTotal: 18,
            tasksDone: 0,
            status: "planning",
            daysLeft: null,
            nextTask: "Pull permits",
            nextDate: null,
        },
    ],
    tasks: [
        { id: 1, name: "Install under-cabinet lighting", proj: "kitchen", projColor: "#d4b978", phase: "finish", who: "Leo", date: "Mar 18", dur: "3h", cost: 280, tag: "DIY", done: false },
        { id: 2, name: "Paint cabinet interiors", proj: "kitchen", projColor: "#d4b978", phase: "finish", who: "Both", date: "Mar 19", dur: "4h", cost: 60, tag: "DIY", done: false },
        { id: 3, name: "Approve tile selection", proj: "bath", projColor: "#7aaac8", phase: "demo", who: "Both", date: "Mar 20", dur: "1h", cost: 0, tag: "DIY", done: false },
        { id: 4, name: "Demo old vanity", proj: "bath", projColor: "#7aaac8", phase: "demo", who: "Leo", date: "Mar 22", dur: "2h", cost: 0, tag: "DIY", done: false },
        { id: 5, name: "Order shower fixtures", proj: "bath", projColor: "#7aaac8", phase: "frame", who: "Maya", date: "Mar 21", dur: "30m", cost: 1200, tag: "DIY", done: false },
        { id: 6, name: "Pull permits for deck", proj: "deck", projColor: "#72b08a", phase: "inspect", who: "Leo", date: "Apr 1", dur: "1h", cost: 150, tag: "DIY", done: false },
        { id: 7, name: "Install new cabinet pulls", proj: "kitchen", projColor: "#d4b978", phase: "finish", who: "Both", date: "Mar 25", dur: "2h", cost: 120, tag: "DIY", done: true },
        { id: 8, name: "Grout kitchen backsplash", proj: "kitchen", projColor: "#d4b978", phase: "finish", who: "Leo", date: "Mar 16", dur: "3h", cost: 0, tag: "DIY", done: true },
    ],
    expenses: [
        { id: 1, desc: "Cabinet hardware — Rejuvenation", amount: 340, cat: "fixtures", who: "Maya", date: "Mar 10", projId: "kitchen" },
        { id: 2, desc: "LED strip lighting — Amazon", amount: 280, cat: "materials", who: "Leo", date: "Mar 12", projId: "kitchen" },
        { id: 3, desc: "Tile samples — Tile Shop", amount: 85, cat: "materials", who: "Both", date: "Mar 13", projId: "bath" },
        { id: 4, desc: "Plumber consult — Castro Plumbing", amount: 175, cat: "labor", who: "Leo", date: "Mar 14", projId: "bath" },
        { id: 5, desc: "Paint — Benjamin Moore", amount: 210, cat: "materials", who: "Maya", date: "Mar 9", projId: "kitchen" },
    ],
    materials: [
        { id: 1, name: "Quartz countertop — Calacatta Laza", price: 4200, qty: "42 sq ft", proj: "kitchen", source: "local", priority: "urgent", by: "Mar 20", note: "Confirm edge profile", done: false },
        { id: 2, name: "Subway tile 3×6 White — 150 sf", price: 320, qty: "150 sf", proj: "bath", source: "hd", priority: "needed", by: "Mar 22", note: "Add 15% overage", done: false },
        { id: 3, name: "LED under-cabinet strips (10pk)", price: 89, qty: "10 pack", proj: "kitchen", source: "amazon", priority: "urgent", by: "Mar 17", note: "Warm white 2700K", done: false },
        { id: 4, name: "Matte black shower fixtures set", price: 1200, qty: "1 set", proj: "bath", source: "amazon", priority: "needed", by: "Mar 25", note: "Kohler Purist series", done: false },
        { id: 5, name: "Composite decking boards", price: 2800, qty: "360 lf", proj: "deck", source: "lowes", priority: "planned", by: "Apr 5", note: "Trex Transcend Lineage", done: false },
    ],
    phases: [
        { id: "demo", name: "Demo", color: "#cc8888", taskIds: [3, 4] },
        { id: "frame", name: "Framing", color: "#d4903a", taskIds: [5, 6] },
        { id: "finish", name: "Finishing", color: "#72b08a", taskIds: [1, 2, 7, 8] },
        { id: "inspect", name: "Inspect", color: "#7aaac8", taskIds: [] },
    ],
    memory: {
        Kitchen: {
            totalSpent: 4750,
            projectCount: 2,
            lastWork: "Mar 2025",
            entries: [
                { id: 201, roomId: "Kitchen", date: "Mar 2025", title: "Kitchen Remodel - Phase 1", desc: "Demo complete, rough-in plumbing done. Cabinets on order from IKEA. Backsplash tile selected: Calacatta marble look.", cost: 2840, tags: ["permit", "labor"], products: ["IKEA SEKTION cabinets", "GE Profile appliances", "Calacatta tile - Floor & Decor"] },
                { id: 202, roomId: "Kitchen", date: "Feb 2025", title: "Under-cabinet lighting install", desc: "Added LED strip lighting beneath all upper cabinets. 2700K warm white. Hardwired to dedicated switch.", cost: 145, tags: ["product"], products: ["Govee LED strip 12ft warm white"] },
                { id: 203, roomId: "Kitchen", date: "Jan 2025", title: "Faucet replacement", desc: "Replaced original 1987 faucet with Moen Arbor pull-down. Took 2 hours. Shutoff valves also replaced.", cost: 218, tags: ["product", "warranty"], products: ["Moen Arbor 7594ESRS - 5yr warranty expires Jan 2030"] },
                { id: 204, roomId: "Kitchen", date: "Oct 2022", title: "Dishwasher replaced", desc: "Original dishwasher failed after 35 years. Replaced with Bosch 500 series. Professional install.", cost: 1100, tags: ["product", "warranty"], products: ["Bosch SHPM65Z55N - warranty expires Oct 2024"] }
            ],
            products: [
                { name: "IKEA SEKTION Upper Cabinets", brand: "IKEA", tags: ["current"] },
                { name: "Moen Arbor Pull-Down Faucet", brand: "Moen", tags: ["warranty", "expires Jan 2030"] },
                { name: "Bosch 500 Series Dishwasher", brand: "Bosch", tags: ["product", "warranty expired"] }
            ]
        },
        "Master Bath": {
            totalSpent: 38,
            projectCount: 1,
            lastWork: "Feb 2025",
            entries: [
                { id: 205, roomId: "Master Bath", date: "Feb 2025", title: "Recaulk around tub and shower", desc: "Removed old silicone caulk along tub surround and shower base. Applied GE Silicone II in white. 24hr dry time.", cost: 38, tags: ["product"], products: ["GE Silicone II White - Home Depot $12"] },
                { id: 206, roomId: "Master Bath", date: "Jun 2021", title: "Toilet replaced", desc: "Original toilet replaced with Kohler Cimarron elongated. Upgraded to soft-close seat. Water savings noticeable.", cost: 380, tags: ["product", "warranty"], products: ["Kohler Cimarron K-3609 - 1yr parts warranty"] }
            ],
            products: [
                { name: "Kohler Cimarron Toilet", brand: "Kohler", tags: ["installed Jun 2021"] },
                { name: "GE Silicone II Caulk", brand: "GE", tags: ["applied Feb 2025"] }
            ]
        },
        "Living Room": {
            totalSpent: 980,
            projectCount: 1,
            lastWork: "Mar 2025",
            entries: [
                { id: 207, roomId: "Living Room", date: "Mar 2025", title: "Living Room Refresh - flooring sanded", desc: "Refinished original hardwood floors. Sanded to bare wood, applied 2 coats Bona Traffic HD semi-gloss. Color is natural oak.", cost: 680, tags: ["product", "labor"], products: ["Bona Traffic HD Semi-Gloss", "Varathane Early American stain"] },
                { id: 208, roomId: "Living Room", date: "Mar 2025", title: "Paint color selected", desc: "SW Repose Gray 7015 confirmed for accent wall. Existing walls remain Swiss Coffee. Paint day scheduled Mar 28.", cost: 0, tags: [], products: [] }
            ],
            products: [
                { name: "Bona Traffic HD Finish", brand: "Bona", tags: ["applied Mar 2025"] },
                { name: "SW Repose Gray 7015", brand: "Sherwin-Williams", tags: ["accent wall - pending"] }
            ]
        },
        Garage: {
            totalSpent: 0,
            projectCount: 1,
            lastWork: "Planning",
            entries: [{ id: 209, roomId: "Garage", date: "Mar 2025", title: "Garage ADU conversion - planning", desc: "Researching permit requirements for full ADU conversion. Pulled zoning rules from city website. Structural assessment needed before proceeding.", cost: 0, tags: ["permit"], products: [] }],
            products: []
        },
        Backyard: {
            totalSpent: 4265,
            projectCount: 1,
            lastWork: "Mar 2025",
            entries: [
                { id: 210, roomId: "Backyard", date: "Mar 2025", title: "Back fence repaint started", desc: "Sanded all fence panels with medium-grit sponges. First coat of Behr Solid Stain Cordovan Brown applied to south and east panels. North panels pending.", cost: 65, tags: ["product"], products: ["Behr Solid Stain Cordovan Brown - Home Depot"] },
                { id: 211, roomId: "Backyard", date: "Sep 2023", title: "Front exterior paint", desc: "Full exterior paint. SW Accessible Beige body, SW Mindful Gray trim, SW Black Magic shutters. Contractor: Lopez Painting.", cost: 4200, tags: ["labor"], products: ["SW Accessible Beige 7036", "SW Mindful Gray 7016", "SW Black Magic 6991"] }
            ],
            products: [
                { name: "Behr Solid Stain - Cordovan Brown", brand: "Behr", tags: ["in progress"] },
                { name: "SW Accessible Beige 7036", brand: "Sherwin-Williams", tags: ["exterior body - 2023"] }
            ]
        }
    }
};

// ── Store Interface ────────────────────────────────────────────────────────

interface FoundationState extends AppStore {
    // Project actions
    addProject: (p: Project) => void;
    updateProject: (id: string, updates: Partial<Project>) => void;

    // Task actions
    addTask: (t: Task) => void;
    toggleTask: (id: number) => void;

    // Expense actions
    addExpense: (e: Expense) => void;

    // Material actions
    addMaterial: (m: Material) => void;
    toggleMaterial: (id: number) => void;

    // Memory actions
    addMemoryEntry: (roomId: string, entry: Omit<MemoryEntry, "id">) => void;
}

export const useStore = create<FoundationState>()(
    persist(
        (set) => ({
            ...DEFAULT_STORE,

            addProject: (p) =>
                set((s) => ({ projects: [...s.projects, p] })),

            updateProject: (id, updates) =>
                set((s) => ({
                    projects: s.projects.map((p) =>
                        p.id === id ? { ...p, ...updates } : p
                    ),
                })),

            addTask: (t) =>
                set((s) => ({
                    tasks: [...s.tasks, t],
                    projects: s.projects.map((p) =>
                        p.id === t.proj
                            ? { ...p, tasksTotal: p.tasksTotal + 1 }
                            : p
                    ),
                })),

            toggleTask: (id) =>
                set((s) => {
                    const task = s.tasks.find((t) => t.id === id);
                    if (!task) return s;
                    const wasDone = task.done;
                    const newTasks = s.tasks.map((t) =>
                        t.id === id ? { ...t, done: !t.done } : t
                    );
                    const projects = s.projects.map((p) => {
                        if (p.id !== task.proj) return p;
                        const tasksDone = newTasks.filter(
                            (t) => t.proj === p.id && t.done
                        ).length;
                        const progress = Math.round((tasksDone / p.tasksTotal) * 100);
                        return { ...p, tasksDone, progress };
                    });
                    return { tasks: newTasks, projects };
                }),

            addExpense: (e) =>
                set((s) => ({
                    expenses: [...s.expenses, e],
                    projects: e.projId
                        ? s.projects.map((p) =>
                            p.id === e.projId ? { ...p, spent: p.spent + e.amount } : p
                        )
                        : s.projects,
                })),

            addMaterial: (m) =>
                set((s) => ({ materials: [...s.materials, m] })),

            toggleMaterial: (id) =>
                set((s) => ({
                    materials: s.materials.map((m) =>
                        m.id === id ? { ...m, done: !m.done } : m
                    ),
                })),

            addMemoryEntry: (roomId, entry) =>
                set((s) => {
                    const roomMem = s.memory[roomId] || {
                        totalSpent: 0,
                        projectCount: 0,
                        lastWork: "Never",
                        entries: [],
                        products: []
                    };
                    const newEntry = { ...entry, id: Date.now() };
                    return {
                        memory: {
                            ...s.memory,
                            [roomId]: {
                                ...roomMem,
                                entries: [newEntry, ...roomMem.entries],
                                totalSpent: roomMem.totalSpent + (entry.cost || 0),
                                lastWork: entry.date
                            }
                        }
                    };
                }),
        }),
        {
            name: "foundation-store",
        }
    )
);

// ── Helpers ────────────────────────────────────────────────────────────────

export function fmtMoney(n: number): string {
    if (n < 1000) return `$${Math.round(n)}`;
    if (n < 10000) return `$${(n / 1000).toFixed(1)}k`;
    return `$${Math.round(n / 1000)}k`;
}
