/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Shield,
  Users,
  DollarSign,
  Sparkles,
  CheckCircle,
  Loader2,
  X,
  Layers,
  Upload,
  Image as ImageIcon,
  Video,
  List,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Newspaper,
  TrendingUp,
  ShoppingBag,
  Search,
  UserPlus,
  Filter,
  Receipt,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  LayoutDashboard,
  LogOut,
  Globe,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoImg from "@/assets/logo.jpg";
import {
  fetchCourses,
  fetchExperts,
  fetchPricingPlans,
  fetchNewsArticles,
  saveNewsArticle,
  deleteNewsArticle,
  type DynamicCourse,
  type DynamicExpert,
  type DynamicPricingPlan,
  type DynamicNewsArticle,
} from "@/lib/site-api";

export type DynamicOrder = {
  id: string;
  user_id: string;
  course_slug: string;
  course_title: string;
  plan: string;
  status: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
};

export type DynamicCustomer = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at?: string;
  enrollments_count?: number;
};

// Types for Lesson System
type Lesson = {
  id: string;
  section_id: string;
  title: string;
  youtube_video_id: string | null;
  duration: string | null;
  description: string | null;
  is_free: boolean;
  position: number;
};

type Section = {
  id: string;
  course_slug: string;
  title: string;
  position: number;
  lessons: Lesson[];
};

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{ title: "Admin Panel — AI School" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { user, profile, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const initials =
    (profile?.full_name || user?.email || "?")
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const userName = profile?.full_name || user?.email?.split("@")[0] || "Admin";

  async function handleAdminSignOut() {
    await signOut();
    navigate({ to: "/", replace: true });
  }

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "orders" | "customers" | "courses" | "experts" | "lessons" | "prompts" | "news"
  >("dashboard");
  const [lessonsCourseSlug, setLessonsCourseSlug] = useState<string | null>(null);

  // Orders and Customers State
  const [orders, setOrders] = useState<DynamicOrder[]>([]);
  const [customers, setCustomers] = useState<DynamicCustomer[]>([]);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [customerSearch, setCustomerSearch] = useState("");

  // Modal State for Order
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [orderUserId, setOrderUserId] = useState("");
  const [orderUserName, setOrderUserName] = useState("");
  const [orderUserEmail, setOrderUserEmail] = useState("");
  const [orderCourseSlug, setOrderCourseSlug] = useState("");
  const [orderCourseTitle, setOrderCourseTitle] = useState("");
  const [orderPlan, setOrderPlan] = useState("৳1,900 / month");
  const [orderStatus, setOrderStatus] = useState("active");
  const [savingOrder, setSavingOrder] = useState(false);

  // Modal State for Customer
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [custFullName, setCustFullName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custBio, setCustBio] = useState("");
  const [custAvatarUrl, setCustAvatarUrl] = useState("");
  const [uploadingCustAvatar, setUploadingCustAvatar] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);

  // Sections state
  const [sections, setSections] = useState<Section[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [secTitle, setSecTitle] = useState("");
  const [savingSection, setSavingSection] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Lessons state
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonSectionId, setLessonSectionId] = useState("");
  const [lesTitle, setLesTitle] = useState("");
  const [lesVideoId, setLesVideoId] = useState("");
  const [lesDuration, setLesDuration] = useState("");
  const [lesDescription, setLesDescription] = useState("");
  const [lesIsFree, setLesIsFree] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);

  // Courses State
  const [courses, setCourses] = useState<DynamicCourse[]>([]);
  const [experts, setExperts] = useState<DynamicExpert[]>([]);
  const [plans, setPlans] = useState<DynamicPricingPlan[]>([]);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [newsArticles, setNewsArticles] = useState<DynamicNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for AI News
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsCategory, setNewsCategory] = useState("AI Tools");
  const [newsTags, setNewsTags] = useState("");
  const [newsCoverUrl, setNewsCoverUrl] = useState("");
  const [newsSummary, setNewsSummary] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsPublishedDate, setNewsPublishedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [newsIsFeatured, setNewsIsFeatured] = useState(false);
  const [uploadingNewsImg, setUploadingNewsImg] = useState(false);

  // Modal State for Course
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [cSlug, setCSlug] = useState("");
  const [cTitle, CSetTitle] = useState("");
  const [cSubtitle, CSetSubtitle] = useState("");
  const [cDescription, CSetDescription] = useState("");
  const [cThumbnailUrl, CSetThumbnailUrl] = useState("");
  const [cPrice, CSetPrice] = useState("1,900");
  const [cPeriod, CSetPeriod] = useState("month");
  const [cStatus, CSetStatus] = useState("active");
  const [cTopics, CSetTopics] = useState(
    "AI Generation, Text-to-Video, UGC Ads, Landing Page Design",
  );
  const [cTools, setCTools] = useState("ChatGPT, Midjourney, Claude, Runway, ElevenLabs, Sora");
  const [cStat1Label, setCStat1Label] = useState("24+ Hours");
  const [cStat1Sub, setCStat1Sub] = useState("Course Duration");
  const [cStat2Label, setCStat2Label] = useState("Live Classes");
  const [cStat2Sub, setCStat2Sub] = useState("Weekly & Monthly");
  const [cStat3Label, setCStat3Label] = useState("Lifetime");
  const [cStat3Sub, setCStat3Sub] = useState("Community Access");
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Modal State for Expert
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [editingExpertId, setEditingExpertId] = useState<string | null>(null);
  const [exName, setExName] = useState("");
  const [exRole, setExRole] = useState("");
  const [exInitials, setExInitials] = useState("");
  const [exAvatarUrl, setExAvatarUrl] = useState("");
  const [uploadingExpertImg, setUploadingExpertImg] = useState(false);

  // Modal State for Pricing Plan
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [pName, setPName] = useState("");
  const [pPrice, setPPrice] = useState("1,900");
  const [pPeriod, setPPeriod] = useState("month");
  const [pBadge, setPBadge] = useState("");
  const [pFeatures, setPFeatures] = useState("");

  // Modal State for Prompt Library
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [pTitle, setPTitle] = useState("");
  const [pCategory, setPCategory] = useState("AI Productivity");
  const [pTags, setPTags] = useState("");
  const [pImageUrl, setPImageUrl] = useState("");
  const [pIntro, setPIntro] = useState("");
  const [pBlocks, setPBlocks] = useState<
    { id: string; tool: string; promptText: string; imageUrl: string }[]
  >([]);
  const [pRequiredTools, setPRequiredTools] = useState("");
  const [uploadingPromptImg, setUploadingPromptImg] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      const [cData, eData, pData, promptsRes, newsDataRes, enrollmentsRes, profilesRes] =
        await Promise.all([
          fetchCourses().catch(() => []),
          fetchExperts().catch(() => []),
          fetchPricingPlans().catch(() => []),
          supabase
            .from("prompts")
            .select("*")
            .neq("category", "AI News")
            .order("created_at", { ascending: false })
            .then((r) => r.data ?? [])
            .catch(() => []),
          supabase
            .from("prompts")
            .select("*")
            .eq("category", "AI News")
            .order("created_at", { ascending: false })
            .then((r) => r.data ?? [])
            .catch(() => []),
          supabase
            .from("enrollments")
            .select("*")
            .order("created_at", { ascending: false })
            .then((r) => r.data ?? [])
            .catch(() => []),
          supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false })
            .then((r) => r.data ?? [])
            .catch(() => []),
        ]);

      const mappedNews: DynamicNewsArticle[] = (newsDataRes || []).map((item) => {
        let parsed: any = {};
        try {
          if (typeof item.prompt === "string" && item.prompt.startsWith("{")) {
            parsed = JSON.parse(item.prompt);
          }
        } catch (e) {
          console.error("Error parsing news prompt payload:", e);
        }

        return {
          id: item.id,
          title: item.title || "Untitled Article",
          category: "AI News",
          tag: item.tags?.[0] || "AI Tools",
          tags: Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : ["AI Tools"],
          cover_url: item.image_url || parsed.cover_url || null,
          image_url: item.image_url || parsed.cover_url || null,
          summary: parsed.summary || item.title || "",
          content: parsed.content || parsed.summary || item.title || "",
          published_date:
            parsed.published_date ||
            (item.created_at
              ? new Date(item.created_at).toISOString().split("T")[0]
              : "2026-08-08"),
          is_featured: !!parsed.is_featured,
          created_at: item.created_at,
        };
      });

      const mappedOrders: DynamicOrder[] = (enrollmentsRes || []).map((enr: any) => {
        const profile = (profilesRes || []).find((p: any) => p.id === enr.user_id);
        return {
          ...enr,
          user_name: profile?.full_name || "Student",
          user_email: profile?.email || "student@example.com",
        };
      });

      const mappedCustomers: DynamicCustomer[] = (profilesRes || []).map((prof: any) => {
        const orderCount = (enrollmentsRes || []).filter((e: any) => e.user_id === prof.id).length;
        return {
          ...prof,
          enrollments_count: orderCount,
        };
      });

      setCourses(cData || []);
      setExperts(eData || []);
      setPlans(pData || []);
      setPrompts(promptsRes || []);
      setNewsArticles(mappedNews);
      setOrders(mappedOrders);
      setCustomers(mappedCustomers);
    } catch (err) {
      console.error("loadAllData global err:", err);
    } finally {
      setLoading(false);
    }
  }

  // Load sections with nested lessons for a course slug
  async function loadSections(courseSlug: string) {
    setLoadingSections(true);
    const { data, error } = await supabase
      .from("sections")
      .select("*, lessons(*)")
      .eq("course_slug", courseSlug)
      .order("position", { ascending: true });
    if (error) toast.error(error.message);
    else setSections((data as Section[]) ?? []);
    setLoadingSections(false);
  }

  function openLessonsTab(courseSlug: string) {
    setLessonsCourseSlug(courseSlug);
    setActiveTab("lessons");
    loadSections(courseSlug);
    setSections([]);
    setExpandedSections({});
  }

  function resetSectionForm() {
    setEditingSectionId(null);
    setSecTitle("");
  }

  function resetLessonForm() {
    setEditingLessonId(null);
    setLesTitle("");
    setLesVideoId("");
    setLesDuration("");
    setLesDescription("");
    setLesIsFree(false);
    setLessonSectionId("");
  }

  async function handleSaveSection(e: React.FormEvent) {
    e.preventDefault();
    if (!secTitle.trim() || !lessonsCourseSlug) return toast.error("Section title is required.");
    setSavingSection(true);
    const position = editingSectionId
      ? (sections.find((s) => s.id === editingSectionId)?.position ?? 0)
      : sections.length;
    let error;
    if (editingSectionId) {
      ({ error } = await supabase
        .from("sections")
        .update({ title: secTitle, position })
        .eq("id", editingSectionId));
    } else {
      ({ error } = await supabase
        .from("sections")
        .insert({ course_slug: lessonsCourseSlug, title: secTitle, position }));
    }
    setSavingSection(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Section saved!");
      setShowSectionModal(false);
      resetSectionForm();
      loadSections(lessonsCourseSlug);
    }
  }

  async function handleDeleteSection(id: string) {
    if (!confirm("Delete this section and all its lessons?")) return;
    const { error } = await supabase.from("sections").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Section deleted.");
      if (lessonsCourseSlug) loadSections(lessonsCourseSlug);
    }
  }

  async function handleSaveLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!lesTitle.trim() || !lessonSectionId)
      return toast.error("Lesson title and section are required.");
    setSavingLesson(true);
    const sec = sections.find((s) => s.id === lessonSectionId);
    const position = editingLessonId
      ? (sec?.lessons?.find((l) => l.id === editingLessonId)?.position ?? 0)
      : (sec?.lessons?.length ?? 0);
    const payload = {
      section_id: lessonSectionId,
      title: lesTitle,
      youtube_video_id: lesVideoId.trim() || null,
      duration: lesDuration.trim() || null,
      description: lesDescription.trim() || null,
      is_free: lesIsFree,
      position,
    };
    let error;
    if (editingLessonId) {
      ({ error } = await supabase.from("lessons").update(payload).eq("id", editingLessonId));
    } else {
      ({ error } = await supabase.from("lessons").insert(payload));
    }
    setSavingLesson(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Lesson saved!");
      setShowLessonModal(false);
      resetLessonForm();
      if (lessonsCourseSlug) loadSections(lessonsCourseSlug);
    }
  }

  async function handleDeleteLesson(id: string) {
    if (!confirm("Delete this lesson?")) return;
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Lesson deleted.");
      if (lessonsCourseSlug) loadSections(lessonsCourseSlug);
    }
  }

  // Handle Image File Upload
  async function handleImageFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImg(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `thumbnails/${fileName}`;

      const { error } = await supabase.storage
        .from("course-thumbnails")
        .upload(filePath, file, { upsert: true });

      if (error) {
        // Fallback to Data URL if bucket doesn't exist yet
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            CSetThumbnailUrl(ev.target.result as string);
            toast.success("Image selected!");
          }
        };
        reader.readAsDataURL(file);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from("course-thumbnails")
          .getPublicUrl(filePath);
        CSetThumbnailUrl(publicUrlData.publicUrl);
        toast.success("Image uploaded!");
      }
    } catch {
      toast.error("Failed to process image file.");
    } finally {
      setUploadingImg(false);
    }
  }

  // Handle Course Create/Edit
  async function handleSaveCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!cTitle.trim() || !cSlug.trim()) {
      return toast.error("Course Title and Slug are required.");
    }
    setSaving(true);

    const topicsArray = cTopics
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const toolsArray = cTools
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const statsArray = [
      { label: cStat1Label.trim() || "24+ Hours", sub: cStat1Sub.trim() || "Course Duration" },
      { label: cStat2Label.trim() || "Live Classes", sub: cStat2Sub.trim() || "Weekly & Monthly" },
      { label: cStat3Label.trim() || "Lifetime", sub: cStat3Sub.trim() || "Community Access" },
    ];

    const coursePayload = {
      slug: cSlug.trim().toLowerCase().replace(/\s+/g, "-"),
      title: cTitle.trim(),
      subtitle: cSubtitle.trim(),
      description: cDescription.trim(),
      thumbnail_url: cThumbnailUrl.trim() || null,
      price: cPrice.trim(),
      period: cPeriod,
      status: cStatus,
      topics: topicsArray,
      tools: toolsArray,
      stats: statsArray,
      updated_at: new Date().toISOString(),
    };

    let res;
    if (editingCourseId && !editingCourseId.startsWith("1")) {
      res = await supabase.from("courses").update(coursePayload).eq("id", editingCourseId);
      if (res.error && res.error.message.includes("tools")) {
        const { tools, ...fallbackPayload } = coursePayload;
        res = await supabase.from("courses").update(fallbackPayload).eq("id", editingCourseId);
      }
    } else {
      res = await supabase.from("courses").insert(coursePayload);
      if (res.error && res.error.message.includes("tools")) {
        const { tools, ...fallbackPayload } = coursePayload;
        res = await supabase.from("courses").insert(fallbackPayload);
      }
    }

    setSaving(false);
    if (res.error) {
      toast.error(res.error.message);
    } else {
      toast.success(editingCourseId ? "Course updated!" : "New course added successfully!");
      setShowCourseModal(false);
      resetCourseForm();
      loadAllData();
    }
  }

  async function handleDeleteCourse(id: string) {
    if (!confirm("Are you sure you want to delete this course?")) return;
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Course deleted.");
      loadAllData();
    }
  }

  function resetCourseForm() {
    setEditingCourseId(null);
    setCSlug("");
    CSetTitle("");
    CSetSubtitle("");
    CSetDescription("");
    CSetThumbnailUrl("");
    CSetPrice("1,900");
    CSetPeriod("month");
    CSetStatus("active");
    CSetTopics("AI Generation, Text-to-Video, UGC Ads, Landing Page Design");
    setCTools("ChatGPT, Midjourney, Claude, Runway, ElevenLabs, Sora");
    setCStat1Label("24+ Hours");
    setCStat1Sub("Course Duration");
    setCStat2Label("Live Classes");
    setCStat2Sub("Weekly & Monthly");
    setCStat3Label("Lifetime");
    setCStat3Sub("Community Access");
    setIsSlugManuallyEdited(false);
  }

  function openEditCourse(c: DynamicCourse) {
    setEditingCourseId(c.id);
    setCSlug(c.slug);
    CSetTitle(c.title);
    CSetSubtitle(c.subtitle || "");
    CSetDescription(c.description || "");
    CSetThumbnailUrl(c.thumbnail_url || "");
    CSetPrice(c.price);
    CSetPeriod(c.period);
    CSetStatus(c.status);
    CSetTopics(Array.isArray(c.topics) ? c.topics.join(", ") : "");
    setCTools(
      Array.isArray(c.tools)
        ? c.tools.join(", ")
        : "ChatGPT, Midjourney, Claude, Runway, ElevenLabs, Sora",
    );
    if (Array.isArray(c.stats) && c.stats.length >= 3) {
      setCStat1Label(c.stats[0]?.label || "24+ Hours");
      setCStat1Sub(c.stats[0]?.sub || "Course Duration");
      setCStat2Label(c.stats[1]?.label || "Live Classes");
      setCStat2Sub(c.stats[1]?.sub || "Weekly & Monthly");
      setCStat3Label(c.stats[2]?.label || "Lifetime");
      setCStat3Sub(c.stats[2]?.sub || "Community Access");
    } else {
      setCStat1Label("24+ Hours");
      setCStat1Sub("Course Duration");
      setCStat2Label("Live Classes");
      setCStat2Sub("Weekly & Monthly");
      setCStat3Label("Lifetime");
      setCStat3Sub("Community Access");
    }
    setIsSlugManuallyEdited(true);
    setShowCourseModal(true);
  }

  // Handle Expert Save (Create + Update)
  async function handleSaveExpert(e: React.FormEvent) {
    e.preventDefault();
    if (!exName.trim()) return toast.error("Expert Name is required.");
    setSaving(true);
    const initials =
      exInitials.trim() ||
      exName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const payload = {
      name: exName.trim(),
      role: exRole.trim(),
      initials,
      avatar_url: exAvatarUrl.trim() || null,
    };

    let error;
    if (editingExpertId) {
      ({ error } = await supabase.from("experts").update(payload).eq("id", editingExpertId));
    } else {
      ({ error } = await supabase.from("experts").insert(payload));
    }

    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editingExpertId ? "Expert updated!" : "Expert added!");
      resetExpertForm();
      setShowExpertModal(false);
      loadAllData();
    }
  }

  function resetExpertForm() {
    setEditingExpertId(null);
    setExName("");
    setExRole("");
    setExInitials("");
    setExAvatarUrl("");
  }

  function openEditExpert(ex: {
    id: string;
    name: string;
    role: string | null;
    initials: string | null;
    avatar_url: string | null;
  }) {
    setEditingExpertId(ex.id);
    setExName(ex.name);
    setExRole(ex.role || "");
    setExInitials(ex.initials || "");
    setExAvatarUrl(ex.avatar_url || "");
    setShowExpertModal(true);
  }

  async function handleExpertAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingExpertImg(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `expert-${Date.now()}.${fileExt}`;
      const { error: upErr } = await supabase.storage
        .from("course-assets")
        .upload(fileName, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("course-assets").getPublicUrl(fileName);
      setExAvatarUrl(urlData.publicUrl);
      toast.success("Avatar uploaded!");
    } catch (err) {
      toast.error("Upload failed.");
      console.error(err);
    } finally {
      setUploadingExpertImg(false);
    }
  }

  async function handleDeleteExpert(id: string) {
    if (!confirm("Delete this expert?")) return;
    const { error } = await supabase.from("experts").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Expert deleted.");
      loadAllData();
    }
  }

  // Handle Pricing Save
  async function handleSavePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!pName.trim() || !pPrice.trim()) return toast.error("Plan name and price required.");
    setSaving(true);

    const featuresArr = pFeatures
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const planPayload = {
      name: pName.trim(),
      price: pPrice.trim(),
      period: pPeriod,
      badge: pBadge.trim() || null,
      features: featuresArr,
    };

    let error;
    if (editingPlanId) {
      const res = await supabase.from("pricing_plans").update(planPayload).eq("id", editingPlanId);
      error = res.error;
    } else {
      const res = await supabase.from("pricing_plans").insert(planPayload);
      error = res.error;
    }

    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Pricing plan saved!");
      setShowPlanModal(false);
      setEditingPlanId(null);
      loadAllData();
    }
  }

  async function handleDeletePlan(id: string) {
    if (!confirm("Delete this plan?")) return;
    const { error } = await supabase.from("pricing_plans").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Plan deleted.");
      loadAllData();
    }
  }

  // Handle Prompt Save (Create + Update)
  async function handleSavePrompt(e: React.FormEvent) {
    e.preventDefault();
    if (!pTitle.trim()) return toast.error("Prompt title is required.");
    if (!pIntro.trim()) return toast.error("Description / Intro is required.");
    setSaving(true);

    const tagsArr = pTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Prompt content JSON payload
    const promptPayload = {
      intro: pIntro.trim(),
      required_tools: pRequiredTools
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean),
      blocks: pBlocks.map((b) => ({
        tool: b.tool.trim() || "Midjourney",
        promptText: b.promptText.trim(),
        imageUrl: b.imageUrl.trim() || null,
      })),
    };

    const payload = {
      title: pTitle.trim(),
      category: pCategory,
      tags: tagsArr,
      image_url: pImageUrl.trim() || null,
      prompt: JSON.stringify(promptPayload),
    };

    let error;
    if (editingPromptId) {
      ({ error } = await supabase.from("prompts").update(payload).eq("id", editingPromptId));
    } else {
      ({ error } = await supabase.from("prompts").insert(payload));
    }

    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editingPromptId ? "Prompt updated!" : "Prompt added!");
      resetPromptForm();
      setShowPromptModal(false);
      loadAllData();
    }
  }

  function resetPromptForm() {
    setEditingPromptId(null);
    setPTitle("");
    setPCategory("AI Productivity");
    setPTags("");
    setPImageUrl("");
    setPIntro("");
    setPRequiredTools("");
    setPBlocks([]);
  }

  function openEditPrompt(pr: any) {
    setEditingPromptId(pr.id);
    setPTitle(pr.title);
    setPCategory(pr.category || "AI Productivity");
    setPTags(Array.isArray(pr.tags) ? pr.tags.join(", ") : "");
    setPImageUrl(pr.image_url || "");

    try {
      const parsed = JSON.parse(pr.prompt);
      setPIntro(parsed.intro || "");
      setPRequiredTools(
        Array.isArray(parsed.required_tools) ? parsed.required_tools.join("\n") : "",
      );
      setPBlocks(
        (parsed.blocks || []).map((b: any, index: number) => ({
          id: String(index + 1),
          tool: b.tool || "Midjourney",
          promptText: b.promptText || "",
          imageUrl: b.imageUrl || "",
        })),
      );
    } catch {
      setPIntro(pr.prompt || "");
      setPRequiredTools("");
      setPBlocks([]);
    }

    setShowPromptModal(true);
  }

  async function handleDeletePrompt(id: string) {
    if (!confirm("Delete this prompt?")) return;
    const { error } = await supabase.from("prompts").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Prompt deleted.");
      loadAllData();
    }
  }

  async function handlePromptImageUpload(file: File, blockId?: string) {
    try {
      if (blockId) {
        setUploadingPromptImg((prev) => ({ ...prev, [blockId]: true }));
      } else {
        setUploadingPromptImg((prev) => ({ ...prev, main: true }));
      }
      const fileExt = file.name.split(".").pop();
      const fileName = `prompt-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: upErr } = await supabase.storage
        .from("course-assets")
        .upload(fileName, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("course-assets").getPublicUrl(fileName);

      if (blockId) {
        setPBlocks((prev) =>
          prev.map((b) => (b.id === blockId ? { ...b, imageUrl: urlData.publicUrl } : b)),
        );
      } else {
        setPImageUrl(urlData.publicUrl);
      }
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error("Upload failed.");
      console.error(err);
    } finally {
      if (blockId) {
        setUploadingPromptImg((prev) => ({ ...prev, [blockId]: false }));
      } else {
        setUploadingPromptImg((prev) => ({ ...prev, main: false }));
      }
    }
  }

  // ==================== AI NEWS HANDLERS ====================
  function resetNewsForm() {
    setEditingNewsId(null);
    setNewsTitle("");
    setNewsCategory("AI Tools");
    setNewsTags("AI Tools, ChatGPT, Tech News");
    setNewsCoverUrl("");
    setNewsSummary("");
    setNewsContent("");
    setNewsPublishedDate(new Date().toISOString().split("T")[0]);
    setNewsIsFeatured(false);
  }

  function openEditNews(n: DynamicNewsArticle) {
    setEditingNewsId(n.id);
    setNewsTitle(n.title);
    setNewsCategory(n.category || n.tag || "AI Tools");
    setNewsTags(Array.isArray(n.tags) ? n.tags.join(", ") : n.tag || "AI Tools");
    setNewsCoverUrl(n.cover_url || n.image_url || "");
    setNewsSummary(n.summary || "");
    setNewsContent(n.content || n.summary || "");
    setNewsPublishedDate(n.published_date || new Date().toISOString().split("T")[0]);
    setNewsIsFeatured(!!n.is_featured);
    setShowNewsModal(true);
  }

  async function handleSaveNews(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const tagList = newsTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await saveNewsArticle({
        id: editingNewsId,
        title: newsTitle,
        category: newsCategory,
        tags: tagList.length > 0 ? tagList : [newsCategory],
        cover_url: newsCoverUrl || null,
        summary: newsSummary,
        content: newsContent || newsSummary,
        published_date: newsPublishedDate,
        is_featured: newsIsFeatured,
      });

      toast.success(
        editingNewsId ? "Article updated successfully!" : "Article created successfully!",
      );
      setShowNewsModal(false);
      resetNewsForm();
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save news article.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteNews(id: string) {
    if (!confirm("Are you sure you want to delete this news article?")) return;
    try {
      await deleteNewsArticle(id);
      toast.success("Article deleted.");
      loadAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete article.");
    }
  }

  async function handleNewsCoverUpload(file: File) {
    try {
      setUploadingNewsImg(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `news-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: upErr } = await supabase.storage
        .from("course-assets")
        .upload(fileName, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("course-assets").getPublicUrl(fileName);
      setNewsCoverUrl(urlData.publicUrl);
      toast.success("Cover image uploaded!");
    } catch (err) {
      toast.error("Cover upload failed.");
      console.error(err);
    } finally {
      setUploadingNewsImg(false);
    }
  }

  // ==================== ORDERS HANDLERS ====================
  function resetOrderForm() {
    setEditingOrderId(null);
    setOrderUserId("");
    setOrderUserName("");
    setOrderUserEmail("");
    const firstCourse = courses[0];
    setOrderCourseSlug(firstCourse?.slug || "");
    setOrderCourseTitle(firstCourse?.title || "Creative AI Community");
    setOrderPlan(firstCourse ? `৳${firstCourse.price} / ${firstCourse.period}` : "৳1,900 / month");
    setOrderStatus("active");
  }

  function openCreateOrder() {
    resetOrderForm();
    setShowOrderModal(true);
  }

  function openEditOrder(ord: DynamicOrder) {
    setEditingOrderId(ord.id);
    setOrderUserId(ord.user_id);
    setOrderUserName(ord.user_name || "");
    setOrderUserEmail(ord.user_email || "");
    setOrderCourseSlug(ord.course_slug);
    setOrderCourseTitle(ord.course_title);
    setOrderPlan(ord.plan);
    setOrderStatus(ord.status);
    setShowOrderModal(true);
  }

  async function handleSaveOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!orderCourseSlug.trim() || !orderCourseTitle.trim()) {
      return toast.error("Course selection is required.");
    }
    setSavingOrder(true);
    try {
      let finalUserId = orderUserId.trim();
      if (!finalUserId && orderUserEmail.trim()) {
        const found = customers.find(
          (c) => c.email?.toLowerCase() === orderUserEmail.trim().toLowerCase(),
        );
        if (found) {
          finalUserId = found.id;
        } else {
          const { data: newProf, error: profErr } = await supabase
            .from("profiles")
            .insert({
              full_name: orderUserName.trim() || "Student",
              email: orderUserEmail.trim().toLowerCase(),
            })
            .select()
            .single();
          if (!profErr && newProf) {
            finalUserId = newProf.id;
          } else {
            finalUserId = user?.id || "manual-user";
          }
        }
      } else if (!finalUserId) {
        finalUserId = user?.id || "manual-user";
      }

      const payload = {
        user_id: finalUserId,
        course_slug: orderCourseSlug,
        course_title: orderCourseTitle,
        plan: orderPlan,
        status: orderStatus,
      };

      if (editingOrderId) {
        const { error } = await supabase
          .from("enrollments")
          .update(payload)
          .eq("id", editingOrderId);
        if (error) throw error;
        toast.success("Order updated successfully!");
      } else {
        const { error } = await supabase.from("enrollments").insert(payload);
        if (error) throw error;
        toast.success("New order created successfully!");
      }
      setShowOrderModal(false);
      resetOrderForm();
      loadAllData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save order.");
    } finally {
      setSavingOrder(false);
    }
  }

  async function handleDeleteOrder(id: string) {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      const { error } = await supabase.from("enrollments").delete().eq("id", id);
      if (error) throw error;
      toast.success("Order deleted.");
      loadAllData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete order.");
    }
  }

  // ==================== CUSTOMERS HANDLERS ====================
  function resetCustomerForm() {
    setEditingCustomerId(null);
    setCustFullName("");
    setCustEmail("");
    setCustBio("");
    setCustAvatarUrl("");
  }

  function openCreateCustomer() {
    resetCustomerForm();
    setShowCustomerModal(true);
  }

  function openEditCustomer(cust: DynamicCustomer) {
    setEditingCustomerId(cust.id);
    setCustFullName(cust.full_name || "");
    setCustEmail(cust.email || "");
    setCustBio(cust.bio || "");
    setCustAvatarUrl(cust.avatar_url || "");
    setShowCustomerModal(true);
  }

  async function handleSaveCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!custFullName.trim()) return toast.error("Full name is required.");
    if (!custEmail.trim() || !custEmail.includes("@"))
      return toast.error("Valid email is required.");
    setSavingCustomer(true);
    try {
      const payload = {
        full_name: custFullName.trim(),
        email: custEmail.trim().toLowerCase(),
        bio: custBio.trim() || null,
        avatar_url: custAvatarUrl.trim() || null,
      };

      if (editingCustomerId) {
        const { error } = await supabase
          .from("profiles")
          .update(payload)
          .eq("id", editingCustomerId);
        if (error) throw error;
        toast.success("Customer profile updated!");
      } else {
        const { error } = await supabase.from("profiles").insert(payload);
        if (error) throw error;
        toast.success("New customer profile created!");
      }
      setShowCustomerModal(false);
      resetCustomerForm();
      loadAllData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save customer.");
    } finally {
      setSavingCustomer(false);
    }
  }

  async function handleDeleteCustomer(id: string) {
    if (
      !confirm(
        "Are you sure you want to delete this customer? This will also remove their enrollments.",
      )
    )
      return;
    try {
      await Promise.all([
        supabase.from("enrollments").delete().eq("user_id", id),
        supabase.from("profiles").delete().eq("id", id),
      ]);
      toast.success("Customer deleted.");
      loadAllData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete customer.");
    }
  }

  async function handleCustomerAvatarUpload(file: File) {
    try {
      setUploadingCustAvatar(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `avatar-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: upErr } = await supabase.storage
        .from("course-assets")
        .upload(fileName, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("course-assets").getPublicUrl(fileName);
      setCustAvatarUrl(urlData.publicUrl);
      toast.success("Avatar image uploaded!");
    } catch (err) {
      toast.error("Avatar upload failed.");
      console.error(err);
    } finally {
      setUploadingCustAvatar(false);
    }
  }

  // Metrics Calculations
  const totalRevenue = orders.reduce((sum, ord) => {
    if (ord.status === "cancelled") return sum;
    const match = (ord.plan || "").replace(/,/g, "").match(/\d+/);
    const amount = match ? parseInt(match[0], 10) : 1900;
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const filteredOrders = orders.filter((ord) => {
    const q = orderSearch.toLowerCase().trim();
    const matchQuery =
      !q ||
      ord.course_title.toLowerCase().includes(q) ||
      (ord.user_name && ord.user_name.toLowerCase().includes(q)) ||
      (ord.user_email && ord.user_email.toLowerCase().includes(q)) ||
      ord.id.toLowerCase().includes(q);
    const matchStatus =
      orderStatusFilter === "all" || ord.status.toLowerCase() === orderStatusFilter.toLowerCase();
    return matchQuery && matchStatus;
  });

  const filteredCustomers = customers.filter((cust) => {
    const q = customerSearch.toLowerCase().trim();
    return (
      !q ||
      (cust.full_name && cust.full_name.toLowerCase().includes(q)) ||
      (cust.email && cust.email.toLowerCase().includes(q)) ||
      (cust.bio && cust.bio.toLowerCase().includes(q))
    );
  });

  if (authLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="size-8 animate-spin text-purple-400" />
      </div>
    );
  }

  // Access Control Guard
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center px-5 text-center">
        <div className="max-w-md mx-auto surface-card p-8 rounded-3xl border border-border shadow-2xl">
          <div className="size-16 rounded-2xl bg-amber-500/10 text-amber-400 grid place-items-center mx-auto text-2xl border border-amber-500/20">
            <Shield />
          </div>
          <h1 className="mt-5 font-display font-bold text-2xl">Admin Access Required</h1>
          <p className="mt-3 text-muted-foreground text-xs leading-relaxed">
            Your account (<span className="text-foreground font-semibold">{user?.email}</span>) does
            not have Admin permissions.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/dashboard" className="btn-gradient text-xs">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen admin-portal bg-[#f8f9fb] text-slate-900">
      {/* Dedicated Admin Header (Only Profile Option on right, off-white clean navbar) */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-white/95 border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-90 transition cursor-pointer"
            >
              <img src={logoImg} alt="AI School Logo" className="size-8 rounded-lg object-cover" />
            </Link>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
              <Shield className="size-3" /> Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition px-3 py-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 bg-white shadow-xs"
            >
              <Globe className="size-3.5" /> View Main Site
            </Link>

            {/* Profile Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  title={userName}
                  className="grid size-9 place-items-center rounded-full gradient-bg text-xs font-semibold text-white hover:opacity-90 transition cursor-pointer outline-none ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 overflow-hidden border border-slate-200 shadow-sm"
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
                className="w-56 bg-white border border-slate-200 shadow-xl p-2 rounded-2xl animate-none z-50 text-slate-900"
              >
                <DropdownMenuLabel className="font-normal px-2 py-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-slate-900 truncate">
                      {userName}
                    </p>
                    <p className="text-xs leading-none text-slate-500 truncate font-mono">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                <DropdownMenuItem
                  asChild
                  className="rounded-xl cursor-pointer py-2 px-2 hover:bg-slate-100 text-slate-700 font-medium"
                >
                  <Link to="/dashboard" className="flex items-center gap-2 text-sm w-full">
                    <LayoutDashboard className="size-4 text-purple-600" />
                    <span>Student Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="rounded-xl cursor-pointer py-2 px-2 hover:bg-slate-100 text-slate-700 font-medium"
                >
                  <Link to="/" className="flex items-center gap-2 text-sm w-full">
                    <Globe className="size-4 text-cyan-600" />
                    <span>View Public Site</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                <DropdownMenuItem
                  onClick={handleAdminSignOut}
                  className="rounded-xl cursor-pointer py-2 px-2 hover:bg-red-50 text-red-600 font-medium"
                >
                  <div className="flex items-center gap-2 text-sm w-full">
                    <LogOut className="size-4" />
                    <span>Sign Out</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-5">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Shield className="size-3.5" /> Admin Control Panel
              </div>
              <h1 className="mt-2 font-display font-bold text-3xl md:text-4xl text-slate-900">
                Manage <span className="gradient-text">AI School</span> Platform
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  resetCourseForm();
                  setShowCourseModal(true);
                }}
                className="btn-gradient text-sm inline-flex items-center gap-2"
              >
                <Plus className="size-4" /> Add New Course
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div
              className="surface-card p-5 cursor-pointer hover:border-purple-400 transition"
              onClick={() => setActiveTab("courses")}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Total Courses</span>
                <BookOpen className="size-4 text-purple-600" />
              </div>
              <div className="mt-2 font-display font-bold text-3xl gradient-text">
                {courses.length}
              </div>
            </div>

            <div
              className="surface-card p-5 cursor-pointer hover:border-pink-400 transition"
              onClick={() => setActiveTab("experts")}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Experts & Instructors</span>
                <Users className="size-4 text-pink-500" />
              </div>
              <div className="mt-2 font-display font-bold text-3xl text-pink-500">
                {experts.length}
              </div>
            </div>

            <div
              className="surface-card p-5 cursor-pointer hover:border-amber-400 transition"
              onClick={() => setActiveTab("prompts")}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Prompt Library</span>
                <Sparkles className="size-4 text-amber-500" />
              </div>
              <div className="mt-2 font-display font-bold text-3xl text-amber-500">
                {prompts.length}
              </div>
            </div>

            <div
              className="surface-card p-5 cursor-pointer hover:border-cyan-400 transition"
              onClick={() => setActiveTab("news")}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">AI News Articles</span>
                <Newspaper className="size-4 text-cyan-600" />
              </div>
              <div className="mt-2 font-display font-bold text-3xl text-cyan-600">
                {newsArticles.length}
              </div>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="flex gap-2 mt-10 border-b border-slate-200 pb-3 flex-wrap">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === "dashboard"
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20"
                  : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50"
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === "orders"
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20"
                  : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50"
              }`}
            >
              🧾 Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("customers")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === "customers"
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20"
                  : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50"
              }`}
            >
              👥 Customers ({customers.length})
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === "courses"
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20"
                  : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50"
              }`}
            >
              📚 Courses ({courses.length})
            </button>
            <button
              onClick={() => setActiveTab("experts")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === "experts"
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20"
                  : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50"
              }`}
            >
              🎓 Experts ({experts.length})
            </button>
            {lessonsCourseSlug && (
              <button
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  activeTab === "lessons"
                    ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20"
                    : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50"
                }`}
                onClick={() => setActiveTab("lessons")}
              >
                🎬 Lessons: {lessonsCourseSlug}
              </button>
            )}
            <button
              onClick={() => setActiveTab("prompts")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === "prompts"
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20"
                  : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50"
              }`}
            >
              ✨ Prompt Library ({prompts.length})
            </button>
            <button
              onClick={() => setActiveTab("news")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === "news"
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20"
                  : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50"
              }`}
            >
              🗞️ AI News ({newsArticles.length})
            </button>
          </div>

          {/* TAB 0: DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className="mt-8 space-y-8">
              <div className="space-y-1">
                <h3 className="font-display font-bold text-2xl text-foreground">
                  Dashboard Overview
                </h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your platform&apos;s key performance metrics, revenue, and customer
                  trends.
                </p>
              </div>

              {/* 3 Main Metric Cards (Matching User's Screenshot Design) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Total Revenue Card */}
                <div className="surface-card p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between hover:border-pink-500/30 transition shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                        <span>Total Revenue</span>
                        <div
                          className="size-4 rounded-full border border-muted-foreground/30 text-[10px] text-muted-foreground flex items-center justify-center cursor-pointer"
                          title="Total completed course sales revenue"
                        >
                          i
                        </div>
                      </div>
                      <div className="mt-3 font-display font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight">
                        {totalRevenue > 0
                          ? `৳${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                          : "0.00৳"}
                      </div>
                    </div>
                    <div className="size-12 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
                      <TrendingUp className="size-6" />
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/60 space-y-2">
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>Course Sales:</span>
                      <span className="font-medium text-foreground">
                        {totalRevenue > 0 ? `৳${totalRevenue.toLocaleString()}` : "0.00৳"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20">
                        100%
                      </span>
                      <span className="text-xs text-muted-foreground">since last period</span>
                    </div>
                  </div>
                </div>

                {/* 2. Total Customers Card */}
                <div className="surface-card p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between hover:border-purple-500/30 transition shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                        <span>Total Customers</span>
                        <div
                          className="size-4 rounded-full border border-muted-foreground/30 text-[10px] text-muted-foreground flex items-center justify-center cursor-pointer"
                          title="Registered students and buyers"
                        >
                          i
                        </div>
                      </div>
                      <div className="mt-3 font-display font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight">
                        {customers.length}
                      </div>
                    </div>
                    <div className="size-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
                      <Users className="size-6" />
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/60 space-y-2">
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>Active Learners:</span>
                      <span className="font-medium text-foreground">
                        {customers.filter((c) => (c.enrollments_count || 0) > 0).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        100%
                      </span>
                      <span className="text-xs text-muted-foreground">since last period</span>
                    </div>
                  </div>
                </div>

                {/* 3. Total Online Orders Card */}
                <div className="surface-card p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between hover:border-amber-500/30 transition shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                        <span>Total Online Orders</span>
                        <div
                          className="size-4 rounded-full border border-muted-foreground/30 text-[10px] text-muted-foreground flex items-center justify-center cursor-pointer"
                          title="Total successful course enrollments"
                        >
                          i
                        </div>
                      </div>
                      <div className="mt-3 font-display font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight">
                        {orders.length}
                      </div>
                    </div>
                    <div className="size-12 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                      <Receipt className="size-6" />
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/60 space-y-2">
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>Completed / Active:</span>
                      <span className="font-medium text-emerald-400">
                        {
                          orders.filter((o) => o.status === "active" || o.status === "completed")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        100%
                      </span>
                      <span className="text-xs text-muted-foreground">since last period</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="surface-card p-6 rounded-3xl shadow-lg border border-border">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h4 className="font-display font-bold text-lg text-foreground">
                      Recent Orders
                    </h4>
                    <p className="text-xs text-muted-foreground">Latest course purchase orders</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="btn-outline-pill text-xs inline-flex items-center gap-1.5"
                  >
                    View All Orders <ArrowRight className="size-3.5" />
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No orders placed yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border/60 text-xs uppercase text-muted-foreground">
                          <th className="pb-3 font-semibold">Student</th>
                          <th className="pb-3 font-semibold">Course</th>
                          <th className="pb-3 font-semibold">Plan</th>
                          <th className="pb-3 font-semibold">Date</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {orders.slice(0, 5).map((ord) => (
                          <tr key={ord.id} className="hover:bg-white/[0.02]">
                            <td className="py-3.5 pr-4">
                              <div className="font-semibold text-foreground">{ord.user_name}</div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {ord.user_email}
                              </div>
                            </td>
                            <td className="py-3.5 pr-4">
                              <div className="font-medium text-foreground max-w-[200px] truncate">
                                {ord.course_title}
                              </div>
                            </td>
                            <td className="py-3.5 pr-4 font-semibold text-purple-400 text-xs">
                              {ord.plan}
                            </td>
                            <td className="py-3.5 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                              {ord.created_at
                                ? new Date(ord.created_at).toLocaleDateString()
                                : "Recent"}
                            </td>
                            <td className="py-3.5 pr-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase ${
                                  ord.status === "active" || ord.status === "completed"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : ord.status === "pending"
                                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                      : "bg-red-500/10 text-red-400 border-red-500/20"
                                }`}
                              >
                                {ord.status}
                              </span>
                            </td>
                            <td className="py-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditOrder(ord)}
                                  className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
                                  title="Edit Order"
                                >
                                  <Edit className="size-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(ord.id)}
                                  className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                                  title="Delete Order"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent Customers Overview */}
              <div className="surface-card p-6 rounded-3xl shadow-lg border border-border">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h4 className="font-display font-bold text-lg text-foreground">
                      Recent Customers
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Latest registered students & users
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("customers")}
                    className="btn-outline-pill text-xs inline-flex items-center gap-1.5"
                  >
                    View All Customers <ArrowRight className="size-3.5" />
                  </button>
                </div>

                {customers.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No customers registered yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border/60 text-xs uppercase text-muted-foreground">
                          <th className="pb-3 font-semibold">Customer</th>
                          <th className="pb-3 font-semibold">Email</th>
                          <th className="pb-3 font-semibold">Enrollments</th>
                          <th className="pb-3 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {customers.slice(0, 5).map((cust) => (
                          <tr key={cust.id} className="hover:bg-white/[0.02]">
                            <td className="py-3.5 pr-4 flex items-center gap-3">
                              {cust.avatar_url ? (
                                <img
                                  src={cust.avatar_url}
                                  alt={cust.full_name || "User"}
                                  className="size-8 rounded-full object-cover border border-border"
                                />
                              ) : (
                                <div className="size-8 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center justify-center">
                                  {(cust.full_name || "U")[0].toUpperCase()}
                                </div>
                              )}
                              <span className="font-semibold text-foreground">
                                {cust.full_name || "Unnamed Student"}
                              </span>
                            </td>
                            <td className="py-3.5 pr-4 font-mono text-xs text-muted-foreground">
                              {cust.email || "No email"}
                            </td>
                            <td className="py-3.5 pr-4 text-xs font-semibold text-purple-400">
                              {cust.enrollments_count || 0} Courses
                            </td>
                            <td className="py-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditCustomer(cust)}
                                  className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
                                  title="Edit Customer"
                                >
                                  <Edit className="size-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCustomer(cust.id)}
                                  className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                                  title="Delete Customer"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: ORDERS / ENROLLMENTS MANAGEMENT (FULL CRUD) */}
          {activeTab === "orders" && (
            <div className="mt-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-xl">All Orders & Enrollments</h3>
                  <p className="text-xs text-muted-foreground">
                    Manage student course purchases, update order status, or create manual
                    enrollments.
                  </p>
                </div>
                <button
                  onClick={openCreateOrder}
                  className="btn-gradient text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="size-3.5" /> Create Manual Order
                </button>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-3 rounded-2xl border border-border">
                <div className="relative flex-1 w-full">
                  <Search className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by student name, email, course or order ID..."
                    className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="size-3.5 text-muted-foreground" />
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">All Statuses ({orders.length})</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  <Loader2 className="size-6 animate-spin mx-auto mb-2 text-purple-400" />
                  Loading orders...
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="surface-card p-12 text-center space-y-3 rounded-3xl border border-border">
                  <ShoppingBag className="size-10 text-muted-foreground/40 mx-auto" />
                  <h4 className="font-display font-bold text-lg text-foreground">
                    No orders found
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {orderSearch || orderStatusFilter !== "all"
                      ? "No orders match your filter criteria."
                      : "When students enroll in courses, their orders will appear here."}
                  </p>
                  <button
                    onClick={openCreateOrder}
                    className="btn-outline-pill text-xs inline-flex items-center gap-1.5 mt-2"
                  >
                    <Plus className="size-3.5" /> Create First Order
                  </button>
                </div>
              ) : (
                <div className="surface-card rounded-3xl overflow-hidden border border-border shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-card/50 border-b border-border text-xs uppercase text-muted-foreground">
                          <th className="py-3.5 px-4 font-semibold">Order ID</th>
                          <th className="py-3.5 px-4 font-semibold">Student</th>
                          <th className="py-3.5 px-4 font-semibold">Course</th>
                          <th className="py-3.5 px-4 font-semibold">Plan / Price</th>
                          <th className="py-3.5 px-4 font-semibold">Date</th>
                          <th className="py-3.5 px-4 font-semibold">Status</th>
                          <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {filteredOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-white/[0.02] transition">
                            <td className="py-4 px-4 font-mono text-xs text-muted-foreground">
                              {ord.id.slice(0, 8)}...
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-semibold text-foreground">{ord.user_name}</div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {ord.user_email}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-medium text-foreground">{ord.course_title}</div>
                              <div className="text-[11px] text-muted-foreground font-mono">
                                /{ord.course_slug}
                              </div>
                            </td>
                            <td className="py-4 px-4 font-semibold text-purple-400 text-xs">
                              {ord.plan}
                            </td>
                            <td className="py-4 px-4 text-xs text-muted-foreground whitespace-nowrap">
                              {ord.created_at
                                ? new Date(ord.created_at).toLocaleString()
                                : "Recent"}
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase ${
                                  ord.status === "active" || ord.status === "completed"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : ord.status === "pending"
                                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                      : "bg-red-500/10 text-red-400 border-red-500/20"
                                }`}
                              >
                                {ord.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditOrder(ord)}
                                  className="btn-outline-pill py-1 px-2.5 text-xs inline-flex items-center gap-1"
                                >
                                  <Edit className="size-3" /> Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(ord.id)}
                                  className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                                  title="Delete Order"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CUSTOMERS / STUDENTS MANAGEMENT (FULL CRUD) */}
          {activeTab === "customers" && (
            <div className="mt-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-xl">All Customers & Students</h3>
                  <p className="text-xs text-muted-foreground">
                    Manage student profiles, view purchase history, edit contact details, or delete
                    accounts.
                  </p>
                </div>
                <button
                  onClick={openCreateCustomer}
                  className="btn-gradient text-xs inline-flex items-center gap-1.5"
                >
                  <UserPlus className="size-3.5" /> Add New Customer
                </button>
              </div>

              {/* Search */}
              <div className="flex gap-3 items-center bg-card p-3 rounded-2xl border border-border">
                <div className="relative flex-1">
                  <Search className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search by customer name, email or bio..."
                    className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  <Loader2 className="size-6 animate-spin mx-auto mb-2 text-purple-400" />
                  Loading customers...
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="surface-card p-12 text-center space-y-3 rounded-3xl border border-border">
                  <Users className="size-10 text-muted-foreground/40 mx-auto" />
                  <h4 className="font-display font-bold text-lg text-foreground">
                    No customers found
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {customerSearch
                      ? "No customers match your search."
                      : "When users sign up or purchase courses, they will appear here."}
                  </p>
                  <button
                    onClick={openCreateCustomer}
                    className="btn-outline-pill text-xs inline-flex items-center gap-1.5 mt-2"
                  >
                    <UserPlus className="size-3.5" /> Add Customer Manually
                  </button>
                </div>
              ) : (
                <div className="surface-card rounded-3xl overflow-hidden border border-border shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-card/50 border-b border-border text-xs uppercase text-muted-foreground">
                          <th className="py-3.5 px-4 font-semibold">Customer</th>
                          <th className="py-3.5 px-4 font-semibold">Email</th>
                          <th className="py-3.5 px-4 font-semibold">Bio / Note</th>
                          <th className="py-3.5 px-4 font-semibold">Enrollments</th>
                          <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {filteredCustomers.map((cust) => (
                          <tr key={cust.id} className="hover:bg-white/[0.02] transition">
                            <td className="py-4 px-4 flex items-center gap-3">
                              {cust.avatar_url ? (
                                <img
                                  src={cust.avatar_url}
                                  alt={cust.full_name || "User"}
                                  className="size-10 rounded-full object-cover border border-border"
                                />
                              ) : (
                                <div className="size-10 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-sm flex items-center justify-center">
                                  {(cust.full_name || "U")[0].toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-foreground">
                                  {cust.full_name || "Unnamed Student"}
                                </div>
                                <div className="text-[11px] text-muted-foreground font-mono">
                                  ID: {cust.id.slice(0, 8)}...
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-mono text-xs text-muted-foreground">
                              {cust.email || "No email"}
                            </td>
                            <td className="py-4 px-4 text-xs text-muted-foreground max-w-xs truncate">
                              {cust.bio || "—"}
                            </td>
                            <td className="py-4 px-4">
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                {cust.enrollments_count || 0} Courses
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditCustomer(cust)}
                                  className="btn-outline-pill py-1 px-2.5 text-xs inline-flex items-center gap-1"
                                >
                                  <Edit className="size-3" /> Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteCustomer(cust.id)}
                                  className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                                  title="Delete Customer"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COURSES MANAGEMENT */}
          {activeTab === "courses" && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-xl">All Courses Catalog</h3>
                <button
                  onClick={() => {
                    resetCourseForm();
                    setShowCourseModal(true);
                  }}
                  className="btn-outline-pill text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="size-3.5" /> Add Course
                </button>
              </div>

              {loading ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  <Loader2 className="size-6 animate-spin mx-auto mb-2 text-purple-400" />
                  Loading courses...
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.map((c) => (
                    <div
                      key={c.id}
                      className="surface-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {c.thumbnail_url ? (
                          <img
                            src={c.thumbnail_url}
                            alt={c.title}
                            className="size-16 rounded-xl object-cover border border-border shrink-0"
                          />
                        ) : (
                          <div className="size-16 rounded-xl bg-purple-500/10 border border-purple-500/20 grid place-items-center shrink-0">
                            <BookOpen className="size-6 text-purple-400" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                c.status === "active"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              }`}
                            >
                              {c.status.toUpperCase()}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              /courses/{c.slug}
                            </span>
                          </div>
                          <h4 className="mt-1.5 font-display font-bold text-xl text-foreground">
                            {c.title}
                          </h4>
                          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
                            {c.subtitle}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-xs font-semibold text-purple-400">
                            <span>
                              Price: ৳{c.price} / {c.period}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => openLessonsTab(c.slug)}
                          className="px-3 py-2 rounded-xl text-xs font-medium border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 flex items-center gap-1.5"
                        >
                          <List className="size-3.5" /> Manage Lessons
                        </button>
                        <button
                          onClick={() => openEditCourse(c)}
                          className="px-3 py-2 rounded-xl text-xs font-medium border border-border hover:bg-white/5 flex items-center gap-1.5"
                        >
                          <Edit className="size-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c.id)}
                          className="px-3 py-2 rounded-xl text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center gap-1.5"
                        >
                          <Trash2 className="size-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EXPERTS MANAGEMENT */}
          {activeTab === "experts" && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-xl">Instructors & Experts</h3>
                <button
                  onClick={() => setShowExpertModal(true)}
                  className="btn-outline-pill text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="size-3.5" /> Add Expert
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {experts.map((ex) => (
                  <div key={ex.id} className="surface-card p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full gradient-bg grid place-items-center text-white font-bold text-sm overflow-hidden shrink-0">
                        {ex.avatar_url ? (
                          <img
                            src={ex.avatar_url}
                            alt={ex.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          ex.initials || "EX"
                        )}
                      </div>
                      <div>
                        <h4 className="font-display font-semibold text-base">{ex.name}</h4>
                        <p className="text-xs text-muted-foreground">{ex.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditExpert(ex)}
                        className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10"
                      >
                        <Edit className="size-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpert(ex.id)}
                        className="p-2 rounded-xl text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LESSONS MANAGEMENT */}
          {activeTab === "lessons" && lessonsCourseSlug && (
            <div className="mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="font-display font-bold text-xl">Lesson Manager</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Course:{" "}
                    <span className="text-purple-300 font-semibold">{lessonsCourseSlug}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      resetSectionForm();
                      setShowSectionModal(true);
                    }}
                    className="btn-outline-pill text-xs inline-flex items-center gap-1.5"
                  >
                    <Plus className="size-3.5" /> Add Section
                  </button>
                  <button
                    onClick={() => {
                      resetLessonForm();
                      if (sections.length > 0) setLessonSectionId(sections[0].id);
                      setShowLessonModal(true);
                    }}
                    className="btn-gradient text-xs inline-flex items-center gap-1.5"
                  >
                    <Plus className="size-3.5" /> Add Lesson
                  </button>
                </div>
              </div>

              {loadingSections ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  <Loader2 className="size-6 animate-spin mx-auto mb-2 text-purple-400" />
                  Loading sections...
                </div>
              ) : sections.length === 0 ? (
                <div className="py-16 text-center surface-card">
                  <List className="size-10 text-purple-400 mx-auto mb-3" />
                  <h4 className="font-display font-bold text-lg">No sections yet</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start by adding a section (e.g. "Week 1").
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sections.map((sec) => (
                    <div key={sec.id} className="surface-card overflow-hidden">
                      {/* Section Header */}
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/3 transition"
                        onClick={() =>
                          setExpandedSections((prev) => ({ ...prev, [sec.id]: !prev[sec.id] }))
                        }
                      >
                        <div className="flex items-center gap-3">
                          {expandedSections[sec.id] ? (
                            <ChevronUp className="size-4 text-purple-400" />
                          ) : (
                            <ChevronDown className="size-4 text-purple-400" />
                          )}
                          <span className="font-semibold text-foreground">{sec.title}</span>
                          <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">
                            {sec.lessons?.length ?? 0} lessons
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setEditingSectionId(sec.id);
                              setSecTitle(sec.title);
                              setShowSectionModal(true);
                            }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition"
                          >
                            <Edit className="size-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSection(sec.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Lessons List */}
                      {expandedSections[sec.id] && (
                        <div className="border-t border-border divide-y divide-border">
                          {(sec.lessons ?? []).length === 0 ? (
                            <div className="px-6 py-5 text-sm text-muted-foreground">
                              No lessons yet.{" "}
                              <button
                                className="text-purple-400 underline"
                                onClick={() => {
                                  resetLessonForm();
                                  setLessonSectionId(sec.id);
                                  setShowLessonModal(true);
                                }}
                              >
                                Add one
                              </button>
                            </div>
                          ) : (
                            (sec.lessons ?? [])
                              .sort((a, b) => a.position - b.position)
                              .map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center justify-between px-6 py-3 hover:bg-white/3 transition"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <Video className="size-4 text-purple-400 shrink-0" />
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium truncate">{lesson.title}</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        {lesson.duration && (
                                          <span className="text-xs text-muted-foreground">
                                            {lesson.duration}
                                          </span>
                                        )}
                                        {lesson.youtube_video_id ? (
                                          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                                            ▶ {lesson.youtube_video_id}
                                          </span>
                                        ) : (
                                          <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                                            No video
                                          </span>
                                        )}
                                        {lesson.is_free ? (
                                          <span className="text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                            <Eye className="size-2.5" /> Free Preview
                                          </span>
                                        ) : (
                                          <span className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                            <EyeOff className="size-2.5" /> Paid
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => {
                                        setEditingLessonId(lesson.id);
                                        setLessonSectionId(lesson.section_id);
                                        setLesTitle(lesson.title);
                                        setLesVideoId(lesson.youtube_video_id ?? "");
                                        setLesDuration(lesson.duration ?? "");
                                        setLesDescription(lesson.description ?? "");
                                        setLesIsFree(lesson.is_free);
                                        setShowLessonModal(true);
                                      }}
                                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10"
                                    >
                                      <Edit className="size-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteLesson(lesson.id)}
                                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))
                          )}
                          <div className="px-6 py-3">
                            <button
                              onClick={() => {
                                resetLessonForm();
                                setLessonSectionId(sec.id);
                                setShowLessonModal(true);
                              }}
                              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition"
                            >
                              <Plus className="size-3" /> Add lesson to this section
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* TAB 4: PROMPTS MANAGEMENT */}
          {activeTab === "prompts" && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-xl">Prompt Library</h3>
                <button
                  onClick={() => setShowPromptModal(true)}
                  className="btn-outline-pill text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="size-3.5" /> Add Prompt
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {prompts.map((pr) => (
                  <div
                    key={pr.id}
                    className="surface-card overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-28 relative bg-purple-950/20 overflow-hidden">
                        {pr.image_url ? (
                          <img src={pr.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full gradient-bg opacity-30" />
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[9px] font-semibold text-purple-300">
                          {pr.category}
                        </span>
                      </div>
                      <div className="p-4">
                        <h4 className="font-display font-semibold text-base line-clamp-1">
                          {pr.title}
                        </h4>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(pr.tags || []).slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="text-[10px] bg-white/5 text-muted-foreground px-1.5 py-0.5 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-t border-border flex justify-end gap-2">
                      <button
                        onClick={() => openEditPrompt(pr)}
                        className="btn-outline-pill text-xs py-1.5 px-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePrompt(pr.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: AI NEWS MANAGEMENT */}
          {activeTab === "news" && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-bold text-xl">AI News Articles</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manage daily news, tools updates, and articles displayed on /ai-news.
                  </p>
                </div>
                <button
                  onClick={() => {
                    resetNewsForm();
                    setShowNewsModal(true);
                  }}
                  className="btn-outline-pill text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="size-3.5" /> Add News Article
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {newsArticles.map((article) => (
                  <div
                    key={article.id}
                    className="surface-card overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-32 relative bg-neutral-900 overflow-hidden">
                        {article.cover_url ? (
                          <img
                            src={article.cover_url}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-950/60 to-black grid place-items-center">
                            <Newspaper className="size-8 text-purple-400/50" />
                          </div>
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm text-[9px] font-semibold text-purple-300">
                          {article.tag || article.category || "AI News"}
                        </span>
                        {article.published_date && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm text-[9px] font-mono text-neutral-300">
                            {article.published_date}
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <h4 className="font-display font-semibold text-base line-clamp-2 leading-snug">
                          {article.title}
                        </h4>
                        {article.summary && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                            {article.summary}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-3">
                          {(article.tags || []).slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] bg-white/5 text-muted-foreground px-1.5 py-0.5 rounded"
                            >
                              #{tag.replace(/^#/, "")}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-border flex justify-end gap-2">
                      <button
                        onClick={() => openEditNews(article)}
                        className="btn-outline-pill text-xs py-1.5 px-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNews(article.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"
                        title="Delete Article"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {newsArticles.length === 0 && (
                <div className="text-center py-16 text-muted-foreground text-sm">
                  No news articles created yet. Click "Add News Article" above.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* MODAL: ADD / EDIT SECTION */}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4">
          <div className="bg-background border border-border w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setShowSectionModal(false);
                resetSectionForm();
              }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-muted-foreground"
            >
              <X className="size-5" />
            </button>
            <h3 className="font-display font-bold text-xl mb-5">
              {editingSectionId ? "Edit Section" : "Add Section"}
            </h3>
            <form onSubmit={handleSaveSection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  required
                  value={secTitle}
                  onChange={(e) => setSecTitle(e.target.value)}
                  placeholder="e.g. Week 1 — ChatGPT Basics"
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              <button
                type="submit"
                disabled={savingSection}
                className="btn-gradient w-full text-sm flex items-center justify-center gap-2"
              >
                {savingSection && <Loader2 className="size-4 animate-spin" />}
                {editingSectionId ? "Update Section" : "Add Section"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT LESSON */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto">
          <div className="bg-background border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl relative my-8">
            <button
              onClick={() => {
                setShowLessonModal(false);
                resetLessonForm();
              }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-muted-foreground"
            >
              <X className="size-5" />
            </button>
            <h3 className="font-display font-bold text-xl mb-5">
              {editingLessonId ? "Edit Lesson" : "Add Lesson"}
            </h3>
            <form onSubmit={handleSaveLesson} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Section
                </label>
                <select
                  required
                  value={lessonSectionId}
                  onChange={(e) => setLessonSectionId(e.target.value)}
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="">Select a section...</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Lesson Title
                </label>
                <input
                  type="text"
                  required
                  value={lesTitle}
                  onChange={(e) => setLesTitle(e.target.value)}
                  placeholder="e.g. Introduction to ChatGPT"
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  YouTube Video ID
                </label>
                <input
                  type="text"
                  value={lesVideoId}
                  onChange={(e) => setLesVideoId(e.target.value)}
                  placeholder="e.g. KoqOe4wUXTM"
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  From: youtube.com/watch?v=<strong>KoqOe4wUXTM</strong>
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={lesDuration}
                  onChange={(e) => setLesDuration(e.target.value)}
                  placeholder="e.g. 12:34"
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={lesDescription}
                  onChange={(e) => setLesDescription(e.target.value)}
                  rows={2}
                  placeholder="Brief description of what this lesson covers..."
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-border">
                <input
                  type="checkbox"
                  id="is_free"
                  checked={lesIsFree}
                  onChange={(e) => setLesIsFree(e.target.checked)}
                  className="size-4 rounded accent-purple-500"
                />
                <label htmlFor="is_free" className="text-sm cursor-pointer">
                  <span className="font-semibold">Free Preview</span>
                  <span className="text-muted-foreground ml-1">
                    (visible to everyone without enrollment)
                  </span>
                </label>
              </div>
              <button
                type="submit"
                disabled={savingLesson}
                className="btn-gradient w-full text-sm flex items-center justify-center gap-2"
              >
                {savingLesson && <Loader2 className="size-4 animate-spin" />}
                {editingLessonId ? "Update Lesson" : "Add Lesson"}
              </button>
            </form>
          </div>
        </div>
      )}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto">
          <div className="bg-background border border-border w-full max-w-xl rounded-3xl p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setShowCourseModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-muted-foreground"
            >
              <X className="size-5" />
            </button>
            <h3 className="font-display font-bold text-2xl mb-5">
              {editingCourseId ? "Edit Course" : "Add New Course"}
            </h3>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  required
                  value={cTitle}
                  onChange={(e) => {
                    const val = e.target.value;
                    CSetTitle(val);
                    if (!isSlugManuallyEdited) {
                      setCSlug(
                        val
                          .toLowerCase()
                          .trim()
                          .replace(/[^\w\s-]/g, "")
                          .replace(/[\s_-]+/g, "-")
                          .replace(/^-+|-+$/g, ""),
                      );
                    }
                  }}
                  placeholder="e.g. Creative AI Community"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Course Image / Thumbnail Banner
                </label>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="btn-outline-pill text-xs inline-flex items-center gap-1.5 cursor-pointer py-2 px-3">
                      {uploadingImg ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Upload className="size-3.5 text-purple-400" />
                      )}
                      <span>{uploadingImg ? "Uploading..." : "Upload File"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileSelect}
                        disabled={uploadingImg}
                      />
                    </label>
                    <span className="text-xs text-muted-foreground">or Image URL:</span>
                    <input
                      type="text"
                      value={cThumbnailUrl}
                      onChange={(e) => CSetThumbnailUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="flex-1 min-w-[200px] px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {cThumbnailUrl && (
                    <div className="relative rounded-2xl overflow-hidden border border-border aspect-video max-h-44 bg-black/40 group">
                      <img
                        src={cThumbnailUrl}
                        alt="Course Thumbnail Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => CSetThumbnailUrl("")}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-red-500 transition"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Course Slug (URL identifier)
                </label>
                <input
                  type="text"
                  required
                  value={cSlug}
                  onChange={(e) => {
                    setCSlug(e.target.value);
                    setIsSlugManuallyEdited(true);
                  }}
                  placeholder="creative-ai-community"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                />
                {editingCourseId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ⚠️ Slug পরিবর্তন করলে কোর্সের URL পরিবর্তন হবে।
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Subtitle / Short Tagline
                </label>
                <input
                  type="text"
                  value={cSubtitle}
                  onChange={(e) => CSetSubtitle(e.target.value)}
                  placeholder="The community for creators building with AI..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Price (BDT)
                  </label>
                  <input
                    type="text"
                    value={cPrice}
                    onChange={(e) => CSetPrice(e.target.value)}
                    placeholder="1,900"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Period
                  </label>
                  <select
                    value={cPeriod}
                    onChange={(e) => CSetPeriod(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                  >
                    <option value="month">month</option>
                    <option value="year">year</option>
                    <option value="one-time">one-time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Status
                  </label>
                  <select
                    value={cStatus}
                    onChange={(e) => CSetStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                  >
                    <option value="active">active</option>
                    <option value="enrolling">enrolling</option>
                    <option value="coming_soon">coming_soon</option>
                    <option value="draft">draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Topics (comma separated)
                </label>
                <input
                  type="text"
                  value={cTopics}
                  onChange={(e) => CSetTopics(e.target.value)}
                  placeholder="AI Generation, Text-to-Video, UGC Ads, Landing Pages"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Tools Covered Badges (comma separated)
                </label>
                <input
                  type="text"
                  value={cTools}
                  onChange={(e) => setCTools(e.target.value)}
                  placeholder="ChatGPT, Midjourney, Claude, Runway, ElevenLabs, Sora"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Course Highlight Cards (Duration, Live Classes, Access)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-card/60 p-3 rounded-2xl border border-border">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">
                      Card 1 (Duration)
                    </span>
                    <input
                      type="text"
                      value={cStat1Label}
                      onChange={(e) => setCStat1Label(e.target.value)}
                      placeholder="24+ Hours"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
                    />
                    <input
                      type="text"
                      value={cStat1Sub}
                      onChange={(e) => setCStat1Sub(e.target.value)}
                      placeholder="Course Duration"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-muted-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">
                      Card 2 (Classes)
                    </span>
                    <input
                      type="text"
                      value={cStat2Label}
                      onChange={(e) => setCStat2Label(e.target.value)}
                      placeholder="Live Classes"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
                    />
                    <input
                      type="text"
                      value={cStat2Sub}
                      onChange={(e) => setCStat2Sub(e.target.value)}
                      placeholder="Weekly & Monthly"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-muted-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">
                      Card 3 (Access)
                    </span>
                    <input
                      type="text"
                      value={cStat3Label}
                      onChange={(e) => setCStat3Label(e.target.value)}
                      placeholder="Lifetime"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
                    />
                    <input
                      type="text"
                      value={cStat3Sub}
                      onChange={(e) => setCStat3Sub(e.target.value)}
                      placeholder="Community Access"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-muted-foreground"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows={3}
                  value={cDescription}
                  onChange={(e) => CSetDescription(e.target.value)}
                  placeholder="Full course description..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="btn-outline-pill text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-gradient text-xs inline-flex items-center gap-2"
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : "Save Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PROMPT */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto">
          <div className="bg-background border border-border w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative my-8">
            <button
              onClick={() => {
                resetPromptForm();
                setShowPromptModal(false);
              }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-muted-foreground"
            >
              <X className="size-5" />
            </button>
            <h3 className="font-display font-bold text-2xl mb-5">
              {editingPromptId ? "Edit Prompt" : "Add New Prompt"}
            </h3>
            <form onSubmit={handleSavePrompt} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Prompt Title
                  </label>
                  <input
                    type="text"
                    required
                    value={pTitle}
                    onChange={(e) => setPTitle(e.target.value)}
                    placeholder="e.g. Create Studio-Quality Face Wash Product Photos"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Category
                  </label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none"
                  >
                    <option value="AI Productivity">AI Productivity</option>
                    <option value="AI Tools">AI Tools</option>
                    <option value="Design">Design</option>
                    <option value="Image Generation">Image Generation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={pTags}
                    onChange={(e) => setPTags(e.target.value)}
                    placeholder="e.g. midjourney, product, marketing"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Thumbnail Banner URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pImageUrl}
                      onChange={(e) => setPImageUrl(e.target.value)}
                      placeholder="Image URL..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground"
                    />
                    <label className="btn-outline-pill text-xs inline-flex items-center gap-1.5 cursor-pointer py-2 px-3 shrink-0">
                      {uploadingPromptImg["main"] ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Upload className="size-3.5 text-purple-400" />
                      )}
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePromptImageUpload(file);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Intro Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={pIntro}
                  onChange={(e) => setPIntro(e.target.value)}
                  placeholder="Introduce the prompt workflow..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Required Tools &amp; Files
                  <span className="ml-1 font-normal text-muted-foreground/60">(one per line)</span>
                </label>
                <textarea
                  rows={3}
                  value={pRequiredTools}
                  onChange={(e) => setPRequiredTools(e.target.value)}
                  placeholder={"ChatGPT Image 2.0\nAdobe Photoshop\nMidjourney Subscription"}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground resize-none font-mono text-xs"
                />
              </div>

              {/* Dynamic Prompt Blocks */}
              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Prompt Blocks / Steps
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setPBlocks((prev) => [
                        ...prev,
                        {
                          id: String(Date.now()),
                          tool: "Midjourney",
                          promptText: "",
                          imageUrl: "",
                        },
                      ])
                    }
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <Plus className="size-3.5" /> Add Block / Step
                  </button>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {pBlocks.map((block, idx) => (
                    <div
                      key={block.id}
                      className="p-4 rounded-2xl border border-border bg-card/50 space-y-3 relative"
                    >
                      <button
                        type="button"
                        onClick={() => setPBlocks((prev) => prev.filter((b) => b.id !== block.id))}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-300"
                      >
                        <X className="size-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-muted-foreground mb-1">
                            Tool / Platform
                          </label>
                          <input
                            type="text"
                            required
                            value={block.tool}
                            onChange={(e) =>
                              setPBlocks((prev) =>
                                prev.map((b) =>
                                  b.id === block.id ? { ...b, tool: e.target.value } : b,
                                ),
                              )
                            }
                            placeholder="e.g. Midjourney, ChatGPT"
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-muted-foreground mb-1">
                            Result Image URL
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={block.imageUrl}
                              onChange={(e) =>
                                setPBlocks((prev) =>
                                  prev.map((b) =>
                                    b.id === block.id ? { ...b, imageUrl: e.target.value } : b,
                                  ),
                                )
                              }
                              placeholder="Output Image URL..."
                              className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
                            />
                            <label className="btn-outline-pill text-[10px] inline-flex items-center gap-1 cursor-pointer py-1 px-2.5 shrink-0">
                              {uploadingPromptImg[block.id] ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <Upload className="size-3 text-purple-400" />
                              )}
                              <span>Upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handlePromptImageUpload(file, block.id);
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-muted-foreground mb-1">
                          Prompt Code / Text
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={block.promptText}
                          onChange={(e) =>
                            setPBlocks((prev) =>
                              prev.map((b) =>
                                b.id === block.id ? { ...b, promptText: e.target.value } : b,
                              ),
                            )
                          }
                          placeholder="Paste the prompt here..."
                          className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground resize-none"
                        />
                      </div>
                    </div>
                  ))}
                  {pBlocks.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No steps added yet. Add a step above.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    resetPromptForm();
                    setShowPromptModal(false);
                  }}
                  className="btn-outline-pill text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-gradient text-xs inline-flex items-center gap-2"
                >
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  {editingPromptId ? "Update Prompt" : "Save Prompt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT EXPERT */}
      {showExpertModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4">
          <div className="bg-background border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => {
                resetExpertForm();
                setShowExpertModal(false);
              }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-muted-foreground"
            >
              <X className="size-5" />
            </button>
            <h3 className="font-display font-bold text-2xl mb-5">
              {editingExpertId ? "Edit Expert" : "Add New Expert / Instructor"}
            </h3>
            <form onSubmit={handleSaveExpert} className="space-y-4 text-sm">
              {/* Avatar */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2">
                  Avatar Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-full gradient-bg grid place-items-center text-white font-bold text-xl overflow-hidden shrink-0">
                    {exAvatarUrl ? (
                      <img src={exAvatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{exName ? exName.slice(0, 2).toUpperCase() : "?"}</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="btn-outline-pill text-xs inline-flex items-center gap-1.5 cursor-pointer py-2 px-3">
                      {uploadingExpertImg ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Upload className="size-3.5 text-purple-400" />
                      )}
                      <span>{uploadingExpertImg ? "Uploading..." : "Upload Photo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleExpertAvatarUpload}
                        disabled={uploadingExpertImg}
                      />
                    </label>
                    <input
                      type="text"
                      value={exAvatarUrl}
                      onChange={(e) => setExAvatarUrl(e.target.value)}
                      placeholder="or paste image URL..."
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={exName}
                  onChange={(e) => setExName(e.target.value)}
                  placeholder="e.g. Tanvir Islam"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Role / Designation
                </label>
                <input
                  type="text"
                  value={exRole}
                  onChange={(e) => setExRole(e.target.value)}
                  placeholder="e.g. Lead AI Instructor"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Initials (optional — auto-generated if blank)
                </label>
                <input
                  type="text"
                  value={exInitials}
                  onChange={(e) => setExInitials(e.target.value.toUpperCase().slice(0, 3))}
                  placeholder="e.g. SA"
                  maxLength={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground"
                />
              </div>
              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetExpertForm();
                    setShowExpertModal(false);
                  }}
                  className="btn-outline-pill text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-gradient text-xs inline-flex items-center gap-2"
                >
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  {editingExpertId ? "Update Expert" : "Save Expert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT AI NEWS ARTICLE */}
      {showNewsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto">
          <div className="bg-background border border-border w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative my-8">
            <button
              onClick={() => {
                setShowNewsModal(false);
                resetNewsForm();
              }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-muted-foreground"
            >
              <X className="size-5" />
            </button>
            <h3 className="font-display font-bold text-2xl mb-1">
              {editingNewsId ? "Edit AI News Article" : "Add New AI News Article"}
            </h3>
            <p className="text-xs text-muted-foreground mb-5">
              Publish news, breakdown stories, and updates to the /ai-news page.
            </p>

            <form
              onSubmit={handleSaveNews}
              className="space-y-4 text-sm max-h-[75vh] overflow-y-auto pr-1"
            >
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Article Title (Bengali or English)
                </label>
                <input
                  type="text"
                  required
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  placeholder="e.g. ChatGPT-কে একটি প্রশ্ন করতে কতটুকু পানি আর বিদ্যুৎ খরচ হয় জানেন কি?"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Category & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Primary Category / Tag
                  </label>
                  <select
                    value={newsCategory}
                    onChange={(e) => setNewsCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                  >
                    <option value="AI Tools">AI Tools</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Science News">Science News</option>
                    <option value="Career">Career</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Design">Design</option>
                    <option value="Technology">Technology</option>
                    <option value="Business">Business</option>
                    <option value="Update">Update</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newsTags}
                    onChange={(e) => setNewsTags(e.target.value)}
                    placeholder="AI Tools, ChatGPT, Water Usage, OpenAI"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Cover Image / Thumbnail
                </label>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="btn-outline-pill text-xs inline-flex items-center gap-1.5 cursor-pointer py-2 px-3">
                      {uploadingNewsImg ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Upload className="size-3.5 text-purple-400" />
                      )}
                      <span>{uploadingNewsImg ? "Uploading..." : "Upload File"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleNewsCoverUpload(file);
                        }}
                        disabled={uploadingNewsImg}
                      />
                    </label>
                    <span className="text-xs text-muted-foreground">or Image URL:</span>
                    <input
                      type="text"
                      value={newsCoverUrl}
                      onChange={(e) => setNewsCoverUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="flex-1 min-w-[200px] px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {newsCoverUrl && (
                    <div className="relative rounded-2xl overflow-hidden border border-border aspect-video max-h-48 bg-black/40">
                      <img
                        src={newsCoverUrl}
                        alt="News Cover Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setNewsCoverUrl("")}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-red-500 transition"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary / Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Short Summary / Subtitle
                </label>
                <textarea
                  rows={2}
                  required
                  value={newsSummary}
                  onChange={(e) => setNewsSummary(e.target.value)}
                  placeholder="ChatGPT-কে একটি Prompt দিলে কত লিটার পানি আর কত Watt-hour বিদ্যুৎ খরচ হয়?..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500 resize-none text-xs"
                />
              </div>

              {/* Full Article Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-muted-foreground">
                    Full Article Content
                  </label>
                  <span className="text-[10px] text-purple-400">Tip: Use ## for Subheadings</span>
                </div>
                <textarea
                  rows={6}
                  required
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  placeholder={`## আমেরিকান ডেটা সেন্টারের পানি সংকট\nOpenAI এবং অন্যান্য টেক জায়ান্টদের AI মডেল ট্রেইনিং এবং কোটি কোটি প্রম্পট প্রসেস করতে...\n\n## অ্যালগরিদমের শক্তির প্রভাব\nপ্রতিটি সাধারণ ChatGPT প্রম্পটে সাধারণ Google Search-এর তুলনায়...`}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500 font-mono text-xs leading-relaxed"
                />
              </div>

              {/* Published Date & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Published Date
                  </label>
                  <input
                    type="date"
                    value={newsPublishedDate}
                    onChange={(e) => setNewsPublishedDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500 text-xs"
                  />
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border mt-auto">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={newsIsFeatured}
                    onChange={(e) => setNewsIsFeatured(e.target.checked)}
                    className="size-4 rounded accent-purple-500"
                  />
                  <label htmlFor="is_featured" className="text-xs cursor-pointer font-semibold">
                    Featured Article (highlighted badge)
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    resetNewsForm();
                    setShowNewsModal(false);
                  }}
                  className="btn-outline-pill text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-gradient text-xs inline-flex items-center gap-2"
                >
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  {editingNewsId ? "Update Article" : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD / EDIT ORDER ==================== */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="surface-card w-full max-w-lg p-6 rounded-3xl border border-border shadow-2xl relative">
            <button
              onClick={() => {
                resetOrderForm();
                setShowOrderModal(false);
              }}
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition p-1"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 grid place-items-center">
                <Receipt className="size-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-foreground">
                  {editingOrderId ? "Edit Order / Enrollment" : "Create Manual Order"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {editingOrderId
                    ? "Update order details, status, or course assignment"
                    : "Assign a course enrollment directly to a student"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveOrder} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Select Course *
                </label>
                <select
                  required
                  value={orderCourseSlug}
                  onChange={(e) => {
                    const slug = e.target.value;
                    setOrderCourseSlug(slug);
                    const found = courses.find((c) => c.slug === slug);
                    if (found) {
                      setOrderCourseTitle(found.title);
                      setOrderPlan(`৳${found.price} / ${found.period}`);
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.title} (৳{c.price} / {c.period})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    value={orderUserName}
                    onChange={(e) => setOrderUserName(e.target.value)}
                    placeholder="e.g. Rahim Khan"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Student Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={orderUserEmail}
                    onChange={(e) => setOrderUserEmail(e.target.value)}
                    placeholder="student@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Price / Plan Text
                  </label>
                  <input
                    type="text"
                    value={orderPlan}
                    onChange={(e) => setOrderPlan(e.target.value)}
                    placeholder="৳1,900 / month"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Order Status *
                  </label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500 text-xs"
                  >
                    <option value="active">Active (Full Access)</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    resetOrderForm();
                    setShowOrderModal(false);
                  }}
                  className="btn-outline-pill text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingOrder}
                  className="btn-gradient text-xs inline-flex items-center gap-2"
                >
                  {savingOrder && <Loader2 className="size-4 animate-spin" />}
                  {editingOrderId ? "Update Order" : "Save Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD / EDIT CUSTOMER ==================== */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="surface-card w-full max-w-lg p-6 rounded-3xl border border-border shadow-2xl relative">
            <button
              onClick={() => {
                resetCustomerForm();
                setShowCustomerModal(false);
              }}
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition p-1"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 grid place-items-center">
                <Users className="size-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-foreground">
                  {editingCustomerId ? "Edit Customer Profile" : "Add New Customer"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {editingCustomerId
                    ? "Update student name, email, or bio"
                    : "Create a new student profile in the database"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={custFullName}
                  onChange={(e) => setCustFullName(e.target.value)}
                  placeholder="e.g. Tanvir Hasan"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  placeholder="tanvir@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Avatar / Profile Photo
                </label>
                <div className="flex items-center gap-2">
                  <label className="btn-outline-pill text-xs inline-flex items-center gap-1.5 cursor-pointer py-2 px-3">
                    {uploadingCustAvatar ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Upload className="size-3.5 text-purple-400" />
                    )}
                    <span>{uploadingCustAvatar ? "Uploading..." : "Upload Photo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCustomerAvatarUpload(file);
                      }}
                      disabled={uploadingCustAvatar}
                    />
                  </label>
                  <input
                    type="text"
                    value={custAvatarUrl}
                    onChange={(e) => setCustAvatarUrl(e.target.value)}
                    placeholder="or paste image URL..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Bio / Student Note
                </label>
                <textarea
                  rows={3}
                  value={custBio}
                  onChange={(e) => setCustBio(e.target.value)}
                  placeholder="Creative AI enthusiast, enrolled in batch 1..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:border-purple-500 resize-none text-xs"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    resetCustomerForm();
                    setShowCustomerModal(false);
                  }}
                  className="btn-outline-pill text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCustomer}
                  className="btn-gradient text-xs inline-flex items-center gap-2"
                >
                  {savingCustomer && <Loader2 className="size-4 animate-spin" />}
                  {editingCustomerId ? "Update Customer" : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
