"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { copy, portfolioData, t, type Lang } from "@/lib/portfolio-data"

const KEY = "sirius-portfolio-draft"

export function PortfolioClient() {
  const [lang, setLang] = useState<Lang>("en")
  const [filter, setFilter] = useState("all")
  const [active, setActive] = useState(0)
  const [data, setData] = useState(portfolioData)
  const [menuOpen, setMenuOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const prevActive = useRef(active)

  const R2_DATA_URL = "https://pub-9120ad04596f4681846007d76e7b4dfc.r2.dev/portfolio-data.json"

  useEffect(() => {
    // Try to load from R2 first (cloud — same on all devices)
    // Add cache-busting so we always get the latest saved version
    fetch(`${R2_DATA_URL}?t=${Date.now()}`)
      .then(res => {
        if (!res.ok) throw new Error("No cloud data yet")
        return res.json()
      })
      .then(cloudData => {
        setData(cloudData)
        // Keep localStorage in sync for offline use
        window.localStorage.setItem(KEY, JSON.stringify(cloudData))
      })
      .catch(() => {
        // Fall back to localStorage if R2 has no data yet
        const saved = window.localStorage.getItem(KEY)
        if (saved) setData(JSON.parse(saved))
      })
  }, [])

  // Lock body scroll when details panel is open
  useEffect(() => {
    document.body.style.overflow = detailsOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [detailsOpen])

  const closeDetails = useCallback(() => setDetailsOpen(false), [])

  // Intersection Observer for scroll-reveal
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]")
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add("is-visible"); io.unobserve(e.target) } }),
      { threshold: 0.12 }
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [data])

  const text = copy[lang]
  const categories = ["all", ...Array.from(new Set([...data.services.map(s => s.en), ...data.projects.map(p => p.category.en)]))]
  const projects = useMemo(() => data.projects.filter(p => filter === "all" || p.category.en === filter), [data.projects, filter])
  useEffect(() => { setActive(0) }, [filter])
  const project = projects[active] ?? projects[0]

  const go = (dir: number) => {
    prevActive.current = active
    setActive((active + dir + projects.length) % projects.length)
  }

  const isRTL = lang === "ar"

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="site-nav fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
          <Link href="/" className="brand-mark font-serif text-2xl tracking-normal">
            SIRIUS<span className="text-accent text-sm ml-px font-mono">.</span>
          </Link>
          <div className="hidden items-center gap-8 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground md:flex">
            {[["#work", text.work], ["#studio", text.about], ["#services", text.services], ["#contact", text.contact]].map(([href, label]) => (
              <a key={href} href={href} className="nav-link">{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(isRTL ? "en" : "ar")}
              className="language-switch rounded-full border border-border px-3 py-1.5 font-mono text-xs transition-all hover:border-accent hover:text-accent"
            >
              {isRTL ? "EN" : "عربي"}
            </button>
            <button className="menu-button md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              <span className={`menu-icon ${menuOpen ? "is-open" : ""}`} />
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="mobile-menu border-t border-border bg-background px-5 py-6 md:hidden">
            {[["#work", text.work], ["#studio", text.about], ["#services", text.services], ["#contact", text.contact]].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="mobile-menu-item">{label}</a>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section relative min-h-screen flex flex-col justify-center px-5 pt-28 pb-20 md:px-10 md:pt-36">
        {/* Ambient background elements */}
        <div className="hero-noise" aria-hidden="true" />
        <div className="star-field" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/></div>
        <div className="orbital-line" aria-hidden="true" />
        <div className="orbital-line orbital-line-2" aria-hidden="true" />
        <div className="hero-signal" aria-hidden="true">SIRIUS / {new Date().getFullYear()}</div>

        <div className="mx-auto w-full max-w-7xl">
          {/* Counter */}
          <div className="flex items-center gap-3 mb-8 reveal">
            <span className="eyebrow">{text.location}</span>
            <span className="h-px w-8 bg-border inline-block" />
            <span className="eyebrow">{new Date().getFullYear()}</span>
          </div>

          {/* Main heading — split for stagger */}
          <h1 className="hero-title font-serif font-medium text-6xl md:text-8xl lg:text-[10rem] tracking-tight leading-[0.9] reveal reveal-delay-1">
            {t(data.tagline, lang)}
          </h1>

          {/* Sub-row */}
          <div className="reveal reveal-delay-2 mt-14 flex flex-col gap-8 md:flex-row md:items-end md:justify-between max-w-5xl">
            <p className="hero-intro max-w-md text-lg leading-[1.7] text-muted-foreground">
              {t(data.intro, lang)}
            </p>
            <a href="#work" className="scroll-cue group flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em]">
              <span>{text.scroll}</span>
              <span className="scroll-cue-arrow">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <line x1="8" y1="0" x2="8" y2="14" stroke="currentColor" strokeWidth="1.5"/>
                  <polyline points="3,9 8,14 13,9" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
              </span>
            </a>
          </div>
        </div>

        {/* Floating ticker at bottom */}
        <div className="hero-ticker absolute bottom-0 inset-x-0 border-t border-border/40 overflow-hidden">
          <div className="ticker-track">
            {Array(6).fill(null).map((_, i) => (
              <span key={i} className="ticker-item">
                <span className="text-accent">✦</span> Photography
                <span className="text-accent">✦</span> Web design
                <span className="text-accent">✦</span> Data analysis
                <span className="text-accent">✦</span> Creative direction
                <span className="text-accent">✦</span> Tripoli, Libya &nbsp;&nbsp;&nbsp;
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORK ── */}
      <section id="work" className="w-full py-24 md:py-36">
        {/* Section header */}
        <div data-reveal className="scroll-reveal section-intro mb-12 flex flex-col gap-4 pt-6 px-5 md:px-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">01 / {text.work}</p>
            <h2 className="display-heading text-4xl md:text-5xl font-serif">Selected Archive</h2>
          </div>
          <div className="flex flex-col md:items-end gap-6">
            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map(cat => {
                const serviceObj = data.services.find(s => s.en === cat);
                const catObj = cat === "all" ? { en: text.all, ar: text.all } : serviceObj || data.projects.find(p => p.category.en === cat)?.category || { en: cat, ar: cat }
                return (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`filter-pill ${filter === cat ? "is-active" : ""}`}
                  >
                    {t(catObj, lang)}
                  </button>
                )
              })}
            </div>
            
            <div className="flex items-center gap-1">
              <button onClick={() => go(-1)} className="slider-btn group relative grid h-12 w-12 place-items-center overflow-hidden rounded-full border border-border transition-colors hover:border-accent">
                <span className="relative z-10 transition-transform group-hover:-translate-x-1">←</span>
              </button>
              <button onClick={() => go(1)} className="slider-btn group relative grid h-12 w-12 place-items-center overflow-hidden rounded-full border border-border transition-colors hover:border-accent">
                <span className="relative z-10 transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Project stage */}
        <div data-reveal className="scroll-reveal w-full relative">
          <div className="w-full relative bg-background">
            {/* Media area */}
            <div className="flex flex-col gap-px bg-border">
              {(() => {
                const ratioMap: Record<string, string> = {
                  "16:9": "aspect-video", "4:3": "aspect-[4/3]", "1:1": "aspect-square",
                  "4:5": "aspect-[4/5]", "3:4": "aspect-[3/4]", "9:16": "aspect-[9/16]", "cover": "aspect-video"
                }
                const ratioCls = ratioMap[project?.mediaRatio || "16:9"] || "aspect-video"
                const fitCls = project?.mediaRatio === "cover" ? "object-cover" : "object-contain"

                let mediaItems: { url: string; type: "image" | "video" }[] = []
                if (project?.media && project.media.length > 0) {
                  mediaItems = project.media.filter(m => m.url.trim() !== "")
                } else if (project) {
                  if (project.image) mediaItems.push({ url: project.image, type: "image" })
                  if (project.video) mediaItems.push({ url: project.video, type: "video" })
                }

                if (mediaItems.length === 0) {
                  return (
                    <div className={`project-media relative ${ratioCls} bg-muted overflow-hidden`}>
                      <div className="placeholder-grid" />
                      <div className="placeholder-label">
                        <span className="pulse-dot" />
                        <span>{text.media}</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none z-[1]" />
                      <div className="scan-line" />
                      <div className="absolute start-5 top-5 z-10 font-mono text-[11px] tracking-[0.15em] text-accent bg-background/80 px-2 py-1 backdrop-blur-sm">
                        {project?.index} / {String(projects.length).padStart(2, "0")}
                      </div>
                      <div className="absolute bottom-5 end-5 z-10 font-mono text-[11px] tracking-[0.12em] text-muted-foreground bg-background/70 px-2 py-1 backdrop-blur-sm">
                        {text.signal} · {project?.year}
                      </div>
                    </div>
                  )
                }

                return (
                  <>
                    {mediaItems.map((item, idx) => (
                      <div key={`${project?.id}-media-${idx}`} className={`project-media relative ${ratioCls} bg-muted overflow-hidden`}>
                        {item.type === "image" ? (
                          <img
                            src={item.url}
                            alt={project ? t(project.title, lang) : ""}
                            className={`project-image absolute inset-0 w-full h-full bg-black ${fitCls}`}
                          />
                        ) : (
                          <video
                            src={item.url}
                            muted autoPlay loop playsInline controls
                            className={`project-image absolute inset-0 w-full h-full bg-black z-[2] ${fitCls}`}
                          />
                        )}
                        
                        {idx === 0 && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none z-[1]" />
                            <div className="scan-line" />
                            <div className="absolute start-5 top-5 z-10 font-mono text-[11px] tracking-[0.15em] text-accent bg-background/80 px-2 py-1 backdrop-blur-sm">
                              {project?.index} / {String(projects.length).padStart(2, "0")}
                            </div>
                            <div className="absolute bottom-5 end-5 z-10 font-mono text-[11px] tracking-[0.12em] text-muted-foreground bg-background/70 px-2 py-1 backdrop-blur-sm">
                              {text.signal} · {project?.year}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </>
                )
              })()}
            </div>

            {/* Caption bar */}
            <div className="project-caption grid gap-0 border-t border-border md:grid-cols-[1fr_auto]">
              <div className="p-6 md:p-10 lg:p-16">
                <p className="eyebrow mb-3 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">{project && t(project.category, lang)}</p>
                <h3 className="project-title font-serif mt-1 text-5xl md:text-7xl lg:text-8xl leading-[0.95]">
                  {project && t(project.title, lang)}
                </h3>
                <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground">
                  {project && t(project.description, lang)}
                </p>
                <button onClick={() => setDetailsOpen(true)} className="mt-8 flex items-center gap-2 font-mono text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-accent hover:opacity-80 transition-opacity">
                  <span>[ {text.details} ]</span>
                </button>
              </div>
              {/* Nav column */}
              <div className="flex items-end justify-between gap-4 border-t border-border p-5 md:flex-col md:items-end md:border-t-0 md:border-s md:p-8">
                <div className="flex gap-2">
                  {projects.map((_, i) => (
                    <button key={i} onClick={() => setActive(i)} className={`slider-dot ${i === active ? "is-active" : ""}`} aria-label={`Project ${i + 1}`} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => go(isRTL ? 1 : -1)} className="slider-arrow" aria-label={text.previous}>
                    {isRTL ? "→" : "←"}
                  </button>
                  <button onClick={() => go(isRTL ? -1 : 1)} className="slider-arrow" aria-label={text.next}>
                    {isRTL ? "←" : "→"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STUDIO ── */}
      <section id="studio" className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-36">
          <div className="grid gap-16 md:grid-cols-[1fr_1.2fr] md:gap-24">
            {/* Left col */}
            <div data-reveal className="scroll-reveal">
              <p className="eyebrow mb-6">02 / {text.about}</p>
              <h2 className="display-heading">{t(data.studioTitle, lang)}</h2>
              {/* Vertical accent line */}
              <div className="mt-10 flex gap-4">
                <div className="w-px bg-accent opacity-60 self-stretch min-h-[60px]" />
                <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground leading-relaxed">
                  {text.location}<br />EST. 2024
                </p>
              </div>
            </div>

            {/* Right col */}
            <div data-reveal className="scroll-reveal flex flex-col justify-center gap-10">
              <p className="text-xl leading-[1.75] text-muted-foreground md:text-2xl">
                {t(data.studioBody, lang)}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="stat-card">
                  <span className="stat-number">∞</span>
                  <p className="stat-label">{text.independent}</p>
                </div>
                <div className="stat-card">
                  <span className="stat-number">24/7</span>
                  <p className="stat-label">{text.curious}</p>
                </div>
                <div className="stat-card">
                  <span className="stat-number">3+</span>
                  <p className="stat-label">{isRTL ? "خدمات إبداعية" : "Creative disciplines"}</p>
                </div>
                <div className="stat-card">
                  <span className="stat-number">2026</span>
                  <p className="stat-label">{isRTL ? "الجيل القادم" : "Next generation"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-36">
          <div data-reveal className="scroll-reveal mb-12">
            <p className="eyebrow mb-3">03 / {text.services}</p>
          </div>
          <div className="services-list border-t border-border">
            {data.services.map((service, i) => (
              <a 
                key={service.en} 
                href="#work"
                onClick={() => setFilter(service.en)}
                data-reveal 
                className="scroll-reveal service-row group"
                style={{ textDecoration: 'none' }}
              >
                <div className="flex items-center gap-6">
                  <span className="service-index">0{i + 1}</span>
                  <span className="service-name">{t(service, lang)}</span>
                </div>
                <span className="service-arrow">↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-36">
          <div data-reveal className="scroll-reveal contact-panel p-8 md:p-16">
            <p className="eyebrow mb-8">04 / {text.contact}</p>
            <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
              <h2 className="display-heading max-w-xl">
                {isRTL ? "لنصنع شيئاً يتحرك." : "Let's make\nsomething move."}
              </h2>
              <div className="flex flex-col gap-6 md:items-end">
                <div className="flex flex-wrap items-center gap-6">
                  <a
                    href={`mailto:${data.contact?.email || "hello@siriuscreative.co"}`}
                    className="contact-email"
                  >
                    {data.contact?.email || "hello@siriuscreative.co"}
                    <span className="contact-email-arrow">↗</span>
                  </a>
                  
                  {/* Social Icons */}
                  {(data.contact?.instagram || data.contact?.facebook) && (
                    <div className="flex items-center gap-3">
                      {data.contact?.instagram && (
                        <a href={data.contact.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors flex items-center justify-center w-10 h-10 rounded-full border border-border hover:border-accent" aria-label="Instagram">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        </a>
                      )}
                      {data.contact?.facebook && (
                        <a href={data.contact.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors flex items-center justify-center w-10 h-10 rounded-full border border-border hover:border-accent" aria-label="Facebook">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground mt-2 md:mt-0">
                  {text.location}
                </p>
              </div>
            </div>
          </div>

          <footer className="mt-8 flex flex-col gap-3 py-6 font-mono text-[11px] text-muted-foreground md:flex-row md:items-center md:justify-between">
            <span>© {new Date().getFullYear()} SIRIUS CREATIVE COLLECTIVE</span>
            <div className="flex items-center gap-4">
              <span>{text.location}</span>
              <span className="h-3 w-px bg-border" />
              <Link href="/admin" className="hover:text-accent transition-colors">{text.admin} ↗</Link>
            </div>
          </footer>
        </div>
      </section>

      {/* ── PROJECT DETAILS FULL SCREEN PANEL ── */}
      {detailsOpen && project && (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto bg-background"
          onClick={(e) => { if (e.target === e.currentTarget) closeDetails() }}
        >
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-5 py-4 backdrop-blur-md md:px-10">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold tracking-[-0.08em]">SIRIUS<span className="text-accent">.</span></span>
              <span className="hidden text-border sm:block">/</span>
              <span className="hidden font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground sm:block">{text.details}</span>
            </div>
            <button
              onClick={closeDetails}
              className="grid h-8 w-8 place-items-center border border-border text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          <div className="mx-auto max-w-5xl px-5 py-12 md:px-10 md:py-20">

            {/* ── META ROW ── */}
            <div className="mb-10 flex flex-wrap items-start justify-between gap-6 border-b border-border pb-10">
              <div>
                <p className="eyebrow mb-3">{t(project.category, lang)}</p>
                <h2 className="font-mono text-4xl font-bold tracking-[-0.06em] md:text-6xl leading-[1.05]">
                  {t(project.title, lang)}
                </h2>
              </div>
              <div className="flex flex-col gap-2 text-right font-mono text-sm text-muted-foreground">
                <span className="text-accent font-bold">{project.index}</span>
                <span>{project.year}</span>
              </div>
            </div>

            {/* ── MEDIA ── */}
            {(() => {
              let mediaItems: { url: string; type: "image" | "video" }[] = []
              if (project.media && project.media.length > 0) {
                mediaItems = project.media.filter(m => m.url.trim() !== "")
              } else {
                if (project.image) mediaItems.push({ url: project.image, type: "image" })
                if (project.video) mediaItems.push({ url: project.video, type: "video" })
              }

              if (mediaItems.length === 0) return null

              return (
                <div className="mb-10 flex flex-col gap-4">
                  {mediaItems.map((item, idx) => (
                    <div key={idx} className="w-full overflow-hidden border border-border bg-black">
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={t(project.title, lang)}
                          className={`w-full h-auto ${project.mediaRatio === "cover" ? "object-cover" : "object-contain"}`}
                          style={{ maxHeight: "80vh", display: "block" }}
                        />
                      ) : (
                        <video
                          src={item.url}
                          controls autoPlay loop muted playsInline
                          className={`w-full h-auto ${project.mediaRatio === "cover" ? "object-cover" : "object-contain"}`}
                          style={{ maxHeight: "80vh", display: "block" }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* ── OVERVIEW + FULL DESCRIPTION ── */}
            <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
              {/* Left: Overview */}
              <div className="flex flex-col gap-8">
                <div>
                  <p className="eyebrow mb-3">{isRTL ? "نظرة عامة" : "Overview"}</p>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {t(project.description, lang)}
                  </p>
                </div>
                {project.year && (
                  <div>
                    <p className="eyebrow mb-1">{text.year}</p>
                    <p className="font-mono text-lg text-foreground">{project.year}</p>
                  </div>
                )}
                {project.tools && (
                  <div>
                    <p className="eyebrow mb-3">{text.tools}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tools.split(',').map((tool, i) => (
                        <span
                          key={i}
                          className="rounded-full border border-border bg-muted px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
                        >
                          {tool.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Full Description */}
              <div>
                <p className="eyebrow mb-4">{isRTL ? "التفاصيل الكاملة" : "Full Description"}</p>
                <div className="prose prose-invert max-w-none">
                  <p className="text-lg leading-[1.85] text-muted-foreground whitespace-pre-wrap">
                    {t(project.fullDescription || project.description, lang)}
                  </p>
                </div>
              </div>
            </div>

            {/* ── BOTTOM NAV ── */}
            <div className="mt-16 flex items-center justify-between border-t border-border pt-8">
              <button
                onClick={() => { go(isRTL ? 1 : -1); }}
                className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-accent transition-colors"
              >
                ← {text.previous}
              </button>
              <button
                onClick={closeDetails}
                className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-accent transition-colors"
              >
                {isRTL ? "← العودة للأعمال" : "Back to work →"}
              </button>
              <button
                onClick={() => { go(isRTL ? -1 : 1); }}
                className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-accent transition-colors"
              >
                {text.next} →
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  )
}
