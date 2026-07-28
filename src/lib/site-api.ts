import { supabase } from "@/integrations/supabase/client";
import {
  course as fallbackCourse,
  skillTracks,
  testimonials as fallbackExperts,
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
      stats: Array.isArray(item.stats) ? item.stats : [...fallbackCourse.stats],
      topics: Array.isArray(item.topics) ? item.topics : [...fallbackCourse.topics],
      inside: Array.isArray(item.inside) ? item.inside : [...fallbackCourse.inside],
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
        stats: [...fallbackCourse.stats],
        topics: [...fallbackCourse.topics],
        inside: [...fallbackCourse.inside],
      },
    ];
  }
}

// Fetch Single Course by Slug
export async function fetchCourseBySlug(slug: string): Promise<DynamicCourse | null> {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      if (slug === fallbackCourse.slug || slug === "creative-ai-community") {
        return {
          id: "1",
          slug: fallbackCourse.slug,
          title: fallbackCourse.title,
          subtitle: fallbackCourse.subtitle,
          description: "Master Creative design with AI — 25+ AI Tools Use Cases Covered.",
          price: "1,900",
          period: "month",
          status: "active",
          thumbnail_url: null,
          stats: [...fallbackCourse.stats],
          topics: [...fallbackCourse.topics],
          inside: [...fallbackCourse.inside],
        };
      }
      return null;
    }

    return {
      id: data.id,
      slug: data.slug,
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      price: data.price || "1,900",
      period: data.period || "month",
      status: data.status || "active",
      thumbnail_url: data.thumbnail_url,
      stats: Array.isArray(data.stats) ? data.stats : [...fallbackCourse.stats],
      topics: Array.isArray(data.topics) ? data.topics : [...fallbackCourse.topics],
      inside: Array.isArray(data.inside) ? data.inside : [...fallbackCourse.inside],
    };
  } catch (err) {
    console.error("Error fetching course by slug:", err);
    return null;
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
