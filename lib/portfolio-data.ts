export type Lang = "en" | "ar"
export type Bilingual = { en: string; ar: string }
export type MediaItem = { url: string; type: "image" | "video" }
export type Project = { 
  id: string; 
  title: Bilingual; 
  category: Bilingual; 
  description: Bilingual; // brief description
  fullDescription: Bilingual; // full detailed description
  tools: string; // tools used
  image?: string; 
  video?: string; 
  media?: MediaItem[];
  mediaRatio: "1:1" | "4:5" | "16:9" | "9:16" | "4:3" | "3:4" | "cover";
  year: string; 
  index: string; 
}

export type PortfolioData = {
  studio: string;
  tagline: Bilingual;
  intro: Bilingual;
  studioTitle: Bilingual;
  studioBody: Bilingual;
  services: Bilingual[];
  projects: Project[];
  contact: {
    email: string;
    instagram: string;
    facebook: string;
  };
}

export const portfolioData: PortfolioData = {
  studio: "SIRIUS.",
  tagline: { en: "We make brands feel alive.", ar: "نمنح العلامات حياةً نابضة." },
  intro: { en: "An independent creative collective from Tripoli, Libya. We build identities, digital experiences, visual stories, and clear systems that move with people.", ar: "مجموعة إبداعية مستقلة من طرابلس، ليبيا. نبني هويات وتجارب رقمية وقصصاً بصرية وأنظمة واضحة تتحرك مع الناس." },
  studioTitle: { en: "Ideas with their own gravitational pull.", ar: "أفكار تمتلك جاذبيتها الخاصة." },
  studioBody: { en: "We turn clear thinking into expressive systems people can feel, use, and remember. Every project starts with a signal and ends with something that stays in orbit.", ar: "نحوّل التفكير الواضح إلى أنظمة تعبيرية يمكن للناس الشعور بها واستخدامها وتذكرها. يبدأ كل مشروع بإشارة وينتهي بشيء يبقى في المدار." },
  services: [
    { en: "Photography", ar: "التصوير الفوتوغرافي" }, { en: "Web design", ar: "تصميم المواقع" }, { en: "Data analysis", ar: "تحليل البيانات" }, { en: "Creative direction", ar: "الإخراج الإبداعي" },
  ],
  contact: {
    email: "hello@siriuscreative.co",
    instagram: "",
    facebook: "",
  },
  projects: [
    { id: "signal", index: "01", title: { en: "Signal / Food stories", ar: "سيغنال / قصص الطعام" }, category: { en: "Photography", ar: "التصوير الفوتوغرافي" }, description: { en: "Signature frames, menus, and social worlds that give every dish its own signal.", ar: "صور وقوائم وعوالم اجتماعية تمنح كل طبق إشاراته الخاصة." }, fullDescription: { en: "A complete visual identity and photography direction for a local restaurant.", ar: "هوية بصرية كاملة وتوجيه تصوير لمطعم محلي." }, tools: "Camera, Lightroom, Photoshop", image: "", video: "", mediaRatio: "16:9", year: "2026" },
    { id: "orbit", index: "02", title: { en: "Orbit / Digital home", ar: "أوربت / منزل رقمي" }, category: { en: "Web design", ar: "تصميم المواقع" }, description: { en: "A digital home with a clear point of view, built to move with the people inside it.", ar: "منزل رقمي برؤية واضحة، صُمم ليتحرك مع الأشخاص الذين يعيشون بداخله." }, fullDescription: { en: "We designed and developed a highly interactive web experience focusing on seamless animations.", ar: "قمنا بتصميم وتطوير تجربة ويب تفاعلية عالية تركز على الرسوم المتحركة السلسة." }, tools: "React, Next.js, Framer Motion", image: "", video: "", mediaRatio: "16:9", year: "2026" },
    { id: "vector", index: "03", title: { en: "Vector / Clearer signals", ar: "فيكتور / إشارات أوضح" }, category: { en: "Data analysis", ar: "تحليل البيانات" }, description: { en: "Turning scattered information into patterns, decisions, and systems people can act on.", ar: "نحوّل المعلومات المبعثرة إلى أنماط وقرارات وأنظمة يمكن للناس التصرف بناءً عليها." }, fullDescription: { en: "Deep data dive to optimize the client's internal dashboard and reporting.", ar: "غوص عميق في البيانات لتحسين لوحة التحكم الداخلية والتقارير للعميل." }, tools: "Python, SQL, Tableau", image: "", video: "", mediaRatio: "16:9", year: "2026" },
  ],
}
export const copy = {
  en: { work: "Selected work", about: "The studio", services: "What we do", contact: "Start a conversation", view: "View project", all: "All work", admin: "Studio admin", back: "Back to portfolio", save: "Save local draft", reset: "Reset draft", export: "Export JSON", saved: "Draft saved in this browser", media: "Media coming soon", addMedia: "Add image or video URL", menu: "Menu", close: "Close", scroll: "Scroll to explore", filter: "Filter work", signal: "Signal", independent: "Independent by design", curious: "Curious about culture", year: "Year", location: "Tripoli, Libya", footer: "Built across the Sirius", previous: "Previous project", next: "Next project", cms: "Local content studio", details: "Project details", tools: "Tools & Technologies" },
  ar: { work: "أعمال مختارة", about: "عن الاستوديو", services: "ماذا نقدم", contact: "ابدأ محادثة", view: "عرض المشروع", all: "كل الأعمال", admin: "إدارة الاستوديو", back: "العودة إلى الملف", save: "حفظ المسودة محلياً", reset: "إعادة المسودة", export: "تصدير JSON", saved: "تم حفظ المسودة في هذا المتصفح", media: "الوسائط قريباً", addMedia: "أضف رابط صورة أو فيديو", menu: "القائمة", close: "إغلاق", scroll: "مرر للاستكشاف", filter: "تصفية الأعمال", signal: "إشارة", independent: "استقلالية في التصميم", curious: "فضول تجاه الثقافة", year: "السنة", location: "طرابلس، ليبيا", footer: "نبني عبر سيريوس", previous: "المشروع السابق", next: "المشروع التالي", cms: "استوديو المحتوى المحلي", details: "تفاصيل المشروع", tools: "الأدوات والتقنيات" },
}
export const t = (value: Bilingual, lang: Lang) => value[lang]
