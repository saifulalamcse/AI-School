import { Link } from "@tanstack/react-router";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import logoImg from "@/assets/logo.jpg";

const columns = [
  {
    title: "Learn",
    items: [
      ["All Courses", "/courses"],
      ["Prompt Library", "/prompt-library"],
      ["AI News", "/ai-news"],
      ["Creative AI Community", "/courses/creative-ai-community"],
    ],
  },
  {
    title: "Account",
    items: [
      ["Login", "/auth"],
      ["Create account", "/auth"],
      ["Dashboard", "/dashboard"],
    ],
  },
  {
    title: "Company",
    items: [
      ["About", "/about"],
      ["Workshops", "/about"],
      ["Contact", "/about"],
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-7xl px-5 py-16 grid gap-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="My Course Logo" className="size-8 rounded-lg object-cover" />
            <span className="font-display font-bold text-lg">My Course</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            Learn AI for real productivity. Communities, courses and workflows for the next
            generation of creators.
          </p>
          <div className="mt-6 max-w-xs">
            <NewsletterForm compact />
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <div className="text-sm font-semibold text-foreground">{col.title}</div>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {col.items.map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} My Course. All rights reserved.</div>
          <div className="flex items-center gap-2 opacity-70">
            {["VISA", "MC", "AMEX", "bKash", "SSL"].map((p) => (
              <span key={p} className="px-2 py-1 rounded border border-border">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
