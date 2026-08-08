import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Share2,
  Bookmark,
  Sparkles,
  ArrowRight,
  Clock,
  Check,
  Copy,
  X,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { fetchNewsArticleById, fetchNewsArticles, type DynamicNewsArticle } from "@/lib/site-api";

export const Route = createFileRoute("/ai-news/$id")({
  component: NewsDetailPage,
});

function NewsDetailPage() {
  const { id } = Route.useParams();
  const [article, setArticle] = useState<DynamicNewsArticle | null>(null);
  const [related, setRelated] = useState<DynamicNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = article ? article.title : "AI News & Analysis — AI School";

  useEffect(() => {
    window.scrollTo(0, 0);
    (async () => {
      setLoading(true);
      try {
        const [art, all] = await Promise.all([
          fetchNewsArticleById(id),
          fetchNewsArticles().catch(() => []),
        ]);
        setArticle(art);
        setRelated((all || []).filter((a) => a.id !== id).slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function handleCopyLink() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2500);
    }
  }

  function handleShareClick() {
    setShowShareModal(true);
  }

  function handleSave() {
    setSaved(!saved);
    toast.success(saved ? "Removed from bookmarks." : "Article saved to bookmarks!");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-between">
        <Header />
        <div className="flex-1 grid place-items-center py-32">
          <Loader2 className="size-10 animate-spin text-purple-500" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-between">
        <Header />
        <div className="flex-1 grid place-items-center text-center px-5 py-32">
          <div>
            <h2 className="text-2xl font-bold font-display text-neutral-900 mb-3">
              Article Not Found
            </h2>
            <p className="text-neutral-500 mb-6">
              The article you are looking for does not exist or has been removed.
            </p>
            <Link to="/ai-news" className="btn-gradient text-sm inline-flex items-center gap-2">
              <ArrowLeft className="size-4" /> Back to AI News
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const tags = article.tags && article.tags.length > 0 ? article.tags : [article.tag || "AI Tools"];

  return (
    <div className="min-h-screen bg-[#faf9f6] text-neutral-900 flex flex-col justify-between">
      <Header />

      {/* Top Banner / Hero Image matching AI Varsity */}
      <div className="pt-24 pb-8 bg-[#0a0a0f] text-white relative overflow-hidden border-b border-neutral-800">
        <div className="mx-auto max-w-5xl px-5">
          {/* Back to AI News Button */}
          <div className="mb-6">
            <Link
              to="/ai-news"
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-neutral-200 transition backdrop-blur-sm shadow-sm"
            >
              <ArrowLeft className="size-3.5" />
              Back to AI News
            </Link>
          </div>

          {/* Hero Banner Card */}
          <div className="relative rounded-3xl overflow-hidden bg-neutral-900/90 border border-white/10 shadow-2xl min-h-[260px] md:min-h-[360px] flex flex-col md:flex-row items-center justify-between p-6 md:p-10 gap-8">
            <div className="max-w-xl z-10">
              <span className="inline-block text-xs uppercase tracking-widest text-purple-400 font-bold mb-3">
                ✦ AI News & Analysis
              </span>
              <h2 className="font-display font-bold text-2xl md:text-4xl leading-snug text-white">
                {article.title}
              </h2>
              <div className="mt-4 flex items-center gap-4 text-xs text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5" /> 3 min read
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" /> {article.published_date}
                </span>
              </div>
            </div>

            {article.cover_url && (
              <div className="w-full md:w-80 h-56 md:h-64 rounded-2xl overflow-hidden border border-white/10 shadow-xl shrink-0 bg-black/40">
                <img
                  src={article.cover_url}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-4xl w-full px-5 py-12 space-y-8">
        {/* 1st: Headline Title */}
        <h1 className="font-display font-bold text-3xl md:text-5xl text-neutral-900 leading-tight">
          {article.title}
        </h1>

        {/* 2nd: Subtitle / Summary */}
        {article.summary && (
          <p className="text-base md:text-lg text-neutral-600 leading-relaxed max-w-3xl">
            {article.summary}
          </p>
        )}

        {/* 3rd: Tags & Published Date Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-neutral-200">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 items-center">
            {tags.map((tag) => {
              const clean = tag.startsWith("#") ? tag.slice(1) : tag;
              return (
                <span
                  key={tag}
                  className="text-xs bg-neutral-100 border border-neutral-200 text-neutral-700 px-3.5 py-1.5 rounded-full font-medium"
                >
                  #{clean}
                </span>
              );
            })}
          </div>

          {/* Right: Published & Actions */}
          <div className="flex items-center gap-3">
            <div className="text-right mr-2">
              <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
                Published
              </div>
              <div className="text-sm font-semibold text-neutral-800 font-mono">
                {article.published_date}
              </div>
            </div>

            <button
              onClick={handleSave}
              className={
                saved
                  ? "p-2.5 rounded-full border transition bg-purple-100 border-purple-300 text-purple-700"
                  : "p-2.5 rounded-full border transition bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }
              title="Bookmark Article"
            >
              <Bookmark className="size-4" />
            </button>

            <button
              onClick={handleShareClick}
              className="p-2.5 rounded-full border bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-purple-600 hover:border-purple-300 transition shadow-sm"
              title="Share on Social Media"
            >
              <Share2 className="size-4" />
            </button>
          </div>
        </div>

        {/* 4th: Formatted Article Body */}
        <article className="prose prose-neutral max-w-none space-y-6 pt-4 text-neutral-800 text-base md:text-lg leading-relaxed">
          {article.content.split("\n\n").map((para, idx) => {
            const trimmed = para.trim();
            if (trimmed.startsWith("## ")) {
              return (
                <h3
                  key={idx}
                  className="font-display font-bold text-2xl md:text-3xl text-neutral-900 pt-6 pb-2 border-b border-neutral-100"
                >
                  {trimmed.replace(/^##\s+/, "")}
                </h3>
              );
            }
            if (trimmed.startsWith("### ")) {
              return (
                <h4 key={idx} className="font-display font-semibold text-xl text-neutral-900 pt-4">
                  {trimmed.replace(/^###\s+/, "")}
                </h4>
              );
            }
            return (
              <p key={idx} className="leading-relaxed text-neutral-700">
                {trimmed}
              </p>
            );
          })}
        </article>

        {/* AI News Carousel / Related Articles Grid matching screenshot */}
        {related.length > 0 && (
          <section className="pt-16 mt-16 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-display font-bold text-2xl md:text-3xl text-neutral-900">
                  AI News
                </h3>
                <p className="text-sm text-neutral-500 mt-1">
                  Stay ahead with the latest AI news, tools, and tutorials.
                </p>
              </div>
              <Link
                to="/ai-news"
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                See All Articles <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  to="/ai-news/$id"
                  params={{ id: item.id }}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-neutral-900 border border-neutral-200/40 shadow-sm flex flex-col justify-end p-4 hover:-translate-y-1.5 transition-all duration-300"
                >
                  {item.cover_url ? (
                    <img
                      src={item.cover_url}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70 group-hover:opacity-85"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-neutral-900 to-purple-950/60" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                  <div className="relative z-10">
                    <span className="text-[9px] uppercase tracking-wider text-purple-300 font-bold block mb-1">
                      {item.tag || "AI News"}
                    </span>
                    <h4 className="font-display font-bold text-xs md:text-sm text-white line-clamp-3 leading-snug">
                      {item.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Promo Learning Materials Banner matching AI Varsity screenshot */}
        <section className="pt-12">
          <div className="rounded-3xl bg-[#0a0a0f] text-white p-8 md:p-12 text-center relative overflow-hidden border border-white/10 shadow-2xl">
            <div className="absolute -top-24 -left-24 size-72 rounded-full gradient-bg opacity-20 blur-3xl" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Sparkles className="size-3.5" /> AI School Pro
              </span>
              <h3 className="font-display font-bold text-3xl md:text-4xl text-white">
                Learning Materials That Make You <br />
                <span className="gradient-text italic">Better, Faster, Smarter</span> With AI
              </h3>
              <p className="text-sm text-neutral-400 max-w-lg mx-auto">
                A community where you learn the exact AI workflows we use inside our agency to serve
                international and local businesses every single day.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <Link to="/courses" className="btn-gradient text-sm">
                  Explore Courses →
                </Link>
                <Link to="/prompt-library" className="btn-outline-pill text-sm">
                  Browse Prompts
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Social Media Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4">
          <div className="bg-white border border-neutral-200 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Share2 className="size-5 text-purple-600" />
              <h3 className="font-display font-bold text-xl text-neutral-900">
                Share this Article
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mb-6">
              Spread knowledge and updates with your community across social media.
            </p>

            {/* Article Preview Box */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100 mb-6 flex items-center gap-3">
              {article.cover_url && (
                <img
                  src={article.cover_url}
                  alt=""
                  className="size-12 rounded-xl object-cover shrink-0 border border-neutral-200"
                />
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[9px] uppercase font-bold text-purple-600">
                  {article.category || "AI News"}
                </span>
                <p className="font-semibold text-xs text-neutral-800 line-clamp-1">
                  {article.title}
                </p>
              </div>
            </div>

            {/* Social Share Grid */}
            <div className="grid grid-cols-3 gap-2.5 mb-6">
              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white transition group border border-[#1877F2]/20"
              >
                <svg className="size-6 fill-current mb-1.5" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-[11px] font-semibold">Facebook</span>
              </a>

              {/* Twitter / X */}
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-900/10 hover:bg-black text-neutral-900 hover:text-white transition group border border-neutral-200"
              >
                <svg className="size-5 fill-current mb-2 mt-0.5" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="text-[11px] font-semibold">Twitter / X</span>
              </a>

              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + "\n\n" + shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white transition group border border-[#25D366]/20"
              >
                <svg className="size-6 fill-current mb-1.5" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span className="text-[11px] font-semibold">WhatsApp</span>
              </a>

              {/* LinkedIn */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0A66C2]/10 hover:bg-[#0A66C2] text-[#0A66C2] hover:text-white transition group border border-[#0A66C2]/20"
              >
                <svg className="size-6 fill-current mb-1.5" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span className="text-[11px] font-semibold">LinkedIn</span>
              </a>

              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#229ED9]/10 hover:bg-[#229ED9] text-[#229ED9] hover:text-white transition group border border-[#229ED9]/20"
              >
                <Send className="size-6 mb-1.5" />
                <span className="text-[11px] font-semibold">Telegram</span>
              </a>

              {/* Instagram copy */}
              <button
                type="button"
                onClick={() => {
                  handleCopyLink();
                  toast.info("Link copied! You can paste it into your Instagram Story or Bio.");
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-[#f09433]/15 via-[#dc2743]/15 to-[#bc1888]/15 hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] text-[#dc2743] hover:text-white transition group border border-[#dc2743]/20"
              >
                <svg className="size-6 fill-current mb-1.5" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span className="text-[11px] font-semibold">Instagram</span>
              </button>
            </div>

            {/* Copy Direct Link Section */}
            <div className="pt-4 border-t border-neutral-100">
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                Or copy article link:
              </label>
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-neutral-50 border border-neutral-200">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-1 text-xs bg-transparent text-neutral-700 outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    copiedLink ? "bg-green-600 text-white" : "btn-gradient"
                  }`}
                >
                  {copiedLink ? (
                    <>
                      <Check className="size-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" /> Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
