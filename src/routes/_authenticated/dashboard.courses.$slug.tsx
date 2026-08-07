import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Eye,
  Loader2,
  Lock,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/courses/$slug")({
  head: () => ({
    meta: [{ title: "Course Player — AI School" }],
  }),
  component: CoursePlayerPage,
});

type Lesson = {
  id: string;
  section_id: string;
  title: string;
  youtube_video_id: string | null;
  duration: string | null;
  description: string | null;
  is_free: boolean;
  position: number;
  completed?: boolean;
};

type Section = {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
};

function CoursePlayerPage() {
  const { slug } = useParams({ from: "/_authenticated/dashboard/courses/$slug" });
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sections, setSections] = useState<Section[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [completing, setCompleting] = useState(false);
  const playerRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    loadCourse();
  }, [slug, user]);

  async function loadCourse() {
    if (!user) return;
    setLoading(true);

    // Check enrollment
    const { data: enroll } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_slug", slug)
      .eq("status", "active")
      .maybeSingle();

    if (!enroll) {
      toast.error("You are not enrolled in this course.");
      navigate({ to: `/checkout/${slug}` });
      return;
    }

    // Load sections + lessons
    const { data: secData, error } = await supabase
      .from("sections")
      .select("*, lessons(*)")
      .eq("course_slug", slug)
      .order("position", { ascending: true });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Load completed lesson IDs
    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", user.id);

    const doneIds = new Set((progress ?? []).map((p) => p.lesson_id));
    setCompletedIds(doneIds);

    const processedSections = ((secData as Section[]) ?? []).map((sec) => ({
      ...sec,
      lessons: (sec.lessons ?? [])
        .sort((a, b) => a.position - b.position)
        .map((l) => ({ ...l, completed: doneIds.has(l.id) })),
    }));

    setSections(processedSections);

    // Auto-expand all sections and pick first lesson
    const allExpanded: Record<string, boolean> = {};
    processedSections.forEach((s) => (allExpanded[s.id] = true));
    setExpandedSections(allExpanded);

    // Find first incomplete lesson or first lesson
    let firstLesson: Lesson | null = null;
    for (const sec of processedSections) {
      const incomplete = sec.lessons.find((l) => !doneIds.has(l.id));
      if (incomplete) {
        firstLesson = incomplete;
        break;
      }
    }
    if (!firstLesson && processedSections.length > 0 && processedSections[0].lessons.length > 0) {
      firstLesson = processedSections[0].lessons[0];
    }
    setActiveLesson(firstLesson);
    setLoading(false);
  }

  async function markComplete(lessonId: string) {
    if (!user || completedIds.has(lessonId)) return;
    setCompleting(true);
    const { error } = await supabase
      .from("lesson_progress")
      .upsert({ user_id: user.id, lesson_id: lessonId });
    if (error) {
      toast.error(error.message);
    } else {
      const newSet = new Set(completedIds);
      newSet.add(lessonId);
      setCompletedIds(newSet);
      setSections((prev) =>
        prev.map((sec) => ({
          ...sec,
          lessons: sec.lessons.map((l) => (l.id === lessonId ? { ...l, completed: true } : l)),
        })),
      );
      toast.success("Lesson marked as complete! 🎉");
    }
    setCompleting(false);
  }

  const totalLessons = sections.reduce((s, sec) => s + sec.lessons.length, 0);
  const completedCount = completedIds.size;
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background grid place-items-center">
        <Loader2 className="size-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-5 pt-28 pb-24">
          <BookOpen className="size-12 text-purple-400 mx-auto mb-4" />
          <h1 className="font-display font-bold text-2xl">No lessons yet</h1>
          <p className="text-muted-foreground mt-2">
            The instructor hasn't added lessons yet. Check back soon!
          </p>
          <Link to="/dashboard" className="btn-gradient mt-6 inline-flex">
            ← Back to Dashboard
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-20">
        {/* Top Bar */}
        <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-16 z-10">
          <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft className="size-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:block">
                {completedCount}/{totalLessons} completed
              </span>
              <div className="w-32 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-purple-400">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="max-w-7xl mx-auto px-5 py-6 flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Course Outline */}
          <aside className="lg:w-80 shrink-0">
            <div className="surface-card p-4 lg:sticky lg:top-28">
              <h2 className="font-display font-bold text-base mb-4">Course Outline</h2>
              <div className="space-y-2">
                {sections.map((sec) => {
                  const secCompleted = sec.lessons.filter((l) => completedIds.has(l.id)).length;
                  return (
                    <div key={sec.id} className="rounded-xl border border-border overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition text-left"
                        onClick={() =>
                          setExpandedSections((prev) => ({
                            ...prev,
                            [sec.id]: !prev[sec.id],
                          }))
                        }
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{sec.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {secCompleted}/{sec.lessons.length} lessons
                          </p>
                        </div>
                        {expandedSections[sec.id] ? (
                          <ChevronUp className="size-4 text-muted-foreground shrink-0 ml-2" />
                        ) : (
                          <ChevronDown className="size-4 text-muted-foreground shrink-0 ml-2" />
                        )}
                      </button>

                      {expandedSections[sec.id] && (
                        <div className="border-t border-border divide-y divide-border/50">
                          {sec.lessons.map((lesson) => {
                            const isActive = activeLesson?.id === lesson.id;
                            const isDone = completedIds.has(lesson.id);
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => setActiveLesson(lesson)}
                                className={`w-full flex items-start gap-2.5 p-3 text-left transition ${
                                  isActive
                                    ? "bg-purple-500/15 text-purple-300"
                                    : "hover:bg-white/5 text-foreground"
                                }`}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                                ) : isActive ? (
                                  <PlayCircle className="size-4 text-purple-400 shrink-0 mt-0.5" />
                                ) : (
                                  <Circle className="size-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                                )}
                                <div className="min-w-0">
                                  <p className="text-xs font-medium leading-snug truncate">
                                    {lesson.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {lesson.duration && (
                                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                        <Clock className="size-2.5" />
                                        {lesson.duration}
                                      </span>
                                    )}
                                    {lesson.is_free && (
                                      <span className="text-xs text-sky-400 flex items-center gap-0.5">
                                        <Eye className="size-2.5" />
                                        Free
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main Content - Video Player */}
          <div className="flex-1 min-w-0">
            {activeLesson ? (
              <div>
                {/* Video Player */}
                {activeLesson.youtube_video_id ? (
                  <div
                    className="relative w-full rounded-2xl overflow-hidden bg-black"
                    style={{ paddingTop: "56.25%" }}
                  >
                    <iframe
                      ref={playerRef}
                      key={activeLesson.youtube_video_id}
                      src={`https://www.youtube.com/embed/${activeLesson.youtube_video_id}?rel=0&modestbranding=1&color=white`}
                      title={activeLesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-full rounded-2xl bg-white/5 border border-border flex flex-col items-center justify-center text-center gap-3 py-20">
                    <Lock className="size-10 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">
                      Video not yet available for this lesson.
                    </p>
                  </div>
                )}

                {/* Lesson Info & Actions */}
                <div className="mt-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h1 className="font-display font-bold text-xl md:text-2xl">
                      {activeLesson.title}
                    </h1>
                    {activeLesson.duration && (
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                        <Clock className="size-3.5" /> {activeLesson.duration}
                      </p>
                    )}
                    {activeLesson.description && (
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">
                        {activeLesson.description}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    {completedIds.has(activeLesson.id) ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
                        <CheckCircle2 className="size-4" /> Completed
                      </div>
                    ) : (
                      <button
                        onClick={() => markComplete(activeLesson.id)}
                        disabled={completing}
                        className="btn-gradient inline-flex items-center gap-2 text-sm"
                      >
                        {completing ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="size-4" />
                        )}
                        Mark as Complete
                      </button>
                    )}
                  </div>
                </div>

                {/* Next Lesson Nav */}
                <div className="mt-8 border-t border-border pt-6 flex items-center justify-between">
                  {(() => {
                    const allLessons = sections.flatMap((s) => s.lessons);
                    const idx = allLessons.findIndex((l) => l.id === activeLesson.id);
                    const prev = allLessons[idx - 1];
                    const next = allLessons[idx + 1];
                    return (
                      <>
                        <div>
                          {prev && (
                            <button
                              onClick={() => setActiveLesson(prev)}
                              className="text-sm text-muted-foreground hover:text-foreground transition flex items-center gap-1.5"
                            >
                              ← {prev.title}
                            </button>
                          )}
                        </div>
                        <div>
                          {next && (
                            <button
                              onClick={() => setActiveLesson(next)}
                              className="btn-gradient text-sm inline-flex items-center gap-1.5"
                            >
                              Next: {next.title} →
                            </button>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                Select a lesson from the sidebar to start learning.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
