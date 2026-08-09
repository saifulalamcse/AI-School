export const skillTracks = [
  {
    title: "AI Generalist",
    desc: "Master the fundamentals across every major AI tool and workflow.",
    icon: "✦",
  },
  {
    title: "Graphic Design & Branding",
    desc: "Design brands and visuals using AI-first design systems.",
    icon: "◆",
  },
  {
    title: "AI Video Production",
    desc: "Generate cinematic videos, ads and reels end-to-end with AI.",
    icon: "▶",
  },
  {
    title: "AI Automations",
    desc: "Build no-code automations that run your business on autopilot.",
    icon: "⚙",
  },
  {
    title: "AI-Enabled Copywriting",
    desc: "Write hooks, ads and long-form copy that actually converts.",
    icon: "✎",
  },
  {
    title: "Freelancing & Client Services",
    desc: "Land clients and deliver AI services at premium rates.",
    icon: "$",
  },
  {
    title: "Video Editing with AI",
    desc: "Edit faster with AI cutters, captions and motion effects.",
    icon: "▲",
  },
  {
    title: "AI-Enabled Marketing",
    desc: "Run high-performing campaigns powered by AI research and creative.",
    icon: "◎",
  },
] as const;

export const prompts = [
  {
    title: "Photorealistic Product Ad",
    category: "Image",
    tool: "Midjourney",
    text: "photorealistic product advertisement of [PRODUCT] on a glossy black podium, dramatic rim lighting, volumetric haze, macro detail, shot on 85mm, commercial studio photography --ar 4:5 --style raw",
  },
  {
    title: "Landing Page Wireframe",
    category: "Website",
    tool: "ChatGPT",
    text: "Act as a senior conversion copywriter and UX designer. Draft a section-by-section landing page wireframe for [PRODUCT] targeting [AUDIENCE]. For each section give: goal, headline, subhead, primary CTA and the proof element used.",
  },
  {
    title: "Cinematic Character Portrait",
    category: "Image",
    tool: "Midjourney",
    text: "cinematic portrait of [CHARACTER], shallow depth of field, teal and orange grade, practical neon lighting, film grain, anamorphic lens flare, 35mm --ar 2:3 --style raw",
  },
  {
    title: "Startup Explainer Script",
    category: "Video",
    tool: "Claude",
    text: "Write a 60-second explainer video script for [STARTUP]. Structure: hook (3s), problem (10s), solution (20s), how it works in 3 steps (20s), CTA (7s). Include on-screen text and b-roll notes per beat.",
  },
  {
    title: "UGC Ad Script for TikTok",
    category: "Copy",
    tool: "ChatGPT",
    text: "Write 5 UGC-style TikTok ad scripts for [PRODUCT]. Each: a scroll-stopping first line, casual spoken tone, one objection handled, one visual direction, and a soft CTA. Max 120 words each.",
  },
  {
    title: "Isometric App Illustration",
    category: "Image",
    tool: "Midjourney",
    text: "isometric 3d illustration of [SCENE], soft clay render, pastel gradient background, subtle ambient occlusion, clean vector-like edges, blender style --ar 1:1",
  },
  {
    title: "Brand Voice Guidelines",
    category: "Copy",
    tool: "Claude",
    text: "Create a brand voice guide for [BRAND] serving [AUDIENCE]. Include: 3 voice pillars, tone sliders, 10 do/don't examples, vocabulary list, and rewritten samples for a homepage hero, an error message and a support email.",
  },
  {
    title: "Cold Email Sequence",
    category: "Copy",
    tool: "ChatGPT",
    text: "Write a 4-email cold outreach sequence to [ICP] offering [SERVICE]. Email 1: pattern-interrupt hook. Email 2: proof + case study. Email 3: objection handling. Email 4: breakup. Under 90 words each, one CTA per email.",
  },
] as const;

export const testimonials = [
  { name: "Rezaul Karim", role: "Founder, Studio Nine", initials: "RK" },
  { name: "Tahmid Ahmed", role: "Creative Director", initials: "TA" },
  { name: "Nabila Rahman", role: "Head of Marketing", initials: "NR" },
  { name: "Sadman Islam", role: "Freelance Creator", initials: "SI" },
] as const;

export const workshops = [
  {
    title: "University Workshop",
    icon: "🎓",
    desc: "Bring AI School to your campus with hands-on sessions for students.",
  },
  {
    title: "Office Training",
    icon: "💼",
    desc: "Upskill your team with corporate AI workflows tailored to your stack.",
  },
  {
    title: "AI Business Automation",
    icon: "⚡",
    desc: "We audit and automate the boring parts of your business with AI.",
  },
] as const;

export const course = {
  slug: "creative-ai-community",
  title: "Creative AI Community",
  subtitle: "The community for creators building the next wave of AI-native work.",
  stats: [
    { label: "25 Hours+", sub: "of content" },
    { label: "New Classes", sub: "every week" },
    { label: "2 Live Sessions", sub: "per month" },
    { label: "Lifetime", sub: "community access" },
  ],
  topics: [
    "AI Generation",
    "Text-to-Video",
    "UGC Ads",
    "Landing Page Design",
    "Composite Design",
    "Green Screen",
    "Brand Systems",
    "Motion & Editing",
  ],
  inside: [
    { count: "33+", title: "Recorded Sessions", desc: "Watch anytime, anywhere." },
    { count: "New", title: "Lessons Every Week", desc: "Stay on the edge as tools evolve." },
    { count: "Live", title: "Sessions with Instructors", desc: "Q&A, feedback, real client work." },
  ],
} as const;
