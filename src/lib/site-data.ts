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

export const news = [
  {
    id: "news-chatgpt-water-energy-consumption",
    title: "ChatGPT-কে একটি প্রশ্ন করতে কতটুকু পানি আর বিদ্যুৎ খরচ হয় জানেন কি?",
    tag: "AI Tools",
    category: "AI Tools",
    tags: [
      "AI Tools",
      "Marketing",
      "Training Dataset",
      "Water Problem",
      "Environmental",
      "Big Data",
      "AI Environmental",
      "Water Usage",
      "Data Center",
      "OpenAI",
      "Tech News",
    ],
    cover_url:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    summary:
      "ChatGPT-কে একটি Prompt দিলে কত লিটার পানি আর কত Watt-hour বিদ্যুৎ খরচ হয়? কেন AI Data Center গুলো ঠান্ডা রাখতে পানির সংকট তৈরি হচ্ছে? AI-এর এই লুকানো পরিবেশগত মূল্য কতটা মারাত্মক?",
    content: `## আমেরিকান ডেটা সেন্টারের পানি সংকট
OpenAI এবং অন্যান্য টেক জায়ান্টদের AI মডেল ট্রেইনিং এবং কোটি কোটি প্রম্পট প্রসেস করতে মিলিয়ন মিলিয়ন গ্যালন পানির প্রয়োজন হচ্ছে। ডেটা সেন্টারগুলোর শক্তিশালী সার্ভার ও GPU ক্লাস্টার ২৪ ঘণ্টা ঠান্ডা রাখতে মূলত এই পানি বাষ্পীভূত কুলিং সিস্টেমে ব্যবহার করা হয়।

বিশেষ করে আইওয়া, অ্যারিজোনা ও টেক্সাসের মতো অঞ্চলে যেখানে পানির অভাব রয়েছে, সেখানে এই ডেটা সেন্টারগুলোর পানির অতিরিক্ত চাহিদা স্থানীয় মানুষের জন্য বড় সংকটের কারণ হয়ে দাঁড়াচ্ছে। গবেষণায় দেখা গেছে, মাঝারি আকারের একটি ডেটা সেন্টারে প্রতিদিন প্রায় ৩ থেকে ৫ লাখ গ্যালন পানি ব্যবহৃত হতে পারে।

## অ্যালগরিদমের শক্তির প্রভাব
প্রতিটি সাধারণ ChatGPT প্রম্পটে সাধারণ Google Search-এর তুলনায় প্রায় ১০ গুণ বেশি বিদ্যুৎ শক্তি ব্যয় হয়। GPT-4 মডেল ট্রেইনিং করতেই লাখ লাখ কিলোওয়াট-আওয়ার বিদ্যুৎ খরচ হয়েছে, যা শত শত পরিবারের সারা বছরের বিদ্যুতের সমান।

যদি বিশ্বজুড়ে AI ব্যবহার এভাবে বাড়তে থাকে, তবে ২০৩০ সালের মধ্যে AI ডেটা সেন্টারের বিদ্যুৎ খরচ ইউরোপের একটি বড় দেশের মোট বিদ্যুৎ ব্যবহারের সমপরিমাণ হতে পারে।

## ভবিষ্যতে ডেটা সেন্টারের টেকসই সমাধান
টেক কোম্পানিগুলো এখন বিকল্প শীতলীকরণ ব্যবস্থা এবং নবায়নযোগ্য শক্তির দিকে ঝুঁকছে। সমুদ্রের নিচে ডেটা সেন্টার স্থাপন, বায়বীয় তরল নিমজ্জন কুলিং (Liquid Immersion Cooling) এবং ক্ষুদ্র পারমাণবিক চুল্লি (Small Modular Reactors) ব্যবহারের পরিকল্পনা এগিয়ে চলছে।`,
    published_date: "2026-08-04",
    is_featured: true,
  },
  {
    id: "news-google-instagram-style-ai-search",
    title: "গুগল ঠিক ইনস্টাগ্রামের মতন ছবি আমাদের দেখাবে নাকি?",
    tag: "Social Media",
    category: "Social Media",
    tags: ["Google", "AI News", "Social Media", "Search", "Instagram", "Design"],
    cover_url:
      "https://images.unsplash.com/photo-1618172193763-c511deb635ca?auto=format&fit=crop&w=1200&q=80",
    summary:
      "গুগলের নতুন জেনারেটিভ এআই ফিড ফিচার কি সোশ্যাল মিডিয়ার অভিজ্ঞতা সম্পূর্ণ বদলে দিতে চলেছে? ইনস্টাগ্রামের মতো ভিজ্যুয়াল সার্চ নিয়ে গুগলের নতুন পরিকল্পনা।",
    content: `## ভিজ্যুয়াল সার্চের নতুন যুগ
গুগল তাদের সার্চ ইঞ্জিনে জেনারেটিভ এআই ভিত্তিক মাল্টিমোডাল ফিড যুক্ত করছে যা দেখতে অনেকটা ইনস্টাগ্রাম বা পিন্টারেস্টের মতো ভিজ্যুয়াল গ্রিড আকারে কাজ করবে।

সার্চ কোয়েরি দিলে এখন আর শুধু নীল রঙের টেক্সট লিঙ্ক আসবে না; বরং রিয়েল-টাইম জেনারেটেড ইনফোগ্রাফিক, ৩ডি মডেল এবং ইন্টারেক্টিভ ভিজ্যুয়াল কার্ড প্রদর্শিত হবে।

## ক্রিয়েটরদের জন্য এর প্রভাব
ওয়েবসাইট এবং কনটেন্ট ক্রিয়েটরদের এখন টেক্সট এসইও (SEO)-এর পাশাপাশি ভিজ্যুয়াল অপটিমাইজেশন ও ইমেজ প্রম্পট মেটাডাটার দিকে জোর দিতে হবে।`,
    published_date: "2026-08-03",
    is_featured: false,
  },
  {
    id: "news-nikola-tesla-ai-economics",
    title: "বিজ্ঞানী টেসলা আজকের দিনে এক ডলার পেতেন না!",
    tag: "Science News",
    category: "Science News",
    tags: ["Tesla", "Science News", "Economics", "AI History", "Innovation", "Business"],
    cover_url:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    summary:
      "নিকোলা টেসলার যুগান্তকারী আবিষ্কার এবং আজকের যুগে পেটেন্ট ও এআই প্রযুক্তির বাণিজ্যিকীকরণ নিয়ে একটি বিশেষ বিশ্লেষণ।",
    content: `## আবিষ্কার বনাম বাণিজ্যিক কর্তৃত্ব
নিকোলা টেসলা অল্টারনেটিং কারেন্ট (AC), ওয়্যারলেস ট্রান্সমিশন সহ অসংখ্য আবিষ্কার করেছিলেন কিন্তু বাণিজ্যিকীকরণ না জানায় তিনি নিঃস্ব অবস্থায় মারা যান।

আজকের এআই রেসে ওপেন সোর্স উদ্ভাবক বনাম মেগা-কর্পোরেশনের পেটেন্ট মনোপলি ঠিক একই ইতিহাসের পুনরাবৃত্তি ঘটাচ্ছে। ওপেন-ওয়েট মডেল নির্মাতারা সমাজকে এগিয়ে নিচ্ছেন, আর প্ল্যাটফর্মগুলো লাভ তুলে নিচ্ছে।`,
    published_date: "2026-08-02",
    is_featured: false,
  },
  {
    id: "news-are-you-becoming-outdated-in-ai-era",
    title: "আপনি কি আউটডেটেড হয়ে যেতে বসেছেন?",
    tag: "Career",
    category: "Career",
    tags: ["Career", "Productivity", "AI Tools", "Future of Work", "Tutorials", "Education"],
    cover_url:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
    summary:
      "এআই এর যুগে কোন স্কিলগুলো আপনাকে আগামী ৫ বছর প্রাসঙ্গিক রাখবে? কীভাবে নিজেকে অটোমেশনের সাথে মানিয়ে নেবেন এবং ক্যারিয়ারের নতুন সুযোগ তৈরি করবেন।",
    content: `## কোন কাজগুলো এআই আগে দখল করছে?
রুটিন কোডিং, বেসিক ড্রাফটিং, সাধারণ গ্রাফিক রিসাইজিং এবং ডাটা এন্ট্রি ইতিমধ্যেই স্বয়ংক্রিয় হয়ে গেছে।

## যে স্কিলগুলো আপনাকে অপ্রতিদ্বন্দ্বী রাখবে
১. **সিস্টেম থিঙ্কিং & আর্কিটেকচার**: টুলগুলোকে একসাথে পাইপলাইনে যুক্ত করে বিজনেস ভ্যালু তৈরি করা।
২. **প্রম্পট ইঞ্জিনিয়ারিং & ডিরেকশন**: সঠিক ইনপুট দিয়ে এআই থেকে বিশ্বমানের আউটপুট বের করে আনা।
৩. **হিউম্যান টেস্ট & কিউরেশন**: মানুষের আবেগ ও সাংস্কৃতিক গভীরতা স্পর্শ করা কনটেন্ট বাছাই করা।`,
    published_date: "2026-08-01",
    is_featured: false,
  },
  {
    id: "news-god-mode-chatgpt-5",
    title: "God Mode Unlocked in ChatGPT 5: Complete Breakdown",
    tag: "Product",
    category: "AI Tools",
    tags: ["ChatGPT", "OpenAI", "Productivity", "AI Tools", "Tutorials"],
    cover_url:
      "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80",
    summary:
      "The newest model handles multi-step research, long documents and tool use in one thread — here's the workflow our members are already shipping with it.",
    content: `## Autonomous Deep Research
The latest iterations of ChatGPT can plan multi-step workflows, query multiple data sources in parallel, cross-verify conflicting claims, and generate publication-ready whitepapers without manual prompting at every step.

## How to Leverage It Today
1. Define clear objective criteria.
2. Provide domain-specific reference constraints.
3. Enable code interpreter for deterministic calculation verification.`,
    published_date: "2026-07-29",
    is_featured: false,
  },
  {
    id: "news-sora-video-commercial-production",
    title: "Sora Long-Form Now Beats Traditional Commercial Sets",
    tag: "Video",
    category: "Design",
    tags: ["Sora", "Video", "Design", "Marketing", "AI Tools"],
    cover_url:
      "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80",
    summary:
      "Brands are producing broadcast-quality spots in a day. Here's the shot-list approach that keeps AI video consistent across scenes.",
    content: `## Consistency in AI Cinematography
With character seed-locking and camera trajectory coordinate control, creators can now produce multi-shot commercial campaigns with 100% consistent actors, lighting setups, and product placements.`,
    published_date: "2026-07-28",
    is_featured: false,
  },
];

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
