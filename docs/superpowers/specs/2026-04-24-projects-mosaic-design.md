# Projects Section — Geometric Mosaic Redesign

**Date:** 2026-04-24  
**Status:** Approved

---

## Goal

Replace the scattered project cards with a clean, symmetric geometric mosaic grid. Nine polygonal cells, divided by thin light-colored lines, each holding one project card. Starry background and `// PROJELER / PROJECTS` header remain untouched.

---

## Layout

### Container

- Full-width, fixed aspect-ratio container (~16:9, responsive with `padding-bottom` trick or `aspect-ratio` CSS)
- Position: `relative`, overflow: `hidden`
- Background: transparent (inherits the starry section background)

### Grid divisions

Three rows × three columns, but with slightly diagonal/irregular dividing lines to create the voronoi-like feel:

```
Vertical dividers:
  Left divider:   (37%, 0%) → (35%, 50%) → (33%, 100%)
  Right divider:  (67%, 0%) → (68%, 50%) → (69%, 100%)

Horizontal dividers:
  Top divider:    (0%, 46%) → (37%, 48%) → (67%, 45%) → (100%, 47%)
  Bottom divider: (0%, 69%) → (33%, 67%) → (69%, 70%) → (100%, 68%)
```

This creates 9 cells with quadrilateral clip-paths (4–5 vertices each), giving each cell a unique shape.

### Clip-path definitions (percentage coordinates)

| Cell | Project | clip-path polygon points |
|------|---------|--------------------------|
| 1 (top-left) | Orbit Market Mock | `0% 0%, 37% 0%, 35% 48%, 0% 46%` |
| 2 (top-mid) | Noir Studio Landing | `37% 0%, 67% 0%, 68% 45%, 35% 48%` |
| 3 (top-right) | Pulse Admin Mock | `67% 0%, 100% 0%, 100% 47%, 68% 45%` |
| 4 (mid-left) | Echo Podcast UI | `0% 46%, 35% 48%, 33% 67%, 0% 69%` |
| 5 (mid-center) | Atlas Travel Concept | `35% 48%, 68% 45%, 69% 70%, 33% 67%` |
| 6 (mid-right) | Kinetic Portfolio Mock | `68% 45%, 100% 47%, 100% 68%, 69% 70%` |
| 7 (bot-left) | Shift CRM Mock | `0% 69%, 33% 67%, 31% 100%, 0% 100%` |
| 8 (bot-center) | Frame Shop Mock | `33% 67%, 69% 70%, 69% 100%, 31% 100%` |
| 9 (bot-right) | Mono Blog System | `69% 70%, 100% 68%, 100% 100%, 69% 100%` |

### Grid line overlay

An SVG element (`position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2`) draws the 4 dividing polylines using:
- `stroke: rgba(180, 210, 255, 0.28)`
- `stroke-width: 1`
- `fill: none`

Lines trace the diagonal dividers exactly, so they visually sit between cells.

---

## Cell anatomy

Each cell is `position: absolute; inset: 0; width: 100%; height: 100%` with `clip-path` applied. Inside:

```
┌────────────────────────────────┐
│  IMAGE (object-fit: cover,     │
│  fills entire cell area)       │
│                                │
│  ─── dark gradient overlay ─── │
│  PROJECT NAME (Anton font)     │
│  Turkish description (Fraunces)│
│  [Tech] [Tags] [Boxed]         │
└────────────────────────────────┘
```

- **Image:** `position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover`
- **Info overlay:** `position: absolute; bottom: 0; left: 0; right: 0; padding: 12px 14px` with dark gradient fade (`linear-gradient(to top, rgba(2,7,20,0.92) 0%, transparent 100%)`)
- **Tech tags:** same `border: 1px solid rgba(180,210,255,.24)` boxes as existing `.proj-tech li`

---

## Sparkle icon

Small 4-pointed star SVG (`16×16px`), bottom-right corner of the mosaic container (`position: absolute; bottom: 12px; right: 12px; z-index: 3; opacity: 0.55`). Color: `rgba(180,210,255,0.7)`.

---

## Header

Unchanged from current:
```jsx
<span className="section-tag">// PROJELER</span>
<h2 className="section-title">
  <span className="title-text" data-river-node="projects">PROJECTS</span>
</h2>
```

---

## Animations

- On mount/visibility: each cell fades in via CSS `opacity` transition with staggered `transition-delay` (same `steps()` easing used across site)
- No tilt / 3D card flip (removed — mosaic cells are fixed in place)
- Hover: subtle brightness increase + `transform: brightness(1.12)` on the cell image

---

## Files changed

| File | Change |
|------|--------|
| `src/components/ProjectsSection.jsx` | Full rewrite of grid section — mosaic layout replaces scatter grid |
| `src/index.css` | Add `.mosaic-*` CSS rules; keep existing `.proj-*` rules intact (used elsewhere or kept for safety) |

---

## Out of scope

- No routing / link behavior changes (cards remain `<a href={proj.url}>`)
- No data changes in `content.js`
- No mobile-specific mosaic layout (below 780px falls back to single-column stacked list, same as current responsive behavior)
