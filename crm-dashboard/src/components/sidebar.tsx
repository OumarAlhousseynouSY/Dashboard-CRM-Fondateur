"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Tableau de bord",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  {
    href: "/deals/new",
    label: "Nouveau deal",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/commerciaux",
    label: "Commerciaux",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
  },
  {
    href: "/secteurs",
    label: "Secteurs",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
      </svg>
    ),
  },
  {
    href: "/import",
    label: "Importer CSV",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path
          fillRule="evenodd"
          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

function NavItem({ href, label, icon, onClick }: { href: string; label: string; icon: React.ReactNode; onClick?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-150 ${
        active ? "nav-active text-white" : "hover:text-white"
      }`}
      style={{
        background: active ? "var(--sidebar-active)" : "transparent",
        color: active ? "#fff" : "var(--text-muted)",
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "var(--sidebar-hover)";
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <span style={{ color: active ? "#E05C1A" : "inherit" }}>{icon}</span>
      <span className="font-syne tracking-wide text-[13px]">{label}</span>
    </Link>
  );
}

function Initials({ email }: { email: string }) {
  const initial = email.charAt(0).toUpperCase();
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
      style={{ background: "rgba(224,92,26,0.15)", border: "1px solid rgba(224,92,26,0.3)" }}>
      <span className="text-[11px] font-syne font-semibold" style={{ color: "#E05C1A" }}>{initial}</span>
    </div>
  );
}

export default function Sidebar({ email }: { email: string }) {
  const [open, setOpen] = useState(false);

  const sidebarContent = (
    <aside
      className={`fixed md:relative inset-y-0 left-0 z-40 w-[220px] flex flex-col shrink-0 transition-transform duration-200 ease-in-out ${
        open ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
      style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
    >
      {/* Logo */}
      <div className="px-5 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "#E05C1A" }}>
            <svg viewBox="0 0 12 12" fill="white" className="w-3.5 h-3.5">
              <path d="M1 9a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H2a1 1 0 01-1-1V9zM4 6a1 1 0 011-1h1a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V6zM7 3a1 1 0 011-1h1a1 1 0 011 1v7a1 1 0 01-1 1H8a1 1 0 01-1-1V3z" />
            </svg>
          </div>
          <span className="font-syne font-semibold text-white text-[15px] tracking-wide">CRM</span>
        </div>
        <button className="md:hidden p-1 rounded" style={{ color: "var(--text-muted)" }} onClick={() => setOpen(false)}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Section label */}
      <div className="px-5 pt-5 pb-2">
        <span className="font-syne text-[10px] font-semibold tracking-[0.14em] uppercase" style={{ color: "var(--text-dim)" }}>
          Navigation
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} onClick={() => setOpen(false)} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
        <div className="flex items-center gap-3 mb-3">
          <Initials email={email} />
          <span className="text-[11px] truncate font-mono" style={{ color: "var(--text-muted)" }}>{email}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-[12px] font-syne"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--sidebar-hover)";
            (e.currentTarget as HTMLElement).style.color = "#E2E2F0";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
          }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <button
        className={`md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg text-white shadow-lg transition-opacity ${open ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        style={{ background: "var(--sidebar-bg)", border: "1px solid var(--sidebar-border)" }}
        onClick={() => setOpen(true)}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="md:hidden fixed inset-0 bg-black/70 z-30 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {sidebarContent}
    </>
  );
}
