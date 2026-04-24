# Projects Mosaic Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the scattered project card grid with a 9-cell voronoi-style polygonal mosaic where each cell is clipped to a unique geometric shape, divided by thin light-colored SVG lines, with project images covering each cell and info overlay at the bottom.

**Architecture:** Each of the 9 cells is an `<a>` element positioned `absolute; inset: 0` (full container) and clipped via CSS `clip-path: polygon(...)` to its cell shape. A `preserveAspectRatio="none"` SVG overlay draws 4 diagonal polylines as the dividing grid lines. The mosaic container uses `aspect-ratio: 16/9`.

**Tech Stack:** React (JSX), CSS clip-path polygons, SVG polylines, IntersectionObserver

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/ProjectsSection.jsx` | **Full rewrite** | Mosaic layout — 9 clipped cells + SVG lines + sparkle icon |
| `src/index.css` | **Append** | `.mosaic-*` CSS rules at end of file — do NOT touch existing `.proj-*` rules |

---

## Task 1: Verify dev server starts and projects section is visible

**Files:** —

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Expected output includes: `Local: http://localhost:5173/` (or similar port)

- [ ] **Step 2: Manually verify current state**

Open browser → navigate to portfolio → scroll to PROJECTS section. Confirm you see the scattered card layout with 9 cards. This is the baseline we are replacing.

---

## Task 2: Add mosaic CSS rules to `src/index.css`

**Files:**
- Modify: `src/index.css` (append after the last line, after the `[data-river-node].river-bound` block)

- [ ] **Step 1: Append the mosaic CSS block**

Open `src/index.css` and append the following at the very end (after line 1334):

```css
/* ── PROJECTS MOSAIC ─────────────────────────────────────── */
.projects-section.mosaic-projects {
  padding: 2vh 5vw 3vh;
}
.projects-section.mosaic-projects .section-inner {
  max-width: 1400px;
  padding: 7vh 0 3vh;
}
.projects-section.mosaic-projects .section-header {
  margin-bottom: clamp(10px, 1.4vh, 20px);
}
.projects-section.mosaic-projects .section-title {
  font-size: clamp(52px, 7.5vw, 110px);
}

.mosaic-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: rgba(2, 7, 20, 0.4);
}

.mosaic-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.mosaic-lines polyline {
  stroke: rgba(180, 210, 255, 0.28);
  stroke-width: 1;
  fill: none;
  vector-effect: non-scaling-stroke;
}

.mosaic-cell {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  display: block;
  opacity: 0;
  transition: opacity 0.5s steps(8, end);
  cursor: pointer;
}

.mosaic-cell.visible {
  opacity: 1;
}

.mosaic-cell-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: filter 0.35s ease, transform 0.45s ease;
}

.mosaic-cell:hover .mosaic-cell-img {
  filter: brightness(1.12) saturate(1.18);
  transform: scale(1.04);
}

.mosaic-cell-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 14px;
  background: linear-gradient(
    to top,
    rgba(2, 7, 20, 0.93) 0%,
    rgba(2, 7, 20, 0.6) 45%,
    transparent 100%
  );
  z-index: 1;
}

.mosaic-cell-name {
  font-family: 'Anton', sans-serif;
  font-size: clamp(10px, 1.2vw, 17px);
  font-weight: 400;
  line-height: 1;
  margin-bottom: 4px;
  color: #f5f0e2;
}

.mosaic-cell-desc {
  font-family: 'Fraunces', serif;
  font-weight: 300;
  font-size: clamp(7px, 0.65vw, 10px);
  line-height: 1.45;
  color: rgba(233, 228, 214, 0.75);
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mosaic-cell-tech {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.mosaic-cell-tech li {
  font-family: 'JetBrains Mono', monospace;
  font-size: clamp(5.5px, 0.5vw, 7.5px);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  padding: 2px 5px;
  border: 1px solid rgba(180, 210, 255, 0.24);
  color: rgba(192, 221, 255, 0.78);
  background: rgba(8, 16, 34, 0.35);
}

.mosaic-sparkle {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 3;
  opacity: 0.55;
  pointer-events: none;
}

@media (max-width: 780px) {
  .projects-section.mosaic-projects {
    padding: 8vh 6vw;
  }
  .mosaic-container {
    aspect-ratio: auto;
    height: auto;
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: rgba(180, 210, 255, 0.08);
  }
  .mosaic-cell {
    position: relative;
    inset: auto;
    width: 100%;
    height: 180px;
    clip-path: none !important;
    opacity: 1;
    flex-shrink: 0;
  }
  .mosaic-lines,
  .mosaic-sparkle {
    display: none;
  }
}
```

- [ ] **Step 2: Save and verify no CSS parse errors**

The dev server (HMR) should reload without errors in the browser console. No visual change expected yet — the new CSS classes are not used in any component yet.

---

## Task 3: Rewrite `src/components/ProjectsSection.jsx`

**Files:**
- Modify: `src/components/ProjectsSection.jsx` (full file replacement)

- [ ] **Step 1: Replace the full file content**

```jsx
import { useRef, useEffect } from 'react'
import { projects } from '../data/content'

const CLIP_PATHS = [
  'polygon(0% 0%, 37% 0%, 35% 48%, 0% 46%)',
  'polygon(37% 0%, 67% 0%, 68% 45%, 35% 48%)',
  'polygon(67% 0%, 100% 0%, 100% 47%, 68% 45%)',
  'polygon(0% 46%, 35% 48%, 33% 67%, 0% 69%)',
  'polygon(35% 48%, 68% 45%, 69% 70%, 33% 67%)',
  'polygon(68% 45%, 100% 47%, 100% 68%, 69% 70%)',
  'polygon(0% 69%, 33% 67%, 31% 100%, 0% 100%)',
  'polygon(33% 67%, 69% 70%, 69% 100%, 31% 100%)',
  'polygon(69% 70%, 100% 68%, 100% 100%, 69% 100%)',
]

const GRID_LINES = [
  '37,0 35,48 33,67 31,100',
  '67,0 68,45 69,70 69,100',
  '0,46 35,48 68,45 100,47',
  '0,69 33,67 69,70 100,68',
]

function SparkleIcon() {
  return (
    <svg
      className="mosaic-sparkle"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M8 0 L8.7 6.8 L8 8 L7.3 6.8 Z" fill="rgba(180,210,255,0.7)" />
      <path d="M0 8 L6.8 7.3 L8 8 L6.8 8.7 Z" fill="rgba(180,210,255,0.7)" />
      <path d="M8 16 L7.3 9.2 L8 8 L8.7 9.2 Z" fill="rgba(180,210,255,0.7)" />
      <path d="M16 8 L9.2 8.7 L8 8 L9.2 7.3 Z" fill="rgba(180,210,255,0.7)" />
    </svg>
  )
}

export default function ProjectsSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const cells = section.querySelectorAll('.mosaic-cell')
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          e.target.classList.toggle('visible', e.isIntersecting)
        }
      },
      { threshold: 0.1 }
    )
    cells.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="section-projects"
      className="portfolio-section projects-section mosaic-projects"
      data-section-idx="4"
    >
      <div className="section-inner">
        <header className="section-header">
          <span className="section-tag">// PROJELER</span>
          <h2 className="section-title">
            <span className="title-text" data-river-node="projects">PROJECTS</span>
          </h2>
        </header>
        <div className="mosaic-container">
          <svg
            className="mosaic-lines"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {GRID_LINES.map((points, i) => (
              <polyline key={i} points={points} />
            ))}
          </svg>
          {projects.slice(0, 9).map((proj, idx) => (
            <a
              key={proj.id}
              href={proj.url}
              className="mosaic-cell"
              style={{
                clipPath: CLIP_PATHS[idx],
                transitionDelay: `${idx * 0.06}s`,
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {proj.image && (
                <img
                  className="mosaic-cell-img"
                  src={proj.image}
                  alt={proj.name}
                  loading="lazy"
                />
              )}
              <div className="mosaic-cell-info">
                <h3 className="mosaic-cell-name">{proj.name}</h3>
                <p className="mosaic-cell-desc">{proj.description}</p>
                <ul className="mosaic-cell-tech">
                  {proj.tech.map(t => <li key={t}>{t}</li>)}
                </ul>
              </div>
            </a>
          ))}
          <SparkleIcon />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify no JS errors in browser console**

After HMR reload, open DevTools → Console. Should see zero errors. The mosaic should render with:
- `// PROJELER` tag + `PROJECTS` h2 at top-left
- The 9 cells filling the container (some may be dark if images haven't loaded)
- The 4 thin diagonal-ish dividing lines visible over the grid

---

## Task 4: Visual verification checklist

**Files:** — (browser only)

- [ ] **Step 1: Check cell shapes**

Each of the 9 cells should be a unique quadrilateral (slightly irregular, not perfect rectangles). Verify by inspecting or just looking — each row's cells should have subtly angled shared edges.

- [ ] **Step 2: Check grid lines**

4 thin, light-blue-ish lines (`rgba(180,210,255,0.28)`) should run:
- Two running top-to-bottom (separating left/mid, mid/right columns)
- Two running left-to-right (separating top/mid, mid/bottom rows)
- All 4 lines should be slightly diagonal (not perfectly horizontal/vertical)

- [ ] **Step 3: Check cell content**

Each cell should show:
- Project image covering the full cell (object-fit: cover, cropped to shape)
- Dark gradient at bottom
- Project name (Anton font, white)
- Turkish description text (Fraunces, muted)
- Tech tags in bordered boxes

- [ ] **Step 4: Check header**

Top-left shows `// PROJELER` (monospace, blue-tinted) above `PROJECTS` (Anton, large). Unchanged from original.

- [ ] **Step 5: Check sparkle**

Small 4-pointed star icon visible in the bottom-right corner of the mosaic grid, semi-transparent.

- [ ] **Step 6: Check hover**

Hover over any cell → image brightens and scales slightly. No card-flip (removed from mosaic design).

- [ ] **Step 7: Check mobile (780px breakpoint)**

Resize browser to 780px wide → cells should stack vertically as plain rectangles (clip-path removed), grid lines hidden.

---

## Task 5: Adjust if needed — common fixes

**Files:** `src/index.css` (targeted edits only)

These are conditional — only apply if you observe the problem.

**If grid lines are too thick:**
Change `stroke-width: 1` → `stroke-width: 0.6` in `.mosaic-lines polyline`

**If info text is too large and overflows into adjacent cells:**
Reduce `clamp()` values in `.mosaic-cell-name`, `.mosaic-cell-desc`, `.mosaic-cell-tech li`

**If the mosaic container is too tall (overflows viewport):**
Change `aspect-ratio: 16 / 9` → `aspect-ratio: 16 / 8` in `.mosaic-container`

**If cell images don't load (picsum CORS):**
This is expected in some environments. The dark background (`rgba(2, 7, 20, 0.4)`) will show through. Not a code error.

**If there are visible seams/gaps between cells:**
This is due to anti-aliasing on clip-path edges. The SVG lines intentionally cover these seams. If gaps persist, add `outline: 1px solid rgba(180,210,255,0.15)` to `.mosaic-cell`.

---

## Clip-path coordinate reference

All coordinates are percentages of the container's width/height.

```
Dividing line junctions:
  Top-left:  (37%, 0%)     Top-right: (67%, 0%)
  Mid-row-L: (35%, 48%)   Mid-row-R: (68%, 45%)
  Ctr-left:  (33%, 67%)   Ctr-right: (69%, 70%)
  Bot-left:  (31%, 100%)  Bot-right: (69%, 100%)
  H1-left:   (0%, 46%)    H1-right:  (100%, 47%)
  H2-left:   (0%, 69%)    H2-right:  (100%, 68%)

Cell 1: 0,0 → 37,0 → 35,48 → 0,46
Cell 2: 37,0 → 67,0 → 68,45 → 35,48
Cell 3: 67,0 → 100,0 → 100,47 → 68,45
Cell 4: 0,46 → 35,48 → 33,67 → 0,69
Cell 5: 35,48 → 68,45 → 69,70 → 33,67
Cell 6: 68,45 → 100,47 → 100,68 → 69,70
Cell 7: 0,69 → 33,67 → 31,100 → 0,100
Cell 8: 33,67 → 69,70 → 69,100 → 31,100
Cell 9: 69,70 → 100,68 → 100,100 → 69,100
```
