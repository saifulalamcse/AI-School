/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Check,
  Copy,
  FileText,
  Loader2,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/prompt-library/$id")({
  component: PromptDetailPage,
});

function parsePromptData(promptStr: string) {
  try {
    return JSON.parse(promptStr);
  } catch {
    return { intro: promptStr, blocks: [], required_tools: [] };
  }
}

function PromptDetailPage() {
  const { id } = Route.useParams();
  const [prompt, setPrompt] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from("prompts").select("*").eq("id", id).single();
      if (!error && data) setPrompt(data);
      else toast.error("Prompt not found.");
      setLoading(false);
    })();
  }, [id]);

  async function copyText(text: string, blockId: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBlockId(blockId);
      toast.success("Prompt copied to clipboard.");
      setTimeout(() => setCopiedBlockId((c) => (c === blockId ? null : c)), 2000);
    } catch {
      toast.error("Couldn't copy text automatically.");
    }
  }

  async function save() {
    if (!user) {
      toast.info("Sign in to save prompts.");
      navigate({
        to: "/auth",
        search: { mode: "login" as const, redirect: `/prompt-library/${id}` },
      });
      return;
    }
    if (!prompt) return;
    setSaving(true);
    const { error } = await supabase.from("saved_prompts").upsert(
      {
        user_id: user.id,
        prompt_title: prompt.title,
        category: prompt.category,
        tool: prompt.category,
      },
      { onConflict: "user_id,prompt_title" },
    );
    setSaving(false);
    if (error) return toast.error("Could not save this prompt.");
    toast.success("Saved to your dashboard.");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col">
        <Header />
        <div className="flex-1 grid place-items-center">
          <Loader2 className="size-10 animate-spin text-purple-500" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col">
        <Header />
        <div className="flex-1 grid place-items-center text-center px-5">
          <div>
            <p className="text-neutral-500 mb-4">This prompt could not be found.</p>
            <Link to="/prompt-library" className="btn-gradient text-sm">
              Back to Library
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const parsed = parsePromptData(prompt.prompt);
  const blocks: any[] = parsed.blocks || [];
  const requiredTools: string[] = parsed.required_tools || [];
  const publishedDate = prompt.created_at
    ? new Date(prompt.created_at).toISOString().split("T")[0]
    : null;

  const bannerImages = blocks.filter((b) => b.imageUrl).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-neutral-900 flex flex-col justify-between">
      <Header />

      {/* Top Banner / Thumbnail Collage */}
      <div className="pt-24 pb-6 bg-gradient-to-r from-purple-50 via-pink-50/50 to-orange-50/30 border-b border-neutral-200/60">
        <div className="mx-auto max-w-6xl px-5">
          {/* Back button */}
          <div className="mb-4">
            <Link
              to="/prompt-library"
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 transition shadow-sm"
            >
              <ArrowLeft className="size-3.5" />
              Prompt Library
            </Link>
          </div>

          {/* Banner Images Carousel / Collage */}
          <div className="relative rounded-3xl overflow-hidden bg-white/70 border border-neutral-200/80 shadow-sm p-3 md:p-4">
            <div className="flex items-center gap-4 overflow-x-auto py-2 no-scrollbar">
              {bannerImages.length > 0 ? (
                bannerImages.map((b, i) => (
                  <div
                    key={i}
                    className="h-48 md:h-64 aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-200 shadow-md shrink-0 bg-neutral-100"
                  >
                    <img src={b.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                ))
              ) : prompt.image_url ? (
                <div className="h-48 md:h-64 aspect-[16/9] rounded-2xl overflow-hidden border border-neutral-200 shadow-md shrink-0 bg-neutral-100 mx-auto">
                  <img src={prompt.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-5xl w-full px-5 py-10 space-y-8">
        {/* 1st: Title */}
        <h1 className="font-display font-bold text-3xl md:text-5xl text-neutral-900 leading-tight">
          {prompt.title}
        </h1>

        {/* 2nd: Description */}
        {parsed.intro && (
          <p className="text-base md:text-lg text-neutral-600 leading-relaxed max-w-4xl">
            {parsed.intro}
          </p>
        )}

        {/* 3rd: Tags & Published Date Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-b border-neutral-200/80 pb-6">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-3.5 py-1.5 rounded-full border border-purple-200">
              {prompt.category}
            </span>
            {(prompt.tags || []).map((tag: string) => {
              const cleanTag = tag.startsWith("#") ? tag.slice(1) : tag;
              return (
                <span
                  key={tag}
                  className="text-xs bg-neutral-100 border border-neutral-200 text-neutral-600 px-3.5 py-1.5 rounded-full font-medium"
                >
                  #{cleanTag}
                </span>
              );
            })}
          </div>

          {/* Published Date & Save Button */}
          <div className="flex items-center gap-4">
            {publishedDate && (
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1 justify-end">
                  <Calendar className="size-3" />
                  Published
                </div>
                <div className="text-sm font-semibold text-neutral-700 font-mono">
                  {publishedDate}
                </div>
              </div>
            )}
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-full border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 transition disabled:opacity-60 shadow-sm"
            >
              <Bookmark className="size-3.5" />
              {saving ? "Saving…" : "Save to Dashboard"}
            </button>
          </div>
        </div>

        {requiredTools.length > 0 && (
          <section className="border border-neutral-200 rounded-2xl p-6 bg-white shadow-sm">
            <h2 className="font-display font-bold text-base text-neutral-900 flex items-center gap-2 mb-4">
              <span className="w-1 h-5 rounded-full bg-orange-400 inline-block" />
              <Wrench className="size-4 text-neutral-500" />
              Required Tools &amp; Files
            </h2>
            <ol className="space-y-2">
              {requiredTools.map((tool, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-neutral-600">
                  <span className="font-bold text-neutral-400 w-5 shrink-0">{i + 1}.</span>
                  <span>{tool}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {blocks.length > 0 && (
          <section className="space-y-6">
            {blocks.map((block, i) => {
              const blockId = `block-${i}`;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm"
                >
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 bg-neutral-50">
                    <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
                      <FileText className="size-4 text-neutral-400" />
                      <span>
                        Prompt {i + 1}: {block.tool}
                      </span>
                    </div>
                    <button
                      onClick={() => copyText(block.promptText, blockId)}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition"
                    >
                      {copiedBlockId === blockId ? (
                        <>
                          <Check className="size-3.5 text-green-500" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-5 text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap font-mono bg-neutral-50/50">
                    {block.promptText}
                  </div>

                  {block.imageUrl && (
                    <div className="border-t border-neutral-100 overflow-hidden">
                      <img
                        src={block.imageUrl}
                        alt={`Prompt ${i + 1} output`}
                        className="w-full object-cover max-h-[520px]"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}

        <div className="pt-4 text-center">
          <Link
            to="/prompt-library"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-purple-600 transition"
          >
            <ArrowLeft className="size-4" />
            Back to Prompt Library
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
