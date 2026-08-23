"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { copy, portfolioData, type Lang, type Project } from "@/lib/portfolio-data"
import R2Uploader from "./R2Uploader"

const KEY = "sirius-portfolio-draft"

async function hashInput(raw: string): Promise<string> {
  const enc = new TextEncoder().encode(raw)
  const buf = await crypto.subtle.digest("SHA-256", enc)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("")
}
// SHA-256("Sirius.2026!") — computed via browser devtools
// To change: run: crypto.subtle.digest("SHA-256", new TextEncoder().encode("YourNewPass")).then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")))
const PASS_HASH = "1b4695a0bbf7cd467c5e08fd760ac82c6c4cc52a5d73992accc384875cc1671d"
// ↑ This is SHA-256 of "123" as a temporary placeholder.
// Replace with real hash of your chosen password.

export function AdminEditor() {
  const [lang, setLang] = useState<Lang>("en")
  const [data, setData] = useState(portfolioData)
  const [status, setStatus] = useState("")
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState(false)
  const [authShake, setAuthShake] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const [lockTimer, setLockTimer] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = window.localStorage.getItem(KEY)
    if (saved) setData(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (!locked) return
    if (lockTimer <= 0) { setLocked(false); setAttempts(0); return }
    const t = setTimeout(() => setLockTimer(n => n - 1), 1000)
    return () => clearTimeout(t)
  }, [locked, lockTimer])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (locked) return
    const hash = await hashInput(password)
    if (hash === PASS_HASH) {
      setAuthenticated(true)
      setAuthError(false)
    } else {
      const next = attempts + 1
      setAttempts(next)
      setAuthError(true)
      setAuthShake(true)
      setPassword("")
      setTimeout(() => setAuthShake(false), 600)
      if (next >= 3) { setLocked(true); setLockTimer(30) }
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  if (!authenticated) {
    return (
      <main dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-background text-foreground flex items-center justify-center overflow-hidden">
        <div className="lock-bg-glow" aria-hidden="true" />
        <div className="lock-grid" aria-hidden="true" />
        <div className={`lock-card ${authShake ? "lock-shake" : ""}`}>
          <div className="lock-badge">
            <span className="lock-badge-dot" />
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">SIRIUS<span className="text-accent">.</span>CMS / RESTRICTED</span>
          </div>
          <h1 className="lock-title">
            {lang === "en" ? <><span>Studio</span><br /><span className="text-accent">Access</span></> : <><span>دخول</span><br /><span className="text-accent">الاستوديو</span></>}
          </h1>
          <p className="lock-subtitle">
            {lang === "en" ? "This area is restricted to the studio owner." : "هذه المنطقة مخصصة لمالك الاستوديو فقط."}
          </p>
          <form onSubmit={handleAuth} className="lock-form">
            <div className="lock-field-wrap">
              <label className="lock-label">{lang === "en" ? "Access Code" : "رمز الدخول"}</label>
              <input ref={inputRef} type="password" value={password} onChange={(e) => { setPassword(e.target.value); setAuthError(false) }} placeholder="••••••••••••" disabled={locked} autoFocus className={`lock-input ${authError ? "lock-input-error" : ""}`} />
              {authError && !locked && <p className="lock-error">{lang === "en" ? `Wrong code. ${3 - attempts} attempt${3 - attempts === 1 ? "" : "s"} left.` : `رمز خاطئ. ${3 - attempts} محاولة متبقية.`}</p>}
              {locked && <p className="lock-lockout">{lang === "en" ? `Locked. Try again in ${lockTimer}s.` : `مقفل. حاول بعد ${lockTimer} ثانية.`}</p>}
            </div>
            <button type="submit" disabled={locked} className="lock-submit">
              <span>{lang === "en" ? "Authenticate" : "تحقق من الهوية"}</span>
              <span className="lock-submit-arrow">→</span>
            </button>
          </form>
          <div className="lock-footer">
            <button type="button" onClick={() => setLang(lang === "en" ? "ar" : "en")} className="lock-lang-toggle">{lang === "en" ? "العربية" : "English"}</button>
            <Link href="/" className="lock-back-link">← {lang === "en" ? "Back to portfolio" : "العودة للملف"}</Link>
          </div>
        </div>
      </main>
    )
  }

  const updateProject = (id: string, field: "title" | "description" | "fullDescription" | "category" | "year" | "tools" | "mediaRatio", value: string) =>
    setData((cur) => ({
      ...cur,
      projects: cur.projects.map((p) => {
        if (p.id !== id) return p
        if (field === "year" || field === "tools" || field === "mediaRatio") return { ...p, [field]: value }
        return { ...p, [field]: { ...(p[field] as Record<string, string>), [lang]: value } }
      }),
    }))

  const save = () => { window.localStorage.setItem(KEY, JSON.stringify(data)); setStatus(copy[lang].saved); window.setTimeout(() => setStatus(""), 2500) }
  const reset = () => { setData(portfolioData); window.localStorage.removeItem(KEY); setStatus(copy[lang].reset) }
  const exportData = () => { const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "sirius-portfolio.json"; a.click(); URL.revokeObjectURL(url) }

  const addProject = () => {
    const newId = `project-${Date.now()}`
    const newProject: Project = {
      id: newId,
      index: String(data.projects.length + 1).padStart(2, "0"),
      title: { en: "New Project", ar: "مشروع جديد" },
      description: { en: "Brief description", ar: "وصف موجز" },
      fullDescription: { en: "Full details go here.", ar: "التفاصيل الكاملة توضع هنا." },
      tools: "React, Figma",
      category: { en: "design", ar: "تصميم" },
      year: new Date().getFullYear().toString(),
      image: "",
      video: "",
      mediaRatio: "16:9",
    }
    setData((cur) => ({ ...cur, projects: [...cur.projects, newProject] }))
  }

  const deleteProject = (id: string) => {
    if (!window.confirm(lang === "en" ? "Delete this project permanently?" : "حذف هذا المشروع نهائياً؟")) return
    setData((cur) => ({
      ...cur,
      projects: cur.projects.filter(p => p.id !== id).map((p, i) => ({ ...p, index: String(i + 1).padStart(2, "0") })),
    }))
  }

  return (
    <main dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-10">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-mono text-sm font-bold tracking-[-0.08em]">SIRIUS<span className="text-accent">.</span></Link>
            <span className="hidden text-border sm:block">/</span>
            <span className="hidden font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground sm:block">{copy[lang].cms}</span>
          </div>
          <div className="flex items-center gap-2">
            {status && <span className="admin-status-badge">{status}</span>}
            <button onClick={() => setLang(lang === "en" ? "ar" : "en")} className="rounded-full border border-border px-3 py-1.5 font-mono text-xs hover:border-accent hover:text-accent transition-colors">{lang === "en" ? "عربي" : "EN"}</button>
            <button onClick={save} className="rounded-full bg-accent px-4 py-1.5 font-mono text-xs font-medium text-accent-foreground hover:opacity-90 transition-opacity">{copy[lang].save}</button>
            <button onClick={() => setAuthenticated(false)} title="Sign out" className="grid place-items-center w-8 h-8 rounded-full border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors text-xs">✕</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-12 md:px-10 md:py-16">
        <div className="mb-12 flex flex-col gap-6 border-b border-border pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-4">SIRIUS / {copy[lang].cms}</p>
            <h1 className="font-mono text-4xl font-bold tracking-[-0.08em] md:text-6xl">{copy[lang].admin}</h1>
            <p className="mt-4 max-w-lg text-muted-foreground leading-relaxed">
              {lang === "en" ? "Manage projects, update content, control what the world sees. Saved locally, exportable anytime." : "أدر المشاريع، حدّث المحتوى، تحكم فيما يراه العالم. يُحفظ محلياً ويُصدَّر في أي وقت."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={exportData} className="rounded-full border border-border px-4 py-2 text-sm hover:border-accent hover:text-accent transition-colors">{copy[lang].export}</button>
            <button onClick={reset} className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:border-foreground transition-colors">{copy[lang].reset}</button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{lang === "en" ? `${data.projects.length} Projects` : `${data.projects.length} مشروع`}</p>
          <button onClick={addProject} className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-accent hover:text-accent transition-colors">
            <span className="text-accent font-bold">+</span> {lang === "en" ? "Add project" : "إضافة مشروع"}
          </button>
        </div>

        <div className="grid gap-6">
          {data.projects.map((project: Project) => (
            <section key={project.id} className="admin-project-card grid gap-6 border border-border bg-muted p-6 md:grid-cols-[200px_1fr] md:p-8">
              <div className="flex flex-col gap-3">
                <div className="grid gap-2">
                  {(() => {
                    const ratioClass: Record<string, string> = {
                      "16:9": "aspect-video", "4:3": "aspect-[4/3]", "1:1": "aspect-square",
                      "4:5": "aspect-[4/5]", "3:4": "aspect-[3/4]", "9:16": "aspect-[9/16]", "cover": "aspect-video"
                    }
                    const cls = ratioClass[project.mediaRatio || "16:9"] || "aspect-video"
                    const fit = project.mediaRatio === "cover" ? "object-cover" : "object-contain"
                    return (
                      <>
                        <div className={`${cls} w-full overflow-hidden border border-border bg-background relative`}>
                          {project.image
                            ? <img src={project.image} alt="Preview" className={`absolute inset-0 h-full w-full ${fit} transition-all duration-500 hover:scale-105`} />
                            : <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-muted-foreground">NO IMAGE</div>
                          }
                        </div>
                        <div className={`${cls} w-full overflow-hidden border border-border bg-background relative`}>
                          {project.video
                            ? <video src={project.video} muted loop autoPlay playsInline className={`absolute inset-0 h-full w-full ${fit} transition-all duration-500 hover:scale-105`} />
                            : <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-muted-foreground">NO VIDEO</div>
                          }
                        </div>
                      </>
                    )
                  })()}
                </div>
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-accent">{project.index} · {project.year}</p>
              </div>

              <div className="grid gap-5 content-start">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="admin-field">
                    <span className="admin-label">{lang === "en" ? "Title" : "العنوان"}</span>
                    <input value={project.title[lang]} onChange={(e) => updateProject(project.id, "title", e.target.value)} className="admin-input text-xl font-semibold" />
                  </label>
                  <label className="admin-field">
                    <span className="admin-label">{lang === "en" ? "Category" : "التصنيف"}</span>
                    <input value={project.category[lang]} onChange={(e) => updateProject(project.id, "category", e.target.value)} className="admin-input" />
                  </label>
                </div>
                <label className="admin-field">
                  <span className="admin-label">{lang === "en" ? "Brief Description" : "الوصف الموجز"}</span>
                  <textarea value={project.description[lang]} onChange={(e) => updateProject(project.id, "description", e.target.value)} rows={2} className="admin-input resize-none leading-relaxed" />
                </label>
                <label className="admin-field">
                  <span className="admin-label">{lang === "en" ? "Full Description" : "الوصف الكامل"}</span>
                  <textarea value={project.fullDescription?.[lang] || ""} onChange={(e) => updateProject(project.id, "fullDescription", e.target.value)} rows={4} className="admin-input resize-none leading-relaxed" />
                </label>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="admin-field">
                    <span className="admin-label">{lang === "en" ? "Tools (e.g. React, Figma)" : "الأدوات"}</span>
                    <input value={project.tools || ""} onChange={(e) => updateProject(project.id, "tools", e.target.value)} className="admin-input" />
                  </label>
                  <div className="admin-field">
                    <span className="admin-label">{lang === "en" ? "Aspect Ratio" : "نسبة الأبعاد"}</span>
                    <div className="grid grid-cols-4 gap-2 mt-1">
                      {([
                        { value: "16:9",  label: "16:9",  style: "aspect-video w-8 h-5",          hint: "Landscape" },
                        { value: "4:3",   label: "4:3",   style: "w-8 h-6",                        hint: "Classic" },
                        { value: "1:1",   label: "1:1",   style: "w-6 h-6",                        hint: "Square" },
                        { value: "4:5",   label: "4:5",   style: "w-6 h-[30px]",                   hint: "Portrait" },
                        { value: "3:4",   label: "3:4",   style: "w-6 h-8",                        hint: "Tall" },
                        { value: "9:16",  label: "9:16",  style: "w-[18px] h-8",                   hint: "Story" },
                        { value: "cover", label: "Fill",  style: "w-8 h-5",                        hint: "Crop fill" },
                      ] as const).map(({ value, label, style, hint }) => (
                        <button
                          key={value}
                          type="button"
                          title={hint}
                          onClick={() => updateProject(project.id, "mediaRatio", value)}
                          className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-all hover:border-accent ${(project.mediaRatio || "16:9") === value ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground"}`}
                        >
                          <div className={`${style} border-2 ${(project.mediaRatio || "16:9") === value ? "border-accent" : "border-current"} rounded-[2px]`} />
                          <span className="font-mono text-[9px] leading-none">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="admin-field">
                    <span className="admin-label">{lang === "en" ? "Image URL" : "رابط الصورة"}</span>
                    <div className="flex flex-col gap-3">
                      <input value={project.image} onChange={(e) => setData((cur) => ({ ...cur, projects: cur.projects.map(p => p.id === project.id ? { ...p, image: e.target.value } : p) }))} className="admin-input font-mono text-xs" placeholder="https://..." />
                      <R2Uploader onUploadSuccess={(url) => setData((cur) => ({ ...cur, projects: cur.projects.map(p => p.id === project.id ? { ...p, image: url } : p) }))} />
                    </div>
                  </div>
                  <div className="admin-field">
                    <span className="admin-label">{lang === "en" ? "Video URL" : "رابط الفيديو"}</span>
                    <div className="flex flex-col gap-3">
                      <input value={project.video || ""} onChange={(e) => setData((cur) => ({ ...cur, projects: cur.projects.map(p => p.id === project.id ? { ...p, video: e.target.value } : p) }))} className="admin-input font-mono text-xs" placeholder="https://..." />
                      <R2Uploader onUploadSuccess={(url) => setData((cur) => ({ ...cur, projects: cur.projects.map(p => p.id === project.id ? { ...p, video: url } : p) }))} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <label className="flex items-center gap-3">
                    <span className="admin-label">{lang === "en" ? "Year" : "السنة"}</span>
                    <input value={project.year} onChange={(e) => updateProject(project.id, "year", e.target.value)} className="admin-input-sm font-mono" maxLength={4} />
                  </label>
                  <button onClick={() => deleteProject(project.id)} className="admin-delete-btn">{lang === "en" ? "Delete ✕" : "حذف ✕"}</button>
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 flex justify-end border-t border-border pt-8">
          <button onClick={save} className="rounded-full bg-accent px-8 py-3 font-mono text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity">{copy[lang].save} ✓</button>
        </div>
      </div>
    </main>
  )
}
