"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("L'email et le mot de passe sont requis.");
      return;
    }
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  const inputStyle = {
    background: "var(--bg-card)",
    border: "1px solid var(--border-card)",
    color: "var(--text-primary)",
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-main)" }}>
      {/* Left panel — brand */}
      <div
        className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col justify-between p-10 shrink-0"
        style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "#E05C1A" }}>
            <svg viewBox="0 0 12 12" fill="white" className="w-4 h-4">
              <path d="M1 9a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H2a1 1 0 01-1-1V9zM4 6a1 1 0 011-1h1a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V6zM7 3a1 1 0 011-1h1a1 1 0 011 1v7a1 1 0 01-1 1H8a1 1 0 01-1-1V3z" />
            </svg>
          </div>
          <span className="font-syne font-semibold text-white text-[16px] tracking-wide">CRM</span>
        </div>

        {/* Center — headline */}
        <div className="space-y-5">
          <h1
            className="font-syne font-bold text-white leading-[1.15]"
            style={{ fontSize: "clamp(28px, 3vw, 40px)" }}
          >
            Pilotez votre
            <br />
            <span style={{ color: "#E05C1A" }}>pipeline</span>
            <br />
            en temps réel.
          </h1>
          <p className="font-syne text-[13px] leading-relaxed max-w-xs" style={{ color: "var(--text-muted)" }}>
            Accès réservé. Toutes les données restent sécurisées sur votre compte.
          </p>
        </div>

        {/* Bottom — decorative stats */}
        <div className="flex gap-8">
          {[
            { label: "KPIs", value: "5" },
            { label: "Vues", value: "4" },
            { label: "Import CSV", value: "✓" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-mono text-white text-lg font-medium">{stat.value}</p>
              <p className="font-syne text-[10px] tracking-widest uppercase" style={{ color: "var(--text-dim)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "#E05C1A" }}>
              <svg viewBox="0 0 12 12" fill="white" className="w-3.5 h-3.5">
                <path d="M1 9a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H2a1 1 0 01-1-1V9zM4 6a1 1 0 011-1h1a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V6zM7 3a1 1 0 011-1h1a1 1 0 011 1v7a1 1 0 01-1 1H8a1 1 0 01-1-1V3z" />
              </svg>
            </div>
            <span className="font-syne font-semibold text-[15px]" style={{ color: "var(--text-primary)" }}>CRM Dashboard</span>
          </div>

          <div>
            <h2 className="font-syne font-bold text-[22px] tracking-tight" style={{ color: "var(--text-primary)" }}>
              Connexion
            </h2>
            <p className="font-syne text-[13px] mt-1" style={{ color: "var(--text-muted)" }}>
              Accès administrateur uniquement.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block font-syne text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color: "var(--text-secondary)" }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@crm.local"
                autoComplete="email"
                required
                className="w-full px-4 py-2.5 rounded-lg font-mono text-sm placeholder:text-[#3A3A5C] outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#E05C1A")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-card)")}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block font-syne text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color: "var(--text-secondary)" }}>
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full px-4 py-2.5 rounded-lg font-mono text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#E05C1A")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-card)")}
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg flex items-center gap-2" style={{ background: "rgba(224,92,26,0.1)", border: "1px solid rgba(224,92,26,0.25)" }}>
                <svg viewBox="0 0 20 20" fill="#E05C1A" className="w-4 h-4 shrink-0">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="font-syne text-[12px]" style={{ color: "#F59E60" }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-syne font-semibold text-[13px] tracking-wide text-white transition-all disabled:opacity-60"
              style={{ background: "#E05C1A" }}
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
