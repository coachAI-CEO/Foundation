"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
    {
        href: "/",
        label: "Dashboard",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
        ),
    },
    {
        href: "/projects",
        label: "Projects",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 7a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" />
            </svg>
        ),
    },
    {
        href: "/blueprint",
        label: "Blueprint",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="9" y1="16" x2="13" y2="16" />
            </svg>
        ),
    },
    {
        href: "/budget",
        label: "Budget",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M15 9.354a4 4 0 1 0 0 5.292" />
            </svg>
        ),
    },
    {
        href: "/materials",
        label: "Materials",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21 16-4 4-4-4" />
                <path d="M17 20V4" />
                <path d="m3 8 4-4 4 4" />
                <path d="M7 4v16" />
            </svg>
        ),
    },
    {
        href: "/brainstorm",
        label: "Brainstorm",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <circle cx="12" cy="12" r="9" />
                <path d="M12 17h.01" />
            </svg>
        ),
    },
    {
        href: "/calendar",
        label: "Calendar",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        ),
    },
    {
        href: "/vision",
        label: "Vision Studio",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 8h.01" />
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="m4 15 4-4 3 3 5-5 4 4" />
            </svg>
        ),
    },
];

export function Sidebar() {
    const path = usePathname();

    return (
        <nav className="d-sidebar" aria-label="Main navigation">
            {/* Brand mark */}
            <div style={{ marginBottom: 12 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "var(--gold-dim)", border: "1px solid var(--border-warm)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <polygon points="12,2 22,20 2,20" fill="var(--gold)" opacity="0.9" />
                    </svg>
                </div>
            </div>

            {NAV.map((item) => {
                const isActive = item.href === "/" ? path === "/" : path.startsWith(item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`d-nav-item ${isActive ? "active" : ""}`}
                        aria-label={item.label}
                        aria-current={isActive ? "page" : undefined}
                    >
                        {item.icon}
                        <span className="d-tooltip">{item.label}</span>
                    </Link>
                );
            })}

            <div className="d-sidebar-bot">
                {/* Notification Tray */}
                <div style={{ position: "relative" }}>
                    <button className="d-nav-item" aria-label="Notifications" style={{ background: "none", border: "none" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <span className="d-tooltip">Inbox</span>
                        {/* Notify dot */}
                        <div style={{ position: "absolute", top: 10, right: 10, width: 7, height: 7, background: "var(--red-br)", borderRadius: "50%", border: "1.5px solid var(--base)" }} />
                    </button>
                </div>

                <Link href="/settings" className="d-nav-item" aria-label="Settings">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    <span className="d-tooltip">Settings</span>
                </Link>
                <div className="d-avatar" aria-label="User profile">LM</div>
            </div>
        </nav>
    );
}

export function MobileNav() {
    const path = usePathname();

    const MOBILE_NAV = NAV.slice(0, 4);

    return (
        <nav className="m-bottom-nav" aria-label="Mobile navigation">
            {MOBILE_NAV.map((item) => {
                const isActive = item.href === "/" ? path === "/" : path.startsWith(item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`m-nav-item ${isActive ? "active" : ""}`}
                        aria-label={item.label}
                        aria-current={isActive ? "page" : undefined}
                    >
                        <span className="m-nav-icon" style={{ color: isActive ? "var(--gold)" : undefined }}>
                            {item.icon}
                        </span>
                        <span className="m-nav-label" style={{ color: isActive ? "var(--gold)" : undefined }}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}

            {/* FAB for New Project */}
            <Link href="/new-project" className="m-fab" aria-label="New project">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            </Link>
        </nav>
    );
}
