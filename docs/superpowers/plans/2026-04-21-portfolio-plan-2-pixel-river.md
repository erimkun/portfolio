# Portfolio Plan 2 — PixelRiver Engine

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a scroll-reactive pixel river animation that flows between portfolio sections — pixels dissolve from the leaving section, snake down the screen, and materialise near the entering section's key element.

**Architecture:** A fixed canvas (`PixelRiver`) sits between the star-particle canvas and the scroll content. `usePixelRiver` drives a particle system via GSAP ScrollTrigger: one trigger per section-to-section transition, `scrub: 0.8` so scroll speed = flow speed. Paths are pre-calculated on mount/resize and cached. Each transition has its own accent colors and branch count (1 for most, 3–4 for Projects/Contact). The pixel river is purely decorative — section element reveals (photo scan-line, card fade-in) remain CSS/IntersectionObserver from Plan 1.

**Tech Stack:** GSAP 3 + ScrollTrigger (already installed), Canvas 2D API, React 19

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `src/data/riverConfig.js` | Transition configs, accent colors, path math utilities |
| Create | `src/hooks/usePixelRiver.js` | Particle system, path cache, RAF loop, ScrollTrigger lifecycle |
| Create | `src/components/PixelRiver.jsx` | Canvas element, mounts usePixelRiver |
| Modify | `src/components/SiteShell.jsx` | Add `riverCanvasRef`, render `<PixelRiver>` between particle canvas and scroll div |

---

## Task 1: riverConfig.js — Transition Data & Path Math

**Files:**
- Create: `src/data/riverConfig.js`

- [ ] **Step 1.1: Dosyayı oluştur**

```js
// src/data/riverConfig.js

// Per-section accent hues (matches useScrollColor COLORS array order)
export const SECTION_ACCENTS = [
  { h: 220, s: 70, l: 78 },  // 0 Hero       — mavi
  { h: 250, s: 65, l: 78 },  // 1 About      — mavi-mor
  { h: 270, s: 60, l: 78 },  // 2 Education  — mor-indigo
  { h: 40,  s: 70, l: 75 },  // 3 Experience — amber
  { h: 155, s: 60, l: 75 },  // 4 Projects   — yeşil
  { h: 350, s: 65, l: 78 },  // 5 Contact    — kırmızı
]

// One entry per inter-section transition (5 transitions for 6 sections).
// sourceNX / targetNX: normalized x (0-1) hint for where the river starts/ends.
// branches: how many end-paths (1 = single river, 3+ = splits like river delta).
export const TRANSITIONS = [
  {
    fromIdx: 0, toId: 'about',
    sourceNX: 0.50, targetNX: 0.22,  // center → photo (left)
    branches: 1,
  },
  {
    fromIdx: 1, toId: 'education',
    sourceNX: 0.22, targetNX: 0.12,  // photo → timeline left edge
    branches: 1,
  },
  {
    fromIdx: 2, toId: 'experience',
    sourceNX: 0.12, targetNX: 0.16,  // timeline → exp dots
    branches: 1,
  },
  {
    fromIdx: 3, toId: 'projects',
    sourceNX: 0.16, targetNX: 0.50,  // exp dots → card grid center (splits)
    branches: 3,
  },
  {
    fromIdx: 4, toId: 'contact',
    sourceNX: 0.50, targetNX: 0.50,  // card grid → icon row center (splits)
    branches: 4,
  },
]

// Generates a winding snake path from (x0,y0) to (x1,y1).
// Returns an array of {x,y} waypoints.
export function generatePath(x0, y0, x1, y1, amplitude = 70) {
  const SEGMENTS = 10
  const points = []
  for (let i = 0; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS
    // Ease-in-out for x, linear for y
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    const bx = x0 + (x1 - x0) * ease
    const by = y0 + (y1 - y0) * t
    // Sinusoidal lateral oscillation, dampened at start/end
    const wave = amplitude * Math.sin(t * Math.PI * 2.8) * Math.sin(t * Math.PI)
    points.push({ x: bx + wave, y: by })
  }
  return points
}

// Returns interpolated {x,y} at t=[0,1] along a path array.
export function getPathPoint(points, t) {
  if (t <= 0) return { ...points[0] }
  if (t >= 1) return { ...points[points.length - 1] }
  const last = points.length - 1
  const seg  = Math.floor(t * last)
  const segT = t * last - seg
  const a = points[seg]
  const b = points[Math.min(seg + 1, last)]
  return {
    x: a.x + (b.x - a.x) * segT,
    y: a.y + (b.y - a.y) * segT,
  }
}
```

- [ ] **Step 1.2: Build'de hata olmadığını kontrol et**

```bash
cd c:/Users/erden.aydogdu/Desktop/erimsite-react && npm run build 2>&1 | tail -5
```

Beklenen: `✓ built in ...ms` — hata yok.

---

## Task 2: usePixelRiver Hook

**Files:**
- Create: `src/hooks/usePixelRiver.js`

- [ ] **Step 2.1: Dosyayı oluştur**

```js
// src/hooks/usePixelRiver.js
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TRANSITIONS, SECTION_ACCENTS, generatePath, getPathPoint } from '../data/riverConfig'

gsap.registerPlugin(ScrollTrigger)

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }
function lerp(a, b, t) { return a + (b - a) * t }

function buildParticles(n) {
  return Array.from({ length: n }, (_, i) => ({
    offset:   i / n,                           // staggered lead along path (0-1)
    jx:       (Math.random() - 0.5) * 28,      // lateral jitter (pixels)
    jy:       (Math.random() - 0.5) * 10,
    size:     Math.random() < 0.14 ? 2 : 1,
    alpha:    0.45 + Math.random() * 0.55,
    branch:   i % 4,                           // used when branches > 1
  }))
}

// Pre-calculate all branch paths for every transition given current W/H.
function buildAllPaths(W, H) {
  return TRANSITIONS.map(tr => {
    const x0 = tr.sourceNX * W
    const y0 = H * 0.22
    const x1base = tr.targetNX * W
    const y1 = H * 0.72
    const n = tr.branches
    const spread = n > 1 ? W * 0.42 : 0

    return Array.from({ length: n }, (_, b) => {
      const offset = n > 1 ? (b / (n - 1) - 0.5) * spread : 0
      return generatePath(x0, y0, x1base + offset, y1, 65 + b * 14)
    })
  })
}

export function usePixelRiver(canvasRef, scrollerRef, active) {
  const stInstances = useRef([])

  useEffect(() => {
    if (!active) return
    const canvas   = canvasRef.current
    const scroller = scrollerRef.current
    if (!canvas || !scroller) return

    const ctx = canvas.getContext('2d')
    let W = canvas.width  = window.innerWidth
    let H = canvas.height = window.innerHeight

    const isMobile   = W < 768
    const N_PARTICLES = isMobile ? 160 : 340
    const particles  = buildParticles(N_PARTICLES)
    let paths        = buildAllPaths(W, H)

    const onResize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      paths = buildAllPaths(W, H)
    }
    window.addEventListener('resize', onResize)

    // One progress value per transition, mutated by ScrollTrigger
    const progValues = TRANSITIONS.map(() => 0)

    ScrollTrigger.defaults({ scroller })

    stInstances.current = TRANSITIONS.map((tr, i) =>
      ScrollTrigger.create({
        trigger: `#section-${tr.toId}`,
        start: 'top 95%',
        end:   'top 5%',
        scrub: 0.8,
        onUpdate:   self => { progValues[i] = self.progress },
        onLeaveBack: ()  => { progValues[i] = 0 },
      })
    )

    let raf
    const loop = () => {
      raf = requestAnimationFrame(loop)
      ctx.clearRect(0, 0, W, H)

      TRANSITIONS.forEach((tr, i) => {
        const prog = progValues[i]
        if (prog <= 0.001 || prog >= 0.999) return

        const fromAcc = SECTION_ACCENTS[tr.fromIdx]
        const toAcc   = SECTION_ACCENTS[tr.fromIdx + 1] ?? SECTION_ACCENTS[tr.fromIdx]
        const branchPaths = paths[i]

        for (const p of particles) {
          const bIdx     = p.branch % tr.branches
          const path     = branchPaths[bIdx]
          // Each particle leads by its offset — creates the flowing tail effect
          const pt       = clamp(prog * 1.35 - p.offset * 0.55, 0, 1)
          if (pt <= 0.001) continue

          const pos = getPathPoint(path, pt)
          // Lateral jitter oscillates gently as it flows
          const px  = pos.x + p.jx * Math.sin(prog * Math.PI * 4 + p.offset * 7)
          const py  = pos.y + p.jy

          // Color: lerp from-accent → to-accent as progress advances
          const h = Math.round(lerp(fromAcc.h, toAcc.h, prog))
          const s = Math.round(lerp(fromAcc.s, toAcc.s, prog))
          const l = Math.round(lerp(fromAcc.l, toAcc.l, prog))

          // Opacity: sine bell — fades in and out at extremes of path
          const fade = Math.sin(pt * Math.PI)
          const a    = p.alpha * fade

          const sz = p.size

          // Soft glow halo
          ctx.fillStyle = `hsla(${h},${s}%,${l}%,${a * 0.11})`
          ctx.fillRect(px - sz * 4, py - sz * 4, sz * 8, sz * 8)
          // Core pixel
          ctx.fillStyle = `hsla(${h},${s}%,${l + 10}%,${a * 0.88})`
          ctx.fillRect(px - sz, py - sz, sz * 2, sz * 2)
          // Highlight dot (larger particles only)
          if (sz >= 2) {
            ctx.fillStyle = `rgba(255,255,255,${a * 0.55})`
            ctx.fillRect(px, py, 1, 1)
          }
        }
      })
    }

    loop()

    return () => {
      cancelAnimationFrame(raf)
      stInstances.current.forEach(st => st.kill())
      stInstances.current = []
      ScrollTrigger.defaults({ scroller: undefined })
      window.removeEventListener('resize', onResize)
      ctx.clearRect(0, 0, W, H)
    }
  }, [active, canvasRef, scrollerRef])
}
```

- [ ] **Step 2.2: Build'de hata olmadığını kontrol et**

```bash
cd c:/Users/erden.aydogdu/Desktop/erimsite-react && npm run build 2>&1 | tail -5
```

Beklenen: `✓ built in ...ms`

---

## Task 3: PixelRiver Bileşeni

**Files:**
- Create: `src/components/PixelRiver.jsx`

- [ ] **Step 3.1: Dosyayı oluştur**

```jsx
// src/components/PixelRiver.jsx
import { useRef } from 'react'
import { usePixelRiver } from '../hooks/usePixelRiver'

export default function PixelRiver({ scrollerRef, active }) {
  const canvasRef = useRef(null)
  usePixelRiver(canvasRef, scrollerRef, active)

  return (
    <canvas
      ref={canvasRef}
      className="river-canvas"
      aria-hidden="true"
    />
  )
}
```

- [ ] **Step 3.2: CSS ekle — `src/index.css` sonuna ekle**

```css
/* ── PIXEL RIVER CANVAS ──────────────────────────────────── */
.river-canvas {
  position: fixed; inset: 0;
  width: 100%; height: 100%;
  z-index: 1;
  pointer-events: none;
  mix-blend-mode: screen;
}
```

`mix-blend-mode: screen` parlak piksellerin arka plan üzerinde parlayarak görünmesini sağlar — kozmik arka planla mükemmel uyum.

---

## Task 4: SiteShell Entegrasyonu

**Files:**
- Modify: `src/components/SiteShell.jsx`

- [ ] **Step 4.1: PixelRiver'ı SiteShell'e ekle**

`src/components/SiteShell.jsx` dosyasını şu hale getir:

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
import PixelRiver from './PixelRiver'

const SECTIONS = [
  { id: 'hero',       label: 'HOME'       },
  { id: 'about',      label: 'ABOUT'      },
  { id: 'education',  label: 'EDUCATION'  },
  { id: 'experience', label: 'EXPERIENCE' },
  { id: 'projects',   label: 'PROJECTS'   },
  { id: 'contact',    label: 'CONTACT'    },
]

export default function SiteShell({ visible, onReset }) {
  const canvasRef = useRef(null)
  const scrollRef = useRef(null)

  useParticles(canvasRef, visible)
  useScrollColor(scrollRef)

  return (
    <div className={`site-shell${visible ? ' on' : ''}`}>
      {/* z-index 0: star particles */}
      <canvas ref={canvasRef} className="particle-canvas" />
      {/* z-index 1: pixel river (screen blend) */}
      <PixelRiver scrollerRef={scrollRef} active={visible} />
      {/* z-index 2: section content */}
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

- [ ] **Step 4.2: Build ve tarayıcı doğrulaması**

```bash
cd c:/Users/erden.aydogdu/Desktop/erimsite-react && npm run build 2>&1 | tail -5
```

Beklenen: `✓ built in ...ms`

Ardından dev sunucusunu başlat:

```bash
npm run dev
```

Tarayıcıda `http://localhost:5173` adresini aç ve şunları doğrula:

- [ ] Kilit ekranı açılıyor, gülümseme çiziliyor
- [ ] Hero section görünüyor (ERDEN | piksel | ERİM)
- [ ] Hero → About arasında scroll yapınca mavi-mor piksel nehri ekranda aşağı akıyor
- [ ] About → Education geçişinde nehir mor tona kayıyor
- [ ] Education → Experience geçişinde amber renk görünüyor
- [ ] Experience → Projects geçişinde nehir 3 kola ayrılıyor (yeşil)
- [ ] Projects → Contact geçişinde 4 kol kırmızıya dönüyor
- [ ] Scroll hızı nehir hızını doğrudan etkiliyor (yavaş scroll = yavaş akış)
- [ ] Nehir mix-blend-mode: screen ile arka plandan parlayarak görünüyor

---

## Task 5: Performans & Edge Cases

**Files:**
- Modify: `src/hooks/usePixelRiver.js`

- [ ] **Step 5.1: `prefers-reduced-motion` desteği ekle**

`usePixelRiver.js` içinde `useEffect` başına şunu ekle:

```js
// useEffect içinde, active kontrolünden hemen sonra:
if (!active) return
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (prefersReduced) return  // animasyonu tamamen atla
```

Tam yerleşim — mevcut ilk iki satırdan sonra:

```js
useEffect(() => {
  if (!active) return
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return
  const canvas   = canvasRef.current
  // ... geri kalanı aynı
```

- [ ] **Step 5.2: ScrollTrigger refresh — SiteShell görünür olduğunda tetikle**

`usePixelRiver.js` içinde ScrollTrigger instance'ları oluşturduktan sonra bir `ScrollTrigger.refresh()` çağrısı ekle. Bu, `visible` prop geç geldiğinde trigger start/end pozisyonlarının yanlış hesaplanmasını önler.

ScrollTrigger instance'larını oluşturduktan sonra (`stInstances.current = ...` satırından sonra):

```js
// Trigger pozisyonlarını DOM yüklendikten sonra hesapla
const refreshId = setTimeout(() => ScrollTrigger.refresh(), 400)
```

Ve cleanup'a ekle:

```js
return () => {
  clearTimeout(refreshId)
  cancelAnimationFrame(raf)
  // ... geri kalanı aynı
```

- [ ] **Step 5.3: Son build kontrolü**

```bash
cd c:/Users/erden.aydogdu/Desktop/erimsite-react && npm run build 2>&1 | tail -5
```

Beklenen: `✓ built in ...ms` — hata, uyarı yok.

---

## Sonraki Adım

Plan 2 tamamlandığında piksel nehir sistemi çalışıyor olacak. İçerik verilerini (`src/data/content.js`) kendi bilgilerinle doldurmak ve kendi fotoğrafını eklemek son adım.
