import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, X, LayoutDashboard, LogOut, BookOpen, Sparkles, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import logoImg from "@/assets/logo.jpg";

const nav = [
  { to: "/", label: "Home" },
  { to: "/prompt-library", label: "Prompt Library" },
  { to: "/ai-news", label: "AI News" },
  { to: "/about", label: "About" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMenuOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setMenuOpen(false);
    }, 150);
  };

  const initials =
    (profile?.full_name || user?.email || "?")
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const userName = profile?.full_name || user?.email?.split("@")[0] || "User";

  async function handleSignOut() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    await signOut();
    setOpen(false);
    setMenuOpen(false);
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/95 border-b border-border">
      <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <img src={logoImg} alt="My Course Logo" className="size-8 rounded-lg object-cover" />
          <span className="font-display font-bold text-lg tracking-tight text-white">
            My Course
          </span>
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
          <a
            href="/#experts"
            className="px-3 py-2 rounded-full hover:text-foreground hover:bg-white/5 transition-colors"
          >
            Experts
          </a>
        </nav>

        <div className="flex items-center gap-8">
          <Link
            to="/courses"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 text-sm font-medium text-white transition shadow-sm"
          >
            All Courses
          </Link>

          {loading ? (
            <span className="hidden sm:block h-9 w-24 rounded-full bg-white/5 animate-pulse" />
          ) : user ? (
            <>
              <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="relative hidden sm:block"
              >
                <DropdownMenu modal={false} open={menuOpen} onOpenChange={setMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={() => setMenuOpen((prev) => !prev)}
                      title={userName}
                      className="grid size-9 place-items-center rounded-full gradient-bg text-xs font-semibold text-white hover:opacity-90 transition cursor-pointer outline-none ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 overflow-hidden"
                    >
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={6}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="w-56 bg-background/95 backdrop-blur-xl border border-border shadow-2xl p-2 rounded-2xl animate-none"
                  >
                    <DropdownMenuLabel className="font-normal px-2 py-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none text-foreground truncate">
                          {userName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1 bg-border/60" />
                    {isAdmin && (
                      <>
                        <DropdownMenuItem
                          asChild
                          onClick={() => setMenuOpen(false)}
                          className="rounded-xl cursor-pointer py-2 px-2 focus:bg-amber-500/10 text-amber-400 font-medium"
                        >
                          <Link to="/admin" className="flex items-center gap-2 text-sm w-full">
                            <Shield className="size-4 text-amber-400" />
                            <span>Admin Panel</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 bg-border/60" />
                      </>
                    )}
                    <DropdownMenuItem
                      asChild
                      onClick={() => setMenuOpen(false)}
                      className="rounded-xl cursor-pointer py-2 px-2 focus:bg-white/10"
                    >
                      <Link to="/dashboard" className="flex items-center gap-2 text-sm w-full">
                        <LayoutDashboard className="size-4 text-purple-400" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      onClick={() => setMenuOpen(false)}
                      className="rounded-xl cursor-pointer py-2 px-2 focus:bg-white/10"
                    >
                      <Link to="/dashboard" className="flex items-center gap-2 text-sm w-full">
                        <BookOpen className="size-4 text-pink-400" />
                        <span>My Courses</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      onClick={() => setMenuOpen(false)}
                      className="rounded-xl cursor-pointer py-2 px-2 focus:bg-white/10"
                    >
                      <Link to="/prompt-library" className="flex items-center gap-2 text-sm w-full">
                        <Sparkles className="size-4 text-amber-400" />
                        <span>Prompt Library</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 bg-border/60" />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="rounded-xl cursor-pointer py-2 px-2 text-red-400 focus:text-red-300 focus:bg-red-500/10 flex items-center gap-2 text-sm"
                    >
                      <LogOut className="size-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
            <Link
              to="/courses"
              onClick={() => setOpen(false)}
              className="px-3 py-3 rounded-xl text-sm font-semibold text-purple-400 hover:bg-white/5 transition"
            >
              ✦ All Courses
            </Link>
            <a
              href="/#experts"
              onClick={() => setOpen(false)}
              className="px-3 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
            >
              Experts
            </a>
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
