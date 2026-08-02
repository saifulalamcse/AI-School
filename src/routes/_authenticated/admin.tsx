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
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchCourses,
  fetchExperts,
  fetchPricingPlans,
  type DynamicCourse,
  type DynamicExpert,
  type DynamicPricingPlan,
} from "@/lib/site-api";

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
    meta: [{ title: "Admin Panel — My Course" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"courses" | "experts" | "lessons" | "prompts">(
    "courses",
  );
  const [lessonsCourseSlug, setLessonsCourseSlug] = useState<string | null>(null);

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
  const [loading, setLoading] = useState(true);

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
  const [uploadingPromptImg, setUploadingPromptImg] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    const [cData, eData, pData, promptsRes] = await Promise.all([
      fetchCourses(),
      fetchExperts(),
      fetchPricingPlans(),
      supabase.from("prompts").select("*").order("created_at", { ascending: false }),
    ]);
    setCourses(cData);
    setExperts(eData);
    setPlans(pData);
    setPrompts(promptsRes.data ?? []);
    setLoading(false);
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
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />
        <main className="pt-32 pb-24 max-w-2xl mx-auto px-5 text-center">
          <div className="size-16 rounded-2xl bg-amber-500/10 text-amber-400 grid place-items-center mx-auto text-2xl border border-amber-500/20">
            <Shield />
          </div>
          <h1 className="mt-5 font-display font-bold text-3xl">Admin Access Required</h1>
          <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
            Your account (<span className="text-foreground font-semibold">{user?.email}</span>) does
            not have Admin permissions. Please contact the administrator or run the Admin role
            assignment SQL script in Supabase.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/dashboard" className="btn-gradient text-sm">
              Back to Student Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-24">
        <div className="mx-auto max-w-7xl px-5">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-border">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Shield className="size-3.5" /> Admin Control Panel
              </div>
              <h1 className="mt-2 font-display font-bold text-3xl md:text-4xl">
                Manage <span className="gradient-text">My Course</span> Platform
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="surface-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Courses</span>
                <BookOpen className="size-4 text-purple-400" />
              </div>
              <div className="mt-2 font-display font-bold text-3xl gradient-text">
                {courses.length}
              </div>
            </div>

            <div className="surface-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Experts & Instructors</span>
                <Users className="size-4 text-pink-400" />
              </div>
              <div className="mt-2 font-display font-bold text-3xl gradient-text">
                {experts.length}
              </div>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="flex gap-2 mt-10 border-b border-border pb-3 flex-wrap">
            <button
              onClick={() => setActiveTab("courses")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === "courses"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              📚 Courses ({courses.length})
            </button>
            <button
              onClick={() => setActiveTab("experts")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === "experts"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              🎓 Experts / Instructors ({experts.length})
            </button>
            {lessonsCourseSlug && (
              <button
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  activeTab === "lessons"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
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
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              ✨ Prompt Library ({prompts.length})
            </button>
          </div>

          {/* TAB 1: COURSES MANAGEMENT */}
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

      <Footer />
    </div>
  );
}
