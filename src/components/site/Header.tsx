import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";

const nav = [
  { to: "/", label: "Home" },
  { to: "/prompt-library", label: "Prompt Library" },
  { to: "/ai-news", label: "AI News" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initials =
    (profile?.full_name || user?.email || "?")
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    navigate({ to: "/", replace: true });
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "backdrop-blur-xl bg-background/80 border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="size-7 rounded-lg gradient-bg" />
          <span className="font-display font-bold text-lg tracking-tight">My Course</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 rounded-full hover:text-foreground hover:bg-white/5 transition-colors"
              activeProps={{ className: "text-foreground bg-white/5" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {loading ? (
            <span className="hidden sm:block h-9 w-24 rounded-full bg-white/5 animate-pulse" />
          ) : user ? (
            <>
              <Link
                to="/dashboard"
                className="hidden sm:flex items-center gap-2 btn-outline-pill text-sm"
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="hidden sm:grid size-9 place-items-center rounded-full gradient-bg text-xs font-semibold text-white hover:opacity-90 transition"
              >
                {initials}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                search={{ mode: "login" }}
                className="hidden sm:inline btn-outline-pill text-sm"
              >
                Login
              </Link>
              <Link to="/pricing" className="hidden sm:inline btn-gradient text-sm">
                Join Today
              </Link>
            </>
          )}
          <button
            className="md:hidden size-9 grid place-items-center rounded-full border border-border"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="px-5 py-4 flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
                activeProps={{ className: "text-foreground bg-white/5" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="btn-outline-pill text-sm text-center"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="btn-gradient text-sm inline-flex items-center justify-center gap-2"
                  >
                    <LogOut className="size-4" /> Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    search={{ mode: "login" }}
                    onClick={() => setOpen(false)}
                    className="btn-outline-pill text-sm text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/pricing"
                    onClick={() => setOpen(false)}
                    className="btn-gradient text-sm text-center"
                  >
                    Join Today
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
