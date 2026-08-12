import { Link } from "@tanstack/react-router";
import { Facebook, Youtube, Instagram } from "lucide-react";
import logoImg from "@/assets/logo.jpg";

export function Footer() {
  return (
    <footer className="bg-[#faf9f6] text-neutral-900 border-t border-neutral-300 mt-24">
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
              <span className="font-display font-bold text-xl tracking-tight text-neutral-900">
                AI School
              </span>
            </Link>

            <p className="text-sm text-neutral-600 max-w-sm leading-relaxed">
              AI-powered Learning. From prompts to production — learn the tools shaping the future.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="size-9 rounded-lg bg-white border border-neutral-300 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 hover:bg-neutral-50 transition"
              >
                <Facebook className="size-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="size-9 rounded-lg bg-white border border-neutral-300 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 hover:bg-neutral-50 transition"
              >
                <Youtube className="size-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="size-9 rounded-lg bg-white border border-neutral-300 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 hover:bg-neutral-50 transition"
              >
                <Instagram className="size-4" />
              </a>
            </div>
          </div>

          {/* LEARN Column */}
          <div>
            <div className="text-xs font-bold tracking-wider text-neutral-900 uppercase mb-4">
              LEARN
            </div>
            <ul className="space-y-3 text-sm text-neutral-600">
              <li>
                <Link to="/courses" className="hover:text-neutral-900 transition-colors">
                  Learn with us
                </Link>
              </li>
              <li>
                <Link to="/prompt-library" className="hover:text-neutral-900 transition-colors">
                  Prompt Library
                </Link>
              </li>
              <li>
                <Link to="/prompt-library" className="hover:text-neutral-900 transition-colors">
                  Free Resources
                </Link>
              </li>
              <li>
                <Link to="/ai-news" className="hover:text-neutral-900 transition-colors">
                  AI News
                </Link>
              </li>
            </ul>
          </div>

          {/* COMPANY Column */}
          <div>
            <div className="text-xs font-bold tracking-wider text-neutral-900 uppercase mb-4">
              COMPANY
            </div>
            <ul className="space-y-3 text-sm text-neutral-600">
              <li>
                <Link to="/about" className="hover:text-neutral-900 transition-colors">
                  About Us
                </Link>
              </li>

              <li>
                <Link to="/contact" className="hover:text-neutral-900 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* LEGAL Column (Non-link text as requested) */}
          <div>
            <div className="text-xs font-bold tracking-wider text-neutral-900 uppercase mb-4">
              LEGAL
            </div>
            <ul className="space-y-3 text-sm text-neutral-600 select-none">
              <li>
                <span className="hover:text-neutral-900 transition-colors cursor-default">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-neutral-900 transition-colors cursor-default">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-neutral-900 transition-colors cursor-default">
                  Refund Policy
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits (Left) & Payment Methods Banner (Right) */}
        <div className="mt-14 pt-8 border-t border-neutral-300 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Bottom Credits (Left) */}
          <div className="text-xs text-neutral-500">
            © {new Date().getFullYear()} AI School. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
