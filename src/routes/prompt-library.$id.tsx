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
    <div className="min-h-screen bg-[#faf9f6] text-neutral-900">
      <Header />

      {/* Hero Banner */}
      <div className="relative pt-20 w-full bg-gradient-to-br from-purple-100 via-indigo-50 to-[#faf9f6] overflow-hidden min-h-[320px] md:min-h-[380px] flex flex-col justify-end">
        {bannerImages.length > 0 ? (
          <div className="absolute inset-0 flex gap-0 overflow-hidden">
            {bannerImages.map((b, i) => (
              <div key={i} className="flex-1 relative overflow-hidden">
                <img src={b.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-100/50 via-transparent to-[#faf9f6]" />
          </div>
        ) : prompt.image_url ? (
          <div className="absolute inset-0">
            <img src={prompt.image_url} alt="" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#faf9f6]" />
          </div>
        ) : null}

        <div className="relative z-10 mx-auto max-w-4xl w-full px-5 py-10 md:py-16">
          <Link
            to="/prompt-library"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-purple-600 transition mb-6 bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-neutral-200/60"
          >
            <ArrowLeft className="size-4" />
            Prompt Library
          </Link>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-purple-100/90 text-purple-700 text-xs font-semibold border border-purple-200 backdrop-blur-sm">
              {prompt.category}
            </span>
            {(prompt.tags || []).map((tag: string) => (
              <span
                key={tag}
                className="text-xs bg-white/80 border border-neutral-200 text-neutral-500 px-3 py-1 rounded-full backdrop-blur-sm"
              >
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="font-display font-bold text-3xl md:text-5xl leading-tight text-neutral-900 mb-5 drop-shadow-sm">
            {prompt.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4">
            {publishedDate && (
              <div className="flex items-center gap-1.5 text-sm text-neutral-500 bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-neutral-200/60">
                <Calendar className="size-4" />
                <span>Published {publishedDate}</span>
              </div>
            )}
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-full border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 transition disabled:opacity-60 shadow-sm"
            >
              <Bookmark className="size-4" />
              {saving ? "Saving…" : "Save to Dashboard"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-5 pb-24 space-y-8 mt-4">
        {parsed.intro && (
          <p className="text-base md:text-lg text-neutral-600 leading-relaxed">{parsed.intro}</p>
        )}

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
