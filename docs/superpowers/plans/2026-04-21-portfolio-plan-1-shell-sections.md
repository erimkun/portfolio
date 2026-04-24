# Portfolio Plan 1 — Shell, Navigation & Static Sections

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor UnlockPage into a full scrollable SiteShell with DotNav, scroll-reactive background color, and all six portfolio sections (static content, no pixel river yet).

**Architecture:** `SiteShell` replaces `UnlockPage` as the post-unlock container. It holds a CSS scroll-snap container with six sections. `DotNav` uses IntersectionObserver to track the active section and allows click-to-scroll. Background hue shifts via CSS custom properties updated by `useScrollColor`. Content data lives in `src/data/content.js`.

**Tech Stack:** React 19, GSAP 3 (section reveal animations only in this plan), CSS scroll-snap, IntersectionObserver

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `src/data/content.js` | Tüm içerik verisi (eğitim, deneyim, proje) |
| Create | `src/components/SiteShell.jsx` | Post-unlock scroll container, tüm section'ları barındırır |
| Create | `src/components/HeroSection.jsx` | UnlockPage hero kısmı (ERDEN \| piksel \| ERİM) |
| Create | `src/components/DotNav.jsx` | Sağ kenar dot navigasyon |
| Create | `src/components/EducationSection.jsx` | Eğitim/sertifika timeline |
| Create | `src/components/ExperienceSection.jsx` | İş deneyimi timeline |
| Create | `src/components/ProjectsSection.jsx` | Proje grid'i |
| Create | `src/components/ContactSection.jsx` | Sosyal ikon'lar |
| Create | `src/hooks/useScrollColor.js` | Scroll pozisyonuna göre CSS var günceller |
| Modify | `src/App.jsx` | SiteShell'i import et, UnlockPage'i kaldır |
| Modify | `src/index.css` | SiteShell, DotNav, section stilleri |
| Delete | `src/components/UnlockPage.jsx` | SiteShell + HeroSection tarafından karşılanıyor |
| Keep | `src/components/AboutSection.jsx` | Mevcut, SiteShell'e entegre edilir |

---

## Task 1: İçerik Verisi

**Files:**
- Create: `src/data/content.js`

- [ ] **Step 1.1: Dosyayı oluştur**

```js
// src/data/content.js
export const education = [
  {
    id: 'edu-1',
    year: '2024',
    institution: 'Kurum Adı',
    degree: 'Sertifika veya Bölüm',
    description: 'Kısa açıklama buraya gelecek.',
  },
  {
    id: 'edu-2',
    year: '2022',
    institution: 'Kurum Adı 2',
    degree: 'Sertifika veya Bölüm 2',
    description: 'Kısa açıklama buraya gelecek.',
  },
]

export const experience = [
  {
    id: 'exp-1',
    company: 'Şirket Adı',
    role: 'Pozisyon / Unvan',
    period: '2023 — Günümüz',
    description: 'Görev ve sorumlulukların kısa açıklaması.',
  },
  {
    id: 'exp-2',
    company: 'Şirket Adı 2',
    role: 'Pozisyon / Unvan 2',
    period: '2021 — 2023',
    description: 'Görev ve sorumlulukların kısa açıklaması.',
  },
]

export const projects = [
  {
    id: 'proj-1',
    name: 'Proje Adı',
    description: 'Projenin ne yaptığını anlatan kısa açıklama.',
    tech: ['React', 'Node.js', 'CSS'],
    image: null,
    url: '#',
  },
  {
    id: 'proj-2',
    name: 'Proje Adı 2',
    description: 'Projenin ne yaptığını anlatan kısa açıklama.',
    tech: ['Figma', 'JavaScript'],
    image: null,
    url: '#',
  },
  {
    id: 'proj-3',
    name: 'Proje Adı 3',
    description: 'Projenin ne yaptığını anlatan kısa açıklama.',
    tech: ['Python', 'API'],
    image: null,
    url: '#',
  },
]

export const contact = [
  { id: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/KULLANICI_ADI', icon: 'linkedin' },
  { id: 'x',        label: 'X',        url: 'https://x.com/KULLANICI_ADI',          icon: 'x' },
  { id: 'instagram',label: 'Instagram', url: 'https://instagram.com/KULLANICI_ADI', icon: 'instagram' },
  { id: 'gmail',    label: 'Gmail',    url: 'mailto:EPOSTA_ADRESI',                  icon: 'gmail' },
]
```

- [ ] **Step 1.2: URL'leri kendi sosyal medya adreslerinle doldur** (LinkedIn, X, Instagram, Gmail)

- [ ] **Step 1.3: Eğitim ve deneyim verilerini kendi bilgilerinle güncelle**

---

## Task 2: HeroSection

**Files:**
- Create: `src/components/HeroSection.jsx`

- [ ] **Step 2.1: Dosyayı oluştur**

```jsx
// src/components/HeroSection.jsx
import { useRef, useEffect } from 'react'

export default function HeroSection({ visible, onReset }) {
  const nw1Ref = useRef(null)
  const imgRef = useRef(null)
  const nw2Ref = useRef(null)
  const subRef = useRef(null)

  useEffect(() => {
    const refs = [nw1Ref, imgRef, nw2Ref, subRef]
    if (!visible) {
      refs.forEach(r => r.current?.classList.remove('in'))
      return
    }
    const delays = [380, 450, 520, 800]
    const ids = refs.map((r, i) =>
      setTimeout(() => r.current?.classList.add('in'), delays[i])
    )
    return () => ids.forEach(clearTimeout)
  }, [visible])

  return (
    <section id="section-hero" className="portfolio-section hero-section" data-section-idx="0">
      <div className="unlock-content">
        <div className="unlocked-title">
          <span ref={nw1Ref} className="name-word">ERDEN</span>
          <img ref={imgRef} className="pixel-logo" src="/erimpixel.png" alt="" />
          <span ref={nw2Ref} className="name-word">ERİM</span>
        </div>
        <div ref={subRef} className="unlocked-sub">must to know ↓</div>
      </div>
      <button className="reset-btn" onClick={onReset}>reset</button>
    </section>
  )
}
```

---

## Task 3: useScrollColor Hook

**Files:**
- Create: `src/hooks/useScrollColor.js`

- [ ] **Step 3.1: Dosyayı oluştur**

```js
// src/hooks/useScrollColor.js
import { useEffect } from 'react'

const COLORS = [
  { bg: '#020714', grad: '220, 240' },   // Hero      — mavi
  { bg: '#0a0d2e', grad: '240, 260' },   // About     — mavi-mor
  { bg: '#0d0828', grad: '260, 280' },   // Education — mor-indigo
  { bg: '#1a1208', grad: '35, 45' },     // Experience— amber
  { bg: '#071a12', grad: '150, 160' },   // Projects  — yeşil
  { bg: '#1a0810', grad: '350, 10' },    // Contact   — kırmızı
]

export function useScrollColor(scrollerRef) {
  useEffect(() => {
    const container = scrollerRef.current
    if (!container) return

    const sections = Array.from(container.querySelectorAll('[data-section-idx]'))
    if (!sections.length) return

    const apply = (idx) => {
      const c = COLORS[idx] ?? COLORS[0]
      document.documentElement.style.setProperty('--section-bg', c.bg)
      document.documentElement.style.setProperty('--section-grad', c.grad)
    }

    apply(0)

    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.sectionIdx, 10)
            if (!Number.isNaN(idx)) apply(idx)
          }
        }
      },
      { root: container, threshold: 0.45 }
    )

    sections.forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [scrollerRef])
}
```

- [ ] **Step 3.2: CSS'e transition ekle — `src/index.css` `:root` bloğuna ekle**

```css
:root {
  --ink:      #e9e4d6;
  --ink-dim:  rgba(233,228,214,.55);
  --ink-faint:rgba(233,228,214,.18);
  --section-bg: #020714;
  --section-grad: 220, 240;
}
```

- [ ] **Step 3.3: `.stage` arka plan rengini CSS var'a bağla — `src/index.css` içinde `.stage` kuralını güncelle**

Mevcut:
```css
.stage {
  position: fixed; inset: 0;
  overflow: hidden;
  background: radial-gradient(120% 80% at 50% 100%, #0d1f3c 0%, #060c1e 55%, #020510 100%);
}
```

Yeni:
```css
.stage {
  position: fixed; inset: 0;
  overflow: hidden;
  background: radial-gradient(120% 80% at 50% 100%, #0d1f3c 0%, #060c1e 55%, var(--section-bg) 100%);
  transition: background 1.2s ease;
}
```

---

## Task 4: DotNav

**Files:**
- Create: `src/components/DotNav.jsx`

- [ ] **Step 4.1: Dosyayı oluştur**

```jsx
// src/components/DotNav.jsx
import { useState, useEffect } from 'react'

export default function DotNav({ sections, scrollerRef }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const container = scrollerRef.current
    if (!container) return

    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.sectionIdx, 10)
            if (!Number.isNaN(idx)) setActive(idx)
          }
        }
      },
      { root: container, threshold: 0.5 }
    )

    sections.forEach(({ id }) => {
      const el = container.querySelector(`#section-${id}`)
      if (el) io.observe(el)
    })

    return () => io.disconnect()
  }, [sections, scrollerRef])

  const scrollTo = (id) => {
    const el = scrollerRef.current?.querySelector(`#section-${id}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="dot-nav" aria-label="Bölüm navigasyonu">
      {sections.map((s, i) => (
        <button
          key={s.id}
          className={`dot-nav-item${active === i ? ' active' : ''}`}
          onClick={() => scrollTo(s.id)}
          aria-label={s.label}
          aria-current={active === i ? 'true' : undefined}
        >
          <span className="dot-nav-dot" />
          <span className="dot-nav-label">{s.label}</span>
        </button>
      ))}
    </nav>
  )
}
```

- [ ] **Step 4.2: DotNav CSS'ini `src/index.css` sonuna ekle**

```css
/* ── DOT NAV ─────────────────────────────────────────────── */
.dot-nav {
  position: fixed;
  right: 28px; top: 50%;
  transform: translateY(-50%);
  display: flex; flex-direction: column;
  gap: 18px; align-items: flex-end;
  z-index: 30;
}
.dot-nav-item {
  background: transparent; border: none; cursor: pointer;
  display: flex; align-items: center; gap: 10px;
  padding: 4px 0;
}
.dot-nav-dot {
  display: block;
  width: 5px; height: 5px; border-radius: 50%;
  background: rgba(233,228,214,.3);
  transition: width .3s ease, height .3s ease, background .3s ease, box-shadow .3s ease;
  flex-shrink: 0;
}
.dot-nav-item.active .dot-nav-dot,
.dot-nav-item:hover .dot-nav-dot {
  width: 8px; height: 8px;
  background: rgba(233,228,214,.9);
  box-shadow: 0 0 10px rgba(180,210,255,.7);
}
.dot-nav-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; letter-spacing: .38em; text-transform: uppercase;
  color: rgba(233,228,214,.5);
  opacity: 0;
  transform: translateX(6px);
  transition: opacity .2s ease, transform .2s ease;
  white-space: nowrap;
  pointer-events: none;
}
.dot-nav-item:hover .dot-nav-label { opacity: 1; transform: translateX(0); }
@media (max-width: 600px) {
  .dot-nav { right: 14px; gap: 14px; }
  .dot-nav-item { min-height: 44px; }
}
```

---

## Task 5: EducationSection

**Files:**
- Create: `src/components/EducationSection.jsx`

- [ ] **Step 5.1: Dosyayı oluştur**

```jsx
// src/components/EducationSection.jsx
import { useRef, useEffect } from 'react'
import { education } from '../data/content'

export default function EducationSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const items = section.querySelectorAll('.edu-card')
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add('visible')
        }
      },
      { threshold: 0.25 }
    )
    items.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="section-education"
      className="portfolio-section education-section"
      data-section-idx="2"
    >
      <div className="section-inner">
        <header className="section-header">
          <span className="section-tag">// EĞİTİM & SERTİFİKA</span>
          <h2 className="section-title">EDUCATION</h2>
        </header>

        <div className="edu-timeline">
          <span className="timeline-line" />
          {education.map((item) => (
            <article key={item.id} className="edu-card">
              <span className="timeline-dot" />
              <div className="edu-card-inner">
                <span className="edu-year">{item.year}</span>
                <h3 className="edu-institution">{item.institution}</h3>
                <p className="edu-degree">{item.degree}</p>
                <p className="edu-desc">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5.2: Education CSS'ini `src/index.css` sonuna ekle**

```css
/* ── EDUCATION ───────────────────────────────────────────── */
.education-section { padding: 12vh 8vw; }

.section-header { margin-bottom: 56px; }
.section-tag {
  display: block; margin-bottom: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; letter-spacing: .42em; text-transform: uppercase;
  color: rgba(180,210,255,.7);
}
.section-title {
  font-family: 'Anton', sans-serif;
  font-size: clamp(56px, 10vw, 120px);
  font-weight: 400; line-height: 0.9;
  color: #f5f0e2;
  text-shadow: 0 0 60px rgba(140,175,255,.15);
}

.edu-timeline {
  position: relative;
  padding-left: 48px;
  display: flex; flex-direction: column; gap: 40px;
}
.timeline-line {
  position: absolute; left: 7px; top: 8px; bottom: 8px;
  width: 1px;
  background: linear-gradient(
    180deg, rgba(180,210,255,.5) 0%, rgba(180,210,255,.08) 100%
  );
}
.edu-card {
  position: relative;
  opacity: 0; transform: translateX(-16px);
  transition: opacity .6s ease, transform .6s ease;
}
.edu-card.visible { opacity: 1; transform: translateX(0); }
.edu-card:nth-child(2) { transition-delay: .1s; }
.edu-card:nth-child(3) { transition-delay: .2s; }
.edu-card:nth-child(4) { transition-delay: .3s; }

.timeline-dot {
  position: absolute; left: -44px; top: 8px;
  width: 14px; height: 14px; border-radius: 50%;
  background: rgba(8,14,32,.9);
  border: 1px solid rgba(180,210,255,.55);
  box-shadow: 0 0 12px rgba(140,175,255,.3);
}
.edu-card-inner {
  padding: 24px 28px;
  background: rgba(12,22,46,.4);
  border: 1px solid rgba(180,210,255,.12);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.edu-year {
  display: block; margin-bottom: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; letter-spacing: .42em;
  color: rgba(180,210,255,.65);
}
.edu-institution {
  font-family: 'Anton', sans-serif;
  font-size: clamp(24px, 3.5vw, 44px);
  font-weight: 400; line-height: 1; margin-bottom: 6px;
  color: #f5f0e2;
}
.edu-degree {
  font-family: 'Fraunces', serif;
  font-size: 14px; font-style: italic; font-weight: 300;
  color: rgba(233,228,214,.65); margin-bottom: 12px;
}
.edu-desc {
  font-family: 'Fraunces', serif; font-weight: 300;
  font-size: clamp(14px, 1vw, 16px); line-height: 1.7;
  color: rgba(233,228,214,.75);
}
```

---

## Task 6: ExperienceSection

**Files:**
- Create: `src/components/ExperienceSection.jsx`

- [ ] **Step 6.1: Dosyayı oluştur**

```jsx
// src/components/ExperienceSection.jsx
import { useRef, useEffect } from 'react'
import { experience } from '../data/content'

export default function ExperienceSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const items = section.querySelectorAll('.exp-item')
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add('visible')
        }
      },
      { threshold: 0.2 }
    )
    items.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="section-experience"
      className="portfolio-section experience-section"
      data-section-idx="3"
    >
      <div className="section-inner">
        <header className="section-header">
          <span className="section-tag">// DENEYİM</span>
          <h2 className="section-title">EXPERIENCE</h2>
        </header>

        <div className="exp-list">
          {experience.map((item) => (
            <article key={item.id} className="exp-item">
              <div className="exp-meta">
                <span className="exp-period">{item.period}</span>
                <span className="exp-icon-dot" />
              </div>
              <div className="exp-content">
                <h3 className="exp-company">{item.company}</h3>
                <p className="exp-role">{item.role}</p>
                <p className="exp-desc">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6.2: Experience CSS'ini `src/index.css` sonuna ekle**

```css
/* ── EXPERIENCE ──────────────────────────────────────────── */
.experience-section { padding: 12vh 8vw; }

.exp-list { display: flex; flex-direction: column; gap: 0; }

.exp-item {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 0 32px;
  padding: 36px 0;
  border-bottom: 1px solid rgba(180,210,255,.08);
  opacity: 0; transform: translateY(20px);
  transition: opacity .6s ease, transform .6s ease;
}
.exp-item.visible { opacity: 1; transform: translateY(0); }
.exp-item:nth-child(2) { transition-delay: .15s; }
.exp-item:nth-child(3) { transition-delay: .3s; }

.exp-meta {
  display: flex; flex-direction: column;
  align-items: flex-end; gap: 12px;
  padding-top: 6px;
}
.exp-period {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; letter-spacing: .3em; text-transform: uppercase;
  color: rgba(180,210,255,.6);
  text-align: right;
}
.exp-icon-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: rgba(8,14,32,.9);
  border: 1px solid rgba(180,210,255,.5);
  box-shadow: 0 0 10px rgba(140,175,255,.3);
  flex-shrink: 0;
}
.exp-company {
  font-family: 'Anton', sans-serif;
  font-size: clamp(28px, 4vw, 54px);
  font-weight: 400; line-height: 0.95; margin-bottom: 8px;
  color: #f5f0e2;
}
.exp-role {
  font-family: 'Fraunces', serif;
  font-size: 14px; font-style: italic; font-weight: 300;
  color: rgba(233,228,214,.6); margin-bottom: 14px;
}
.exp-desc {
  font-family: 'Fraunces', serif; font-weight: 300;
  font-size: clamp(14px, 1vw, 16px); line-height: 1.75;
  color: rgba(233,228,214,.8);
}

@media (max-width: 700px) {
  .exp-item { grid-template-columns: 1fr; gap: 12px; }
  .exp-meta { align-items: flex-start; flex-direction: row; }
}
```

---

## Task 7: ProjectsSection

**Files:**
- Create: `src/components/ProjectsSection.jsx`

- [ ] **Step 7.1: Dosyayı oluştur**

```jsx
// src/components/ProjectsSection.jsx
import { useRef, useEffect } from 'react'
import { projects } from '../data/content'

export default function ProjectsSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const cards = section.querySelectorAll('.proj-card')
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add('visible')
        }
      },
      { threshold: 0.15 }
    )
    cards.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="section-projects"
      className="portfolio-section projects-section"
      data-section-idx="4"
    >
      <div className="section-inner">
        <header className="section-header">
          <span className="section-tag">// PROJELER</span>
          <h2 className="section-title">PROJECTS</h2>
        </header>

        <div className="proj-grid">
          {projects.map((proj) => (
            <a
              key={proj.id}
              href={proj.url}
              className="proj-card"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="proj-thumb">
                {proj.image ? (
                  <img src={proj.image} alt={proj.name} loading="lazy" />
                ) : (
                  <div className="proj-thumb-placeholder" />
                )}
              </div>
              <div className="proj-info">
                <h3 className="proj-name">{proj.name}</h3>
                <p className="proj-desc">{proj.description}</p>
                <ul className="proj-tech">
                  {proj.tech.map(t => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 7.2: Projects CSS'ini `src/index.css` sonuna ekle**

```css
/* ── PROJECTS ────────────────────────────────────────────── */
.projects-section { padding: 12vh 8vw; }

.proj-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.proj-card {
  position: relative;
  display: flex; flex-direction: column;
  background: rgba(12,22,46,.4);
  border: 1px solid rgba(180,210,255,.12);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  text-decoration: none; color: inherit;
  overflow: hidden;
  opacity: 0; transform: translateY(24px);
  transition:
    opacity .6s ease,
    transform .6s ease,
    box-shadow .3s ease,
    border-color .3s ease;
}
.proj-card.visible { opacity: 1; transform: translateY(0); }
.proj-card:nth-child(2) { transition-delay: .12s; }
.proj-card:nth-child(3) { transition-delay: .24s; }
.proj-card:nth-child(4) { transition-delay: .36s; }
.proj-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 60px rgba(0,0,0,.45);
  border-color: rgba(180,210,255,.28);
}

.proj-thumb {
  aspect-ratio: 16/9;
  overflow: hidden;
  background: #050a18;
}
.proj-thumb img { width: 100%; height: 100%; object-fit: cover; }
.proj-thumb-placeholder {
  width: 100%; height: 100%;
  background: linear-gradient(145deg, #0a1428, #040810);
}

.proj-info { padding: 24px; flex: 1; }
.proj-name {
  font-family: 'Anton', sans-serif;
  font-size: clamp(22px, 2.5vw, 36px);
  font-weight: 400; line-height: 1; margin-bottom: 10px;
  color: #f5f0e2;
}
.proj-desc {
  font-family: 'Fraunces', serif; font-weight: 300;
  font-size: 14px; line-height: 1.7;
  color: rgba(233,228,214,.75); margin-bottom: 16px;
}
.proj-tech {
  list-style: none; padding: 0;
  display: flex; flex-wrap: wrap; gap: 8px;
}
.proj-tech li {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; letter-spacing: .3em; text-transform: uppercase;
  padding: 4px 10px;
  border: 1px solid rgba(180,210,255,.2);
  color: rgba(180,210,255,.7);
}

@media (max-width: 700px) {
  .proj-grid { grid-template-columns: 1fr; }
}
```

---

## Task 8: ContactSection

**Files:**
- Create: `src/components/ContactSection.jsx`

- [ ] **Step 8.1: Sosyal ikon SVG'lerini `public/icons/` altına ekle**

Dört SVG dosyası gerekiyor: `linkedin.svg`, `x.svg`, `instagram.svg`, `gmail.svg`.
Aşağıdaki komutla placeholder dosyaları oluştur, sonra gerçek SVG'lerle değiştir:

```bash
mkdir -p public/icons
```

Her ikon için minimal SVG (geçici placeholder, gerçek ikonlarla değiştirilecek):

`public/icons/linkedin.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/>
  <rect x="2" y="9" width="4" height="12"/>
  <circle cx="4" cy="4" r="2"/>
</svg>
```

`public/icons/x.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
</svg>
```

`public/icons/instagram.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
</svg>
```

`public/icons/gmail.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
  <polyline points="22,6 12,13 2,6"/>
</svg>
```

- [ ] **Step 8.2: ContactSection.jsx oluştur**

```jsx
// src/components/ContactSection.jsx
import { useRef, useEffect } from 'react'
import { contact } from '../data/content'

export default function ContactSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const icons = section.querySelectorAll('.contact-icon-item')
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add('visible')
        }
      },
      { threshold: 0.3 }
    )
    icons.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="section-contact"
      className="portfolio-section contact-section"
      data-section-idx="5"
    >
      <div className="section-inner contact-inner">
        <header className="section-header">
          <span className="section-tag">// İLETİŞİM</span>
          <h2 className="section-title">LET'S<br />CONNECT</h2>
        </header>

        <ul className="contact-icons">
          {contact.map((item, i) => (
            <li
              key={item.id}
              className="contact-icon-item"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="contact-icon-link"
              >
                <img
                  src={`/icons/${item.icon}.svg`}
                  alt={item.label}
                  className="contact-icon-svg"
                />
                <span className="contact-icon-label">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
```

- [ ] **Step 8.3: Contact CSS'ini `src/index.css` sonuna ekle**

```css
/* ── CONTACT ─────────────────────────────────────────────── */
.contact-section { padding: 12vh 8vw; min-height: 100vh; }
.contact-inner {
  display: flex; flex-direction: column;
  justify-content: center; min-height: 80vh;
}

.contact-icons {
  list-style: none; padding: 0; margin-top: 56px;
  display: flex; gap: 32px; flex-wrap: wrap;
}
.contact-icon-item {
  opacity: 0; transform: translateY(20px);
  transition: opacity .5s ease, transform .5s ease;
}
.contact-icon-item.visible { opacity: 1; transform: translateY(0); }

.contact-icon-link {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  text-decoration: none; color: inherit;
}
.contact-icon-svg {
  width: 48px; height: 48px;
  filter: invert(1) opacity(0.7);
  transition: filter .25s ease, transform .25s ease;
}
.contact-icon-link:hover .contact-icon-svg {
  filter: invert(1) opacity(1);
  transform: translateY(-4px);
}
.contact-icon-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; letter-spacing: .4em; text-transform: uppercase;
  color: rgba(233,228,214,.45);
  transition: color .25s ease;
}
.contact-icon-link:hover .contact-icon-label { color: rgba(233,228,214,.85); }
```

---

## Task 9: SiteShell

**Files:**
- Create: `src/components/SiteShell.jsx`

- [ ] **Step 9.1: Dosyayı oluştur**

```jsx
// src/components/SiteShell.jsx
import { useRef } from 'react'
import { useParticles } from '../hooks/useParticles'
import { useScrollColor } from '../hooks/useScrollColor'
import HeroSection from './HeroSection'
import AboutSection from './AboutSection'
import EducationSection from './EducationSection'
import ExperienceSection from './ExperienceSection'
import ProjectsSection from './ProjectsSection'
import ContactSection from './ContactSection'
import DotNav from './DotNav'

const SECTIONS = [
  { id: 'hero',       label: 'HOME' },
  { id: 'about',      label: 'ABOUT' },
  { id: 'education',  label: 'EDUCATION' },
  { id: 'experience', label: 'EXPERIENCE' },
  { id: 'projects',   label: 'PROJECTS' },
  { id: 'contact',    label: 'CONTACT' },
]

export default function SiteShell({ visible, onReset }) {
  const canvasRef  = useRef(null)
  const scrollRef  = useRef(null)

  useParticles(canvasRef, visible)
  useScrollColor(scrollRef)

  return (
    <div className={`site-shell${visible ? ' on' : ''}`}>
      <canvas ref={canvasRef} className="particle-canvas" />
      <DotNav sections={SECTIONS} scrollerRef={scrollRef} />
      <div ref={scrollRef} className="shell-scroll">
        <HeroSection visible={visible} onReset={onReset} />
        <AboutSection />
        <EducationSection />
        <ExperienceSection />
        <ProjectsSection />
        <ContactSection />
      </div>
    </div>
  )
}
```

- [ ] **Step 9.2: SiteShell CSS'ini `src/index.css` içinde güncelle**

Mevcut `.unlock-overlay` ve `.unlock-scroll` bloklarını koru, aşağıdakileri ekle:

```css
/* ── SITE SHELL ──────────────────────────────────────────── */
.site-shell {
  position: fixed; inset: 0;
  display: flex; align-items: stretch;
  background: transparent;
  z-index: 10;
  opacity: 0; pointer-events: none;
  transition: opacity 0.9s ease, filter 1.1s ease .15s;
  filter: blur(14px);
}
.site-shell.on {
  opacity: 1; pointer-events: auto; filter: blur(0);
}

.shell-scroll {
  position: relative; z-index: 2;
  width: 100%; height: 100vh;
  overflow-y: auto; overflow-x: hidden;
  scroll-snap-type: y proximity;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: rgba(233,228,214,.18) transparent;
}
.shell-scroll::-webkit-scrollbar { width: 5px; }
.shell-scroll::-webkit-scrollbar-thumb {
  background: rgba(233,228,214,.15); border-radius: 3px;
}

/* ── SECTION BASE ────────────────────────────────────────── */
.portfolio-section {
  position: relative;
  min-height: 100vh;
  scroll-snap-align: start;
}

.section-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 12vh 0 8vh;
}

/* hero-section özel — padding yok, tam ekran merkezli */
.hero-section {
  display: flex; align-items: center; justify-content: center;
  padding: 0 3vw;
}
```

---

## Task 10: AboutSection Entegrasyonu

Mevcut `AboutSection.jsx` SiteShell'e uygun hale getirilmeli (section id ve data attribute ekle).

**Files:**
- Modify: `src/components/AboutSection.jsx`

- [ ] **Step 10.1: AboutSection'ın root `<section>` elementine id ve data-section-idx ekle**

`src/components/AboutSection.jsx` dosyasını aç. `<section ref={rootRef}` satırını bul:

```jsx
// ESKİ:
<section ref={rootRef} className={`about-section${revealed ? ' revealed' : ''}`}>

// YENİ:
<section
  ref={rootRef}
  id="section-about"
  className={`portfolio-section about-section${revealed ? ' revealed' : ''}`}
  data-section-idx="1"
>
```

---

## Task 11: App.jsx Güncelleme

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 11.1: UnlockPage'i SiteShell ile değiştir**

```jsx
// src/App.jsx
import { useState } from 'react'
import LockScreen from './components/LockScreen'
import SiteShell from './components/SiteShell'

export default function App() {
  const [unlocked, setUnlocked] = useState(false)
  const [lockKey, setLockKey]   = useState(0)

  function handleReset() {
    setUnlocked(false)
    setLockKey(k => k + 1)
  }

  return (
    <>
      <LockScreen key={lockKey} onUnlock={() => setUnlocked(true)} />
      <SiteShell visible={unlocked} onReset={handleReset} />
    </>
  )
}
```

- [ ] **Step 11.2: `src/components/UnlockPage.jsx`'i sil**

```bash
rm src/components/UnlockPage.jsx
```

---

## Task 12: Son Kontrol & CSS Temizlik

- [ ] **Step 12.1: Eski `.unlock-overlay` ve `.unlock-scroll` CSS bloklarını kaldır**

`src/index.css` içinde artık kullanılmayan şu blokları sil:
- `.unlock-overlay { ... }` (SiteShell tarafından karşılanıyor)
- `.unlock-scroll { ... }` (shell-scroll tarafından karşılanıyor)
- `.unlock-hero { ... }`
- `.reset-btn--floating { ... }`

`.unlock-content`, `.unlocked-title`, `.name-word`, `.pixel-logo`, `.unlocked-sub` sınıfları HeroSection tarafından hâlâ kullanılıyor — bunları koru.

- [ ] **Step 12.2: Dev sunucuyu başlat ve doğrula**

```bash
npm run dev
```

Kontrol listesi:
- [ ] Kilit ekranı açılıyor (gülümseme çiziliyor)
- [ ] Unlock olunca SiteShell fade-in yapıyor
- [ ] ERDEN | piksel logo | ERİM hero görünüyor
- [ ] Aşağı scroll yapılınca About → Education → Experience → Projects → Contact bölümleri görünüyor
- [ ] Sağ kenarda dot navigasyon var, aktif dot parlıyor
- [ ] Dot'a tıklayınca o bölüme atlıyor
- [ ] Education ve Experience kartları scroll ile fade-in yapıyor
- [ ] Contact sosyal ikonlar görünüyor
- [ ] Mobilde tek sütun çalışıyor

- [ ] **Step 12.3: Commit**

```bash
git add src/
git commit -m "feat: portfolio shell, all sections, dot navigation"
```

---

## Sonraki Adım

Plan 1 tamamlandıktan sonra çalışan, gezinebilir bir portfolio ortaya çıkıyor. Sonraki adım **Plan 2: PixelRiver Engine** — piksel nehir animasyonu ve section-bazında materialleşme efektleri.
