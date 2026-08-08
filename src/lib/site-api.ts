import { supabase } from "@/integrations/supabase/client";
import {
  course as fallbackCourse,
  skillTracks,
  testimonials as fallbackExperts,
  news as defaultNews,
} from "@/lib/site-data";

export type DynamicCourse = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  price: string;
  period: string;
  status: string;
  thumbnail_url: string | null;
  tools?: string[];
  stats: { label: string; sub: string }[];
  topics: string[];
  inside: { count: string; title: string; desc: string }[];
  created_at?: string;
};

export type DynamicExpert = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  initials: string | null;
  avatar_url: string | null;
  bio: string | null;
};

export type DynamicPricingPlan = {
  id: string;
  name: string;
  price: string;
  period: string;
  badge: string | null;
  features: string[];
  is_popular: boolean;
  display_order: number;
};

export type DynamicNewsArticle = {
  id: string;
  title: string;
  category: string;
  tag?: string;
  tags: string[];
  cover_url: string | null;
  image_url?: string | null;
  summary: string;
  content: string;
  published_date: string;
  is_featured?: boolean;
  created_at?: string;
};

// Fetch Courses
export async function fetchCourses(): Promise<DynamicCourse[]> {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return [
        {
          id: "1",
          slug: fallbackCourse.slug,
          title: fallbackCourse.title,
          subtitle: fallbackCourse.subtitle,
          description:
            "Master Creative design with AI — 25+ AI Tools Use Cases Covered including text-to-video, composite design, UGC ads and landing pages.",
          price: "1,900",
          period: "month",
          status: "active",
          thumbnail_url: null,
          tools: ["ChatGPT", "Midjourney", "Claude", "Runway", "ElevenLabs", "Sora"],
          stats: [...fallbackCourse.stats],
          topics: [...fallbackCourse.topics],
          inside: [...fallbackCourse.inside],
        },
      ];
    }

    return data.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      price: item.price || "1,900",
      period: item.period || "month",
      status: item.status || "active",
      thumbnail_url: item.thumbnail_url,
      tools:
        Array.isArray(item.tools) && item.tools.length > 0
          ? item.tools
          : ["ChatGPT", "Midjourney", "Claude", "Runway", "ElevenLabs", "Sora"],
      stats:
        Array.isArray(item.stats) && item.stats.length > 0 ? item.stats : [...fallbackCourse.stats],
      topics:
        Array.isArray(item.topics) && item.topics.length > 0
          ? item.topics
          : [...fallbackCourse.topics],
      inside:
        Array.isArray(item.inside) && item.inside.length > 0
          ? item.inside
          : [...fallbackCourse.inside],
      created_at: item.created_at,
    }));
  } catch (err) {
    console.error("Error fetching courses:", err);
    return [
      {
        id: "1",
        slug: fallbackCourse.slug,
        title: fallbackCourse.title,
        subtitle: fallbackCourse.subtitle,
        description: "Master Creative design with AI — 25+ AI Tools Use Cases Covered.",
        price: "1,900",
        period: "month",
        status: "active",
        thumbnail_url: null,
        tools: ["ChatGPT", "Midjourney", "Claude", "Runway", "ElevenLabs", "Sora"],
        stats: [...fallbackCourse.stats],
        topics: [...fallbackCourse.topics],
        inside: [...fallbackCourse.inside],
      },
    ];
  }
}

// Fetch Single Course by Slug
export async function fetchCourseBySlug(slug: string): Promise<DynamicCourse> {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      return {
        id: "fallback-" + slug,
        slug: slug,
        title: slug
          ? slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
          : fallbackCourse.title,
        subtitle: fallbackCourse.subtitle,
        description: "Master Creative design with AI — 25+ AI Tools Use Cases Covered.",
        price: "1,900",
        period: "month",
        status: "active",
        thumbnail_url: null,
        tools: ["ChatGPT", "Midjourney", "Claude", "Runway", "ElevenLabs", "Sora"],
        stats: [...fallbackCourse.stats],
        topics: [...fallbackCourse.topics],
        inside: [...fallbackCourse.inside],
      };
    }

    return {
      id: data.id,
      slug: data.slug,
      title: data.title || "Untitled Course",
      subtitle: data.subtitle || "Master AI workflows and creative automation.",
      description: data.description || "Learn AI tools for real productivity.",
      price: data.price || "1,900",
      period: data.period || "month",
      status: data.status || "active",
      thumbnail_url: data.thumbnail_url || null,
      tools:
        Array.isArray(data.tools) && data.tools.length > 0
          ? data.tools
          : ["ChatGPT", "Midjourney", "Claude", "Runway", "ElevenLabs", "Sora"],
      stats:
        Array.isArray(data.stats) && data.stats.length > 0 ? data.stats : [...fallbackCourse.stats],
      topics:
        Array.isArray(data.topics) && data.topics.length > 0
          ? data.topics
          : [...fallbackCourse.topics],
      inside:
        Array.isArray(data.inside) && data.inside.length > 0
          ? data.inside
          : [...fallbackCourse.inside],
    };
  } catch (err) {
    console.error("Error fetching course by slug:", err);
    return {
      id: "fallback-" + slug,
      slug: slug,
      title: fallbackCourse.title,
      subtitle: fallbackCourse.subtitle,
      description: "Master Creative design with AI.",
      price: "1,900",
      period: "month",
      status: "active",
      thumbnail_url: null,
      tools: ["ChatGPT", "Midjourney", "Claude", "Runway", "ElevenLabs", "Sora"],
      stats: [...fallbackCourse.stats],
      topics: [...fallbackCourse.topics],
      inside: [...fallbackCourse.inside],
    };
  }
}

// Fetch Experts
export async function fetchExperts(): Promise<DynamicExpert[]> {
  try {
    const { data, error } = await supabase
      .from("experts")
      .select("*")
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return fallbackExperts.map((exp, idx) => ({
        id: String(idx + 1),
        name: exp.name,
        role: exp.role,
        company: null,
        initials: exp.initials,
        avatar_url: null,
        bio: null,
      }));
    }

    return data;
  } catch {
    return fallbackExperts.map((exp, idx) => ({
      id: String(idx + 1),
      name: exp.name,
      role: exp.role,
      company: null,
      initials: exp.initials,
      avatar_url: null,
      bio: null,
    }));
  }
}

// Fetch Pricing Plans
export async function fetchPricingPlans(): Promise<DynamicPricingPlan[]> {
  try {
    const { data, error } = await supabase
      .from("pricing_plans")
      .select("*")
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return [
        {
          id: "1",
          name: "Monthly",
          price: "1,900",
          period: "month",
          badge: null,
          is_popular: false,
          display_order: 1,
          features: [
            "Full Creative AI Community access",
            "New classes every single week",
            "2 Live sessions per month + Q&A",
            "Access to 150+ prompt templates",
            "Discord community & feedback",
          ],
        },
        {
          id: "2",
          name: "Yearly",
          price: "17,900",
          period: "year",
          badge: "MOST POPULAR",
          is_popular: true,
          display_order: 2,
          features: [
            "Save ৳4,900 compared to monthly",
            "Full Creative AI Community access",
            "New classes every single week",
            "2 Live sessions per month + Q&A",
            "1-on-1 Portfolio review session",
            "All future masterclass releases",
          ],
        },
        {
          id: "3",
          name: "Lifetime",
          price: "39,900",
          period: "one-time",
          badge: null,
          is_popular: false,
          display_order: 3,
          features: [
            "Pay once, access forever",
            "Every present and future course",
            "All live session recordings (33+)",
            "Direct DM access to lead instructor",
            "VIP Discord role & private lounge",
          ],
        },
      ];
    }

    return data.map((plan) => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      period: plan.period,
      badge: plan.badge,
      features: Array.isArray(plan.features) ? plan.features : [],
      is_popular: !!plan.is_popular,
      display_order: plan.display_order || 1,
    }));
  } catch {
    return [];
  }
}

// Helper to parse article JSON from prompt payload
function parseNewsPrompt(promptStr?: string | null) {
  if (!promptStr || typeof promptStr !== "string") {
    return { summary: "", content: "", published_date: "", is_featured: false, cover_url: null };
  }
  try {
    const res = JSON.parse(promptStr);
    if (res && typeof res === "object") {
      return {
        summary: res.summary || "",
        content: res.content || res.summary || "",
        cover_url: res.cover_url || null,
        published_date: res.published_date || "",
        is_featured: !!res.is_featured,
      };
    }
    return {
      summary: promptStr,
      content: promptStr,
      published_date: "",
      is_featured: false,
      cover_url: null,
    };
  } catch {
    return {
      summary: promptStr,
      content: promptStr,
      published_date: "",
      is_featured: false,
      cover_url: null,
    };
  }
}

// Fetch All AI News Articles
export async function fetchNewsArticles(): Promise<DynamicNewsArticle[]> {
  try {
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("category", "AI News")
      .order("created_at", { ascending: false });

    const dbArticles: DynamicNewsArticle[] = (!error && data ? data : []).map((item) => {
      const parsed = parseNewsPrompt(item.prompt);
      return {
        id: item.id,
        title: item.title,
        category: "AI News",
        tag: item.tags?.[0] || "AI Tools",
        tags: Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : ["AI Tools"],
        cover_url: item.image_url || parsed.cover_url || null,
        image_url: item.image_url || parsed.cover_url || null,
        summary: parsed.summary || item.title,
        content: parsed.content || parsed.summary || item.title,
        published_date:
          parsed.published_date ||
          (item.created_at ? new Date(item.created_at).toISOString().split("T")[0] : "2026-08-08"),
        is_featured: !!parsed.is_featured,
        created_at: item.created_at,
      };
    });

    // Deduplicate against defaults by ID and lowercase title so DB articles override defaults
    const dbTitles = new Set(dbArticles.map((a) => a.title.toLowerCase().trim()));
    const dbIds = new Set(dbArticles.map((a) => a.id));
    const defaults = defaultNews.filter(
      (n) => !dbIds.has(n.id) && !dbTitles.has(n.title.toLowerCase().trim()),
    );

    return [...dbArticles, ...defaults];
  } catch (err) {
    console.error("fetchNewsArticles error:", err);
    return [...defaultNews];
  }
}

// Fetch Single AI News Article
export async function fetchNewsArticleById(id: string): Promise<DynamicNewsArticle | null> {
  try {
    // 1. Try fetching from Supabase prompts table
    const { data, error } = await supabase.from("prompts").select("*").eq("id", id).maybeSingle();

    if (!error && data) {
      const parsed = parseNewsPrompt(data.prompt);
      return {
        id: data.id,
        title: data.title,
        category: "AI News",
        tag: data.tags?.[0] || "AI Tools",
        tags: Array.isArray(data.tags) && data.tags.length > 0 ? data.tags : ["AI Tools"],
        cover_url: data.image_url || parsed.cover_url || null,
        image_url: data.image_url || parsed.cover_url || null,
        summary: parsed.summary || data.title,
        content: parsed.content || parsed.summary || data.title,
        published_date:
          parsed.published_date ||
          (data.created_at ? new Date(data.created_at).toISOString().split("T")[0] : "2026-08-08"),
        is_featured: !!parsed.is_featured,
        created_at: data.created_at,
      };
    }

    // 2. Check fallback mock articles by id or title match
    const found = defaultNews.find(
      (n) =>
        n.id === id || n.title.toLowerCase().trim() === decodeURIComponent(id).toLowerCase().trim(),
    );
    return found || null;
  } catch (err) {
    console.error("fetchNewsArticleById error:", err);
    const found = defaultNews.find((n) => n.id === id);
    return found || null;
  }
}

// Save or Update AI News Article
export async function saveNewsArticle(article: {
  id?: string | null;
  title: string;
  category?: string;
  tags: string[];
  cover_url: string | null;
  summary: string;
  content: string;
  published_date: string;
  is_featured?: boolean;
}) {
  const payload = JSON.stringify({
    news_type: "article",
    summary: article.summary,
    content: article.content,
    cover_url: article.cover_url,
    published_date: article.published_date,
    is_featured: !!article.is_featured,
  });

  const row = {
    title: article.title,
    category: "AI News",
    tags: article.tags,
    image_url: article.cover_url,
    prompt: payload,
  };

  if (article.id && !article.id.startsWith("news-")) {
    const { data, error } = await supabase
      .from("prompts")
      .update(row)
      .eq("id", article.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase.from("prompts").insert(row).select().single();
    if (error) throw error;
    return data;
  }
}

// Delete AI News Article
export async function deleteNewsArticle(id: string) {
  if (id.startsWith("news-")) {
    return; // Fallback mock items
  }
  const { error } = await supabase.from("prompts").delete().eq("id", id);
  if (error) throw error;
}
