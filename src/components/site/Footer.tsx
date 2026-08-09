import { Link } from "@tanstack/react-router";
import { Facebook, Youtube, Instagram } from "lucide-react";
import logoImg from "@/assets/logo.jpg";

export function Footer() {
  return (
    <footer className="bg-[#0a0a0f] text-white border-t border-white/10 mt-24">
      <div className="mx-auto max-w-7xl px-5 py-16">
        {/* Main Footer Content */}
        <div className="grid gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Socials Column */}
          <div className="lg:col-span-2 space-y-5">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2.5 hover:opacity-90 transition cursor-pointer w-fit"
            >
              <img src={logoImg} alt="AI School Logo" className="size-8 rounded-lg object-cover" />
              <span className="font-display font-bold text-xl tracking-tight text-white">
                AI School
              </span>
            </Link>

            <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
              AI-powered Learning. From prompts to production — learn the tools shaping the
              future.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="size-9 rounded-lg bg-neutral-900/80 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-800 transition"
              >
                <Facebook className="size-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="size-9 rounded-lg bg-neutral-900/80 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-800 transition"
              >
                <Youtube className="size-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="size-9 rounded-lg bg-neutral-900/80 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-700 hover:bg-neutral-800 transition"
              >
                <Instagram className="size-4" />
              </a>
            </div>
          </div>

          {/* LEARN Column */}
          <div>
            <div className="text-xs font-bold tracking-wider text-white uppercase mb-4">LEARN</div>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">
                  Learn with us
                </Link>
              </li>
              <li>
                <Link to="/prompt-library" className="hover:text-white transition-colors">
                  Prompt Library
                </Link>
              </li>
              <li>
                <Link to="/prompt-library" className="hover:text-white transition-colors">
                  Free Resources
                </Link>
              </li>
              <li>
                <Link to="/ai-news" className="hover:text-white transition-colors">
                  AI News
                </Link>
              </li>
            </ul>
          </div>

          {/* COMPANY Column */}
          <div>
            <div className="text-xs font-bold tracking-wider text-white uppercase mb-4">
              COMPANY
            </div>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* LEGAL Column (Non-link text as requested) */}
          <div>
            <div className="text-xs font-bold tracking-wider text-white uppercase mb-4">LEGAL</div>
            <ul className="space-y-3 text-sm text-neutral-400 select-none">
              <li>
                <span className="hover:text-neutral-300 transition-colors cursor-default">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-neutral-300 transition-colors cursor-default">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-neutral-300 transition-colors cursor-default">
                  Refund Policy
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods Banner Matching Screenshot */}
        <div className="mt-14 pt-8 border-t border-white/10">
          <div className="w-full bg-white rounded-lg px-4 py-3 flex flex-wrap items-center justify-center md:justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2 border-r border-neutral-300 pr-3 mr-1">
              <span className="text-xs font-bold text-emerald-800 tracking-tight whitespace-nowrap">
                Pay with
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-bold">
              {/* VISA */}
              <span className="text-blue-900 tracking-tighter text-sm font-extrabold italic px-1.5 py-0.5 border border-neutral-200 rounded bg-neutral-50">
                VISA
              </span>

              {/* Mastercard */}
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 border border-neutral-200 rounded bg-neutral-50">
                <span className="size-3.5 rounded-full bg-red-500 opacity-90 inline-block" />
                <span className="size-3.5 rounded-full bg-amber-500 opacity-90 -ml-2 inline-block" />
              </span>







              {/* Rocket */}
              <span className="text-purple-700 font-bold text-[10px] px-1.5 py-0.5 border border-neutral-200 rounded bg-neutral-50 flex items-center gap-0.5">
                🚀 Rocket
              </span>

              {/* bKash */}
              <span className="text-pink-600 font-bold text-[10px] px-1.5 py-0.5 border border-neutral-200 rounded bg-neutral-50">
                bKash
              </span>

              {/* Nagad / Tap */}
              <span className="text-orange-600 font-bold text-[10px] px-1.5 py-0.5 border border-neutral-200 rounded bg-neutral-50">
                Nagad
              </span>








            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div>© {new Date().getFullYear()} AI School. All rights reserved.</div>

        </div>
      </div>
    </footer>
  );
}
