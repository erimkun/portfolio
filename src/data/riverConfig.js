// ──────────────────────────────────────────────────────────
//  RIVER CONFIG
//  Each section has a "sprite" — the pixel pattern particles
//  assemble into. Between any two consecutive sections, the
//  particles travel from the previous sprite's anchor element
//  to the next sprite's anchor element, dissolving out of the
//  previous and forming into the next.
// ──────────────────────────────────────────────────────────

// Per-section accent hues (matches useScrollColor COLORS array order)
export const SECTION_ACCENTS = [
  { h: 220, s: 70, l: 78 },  // 0 Hero       — mavi
  { h: 250, s: 65, l: 78 },  // 1 About      — mavi-mor
  { h: 270, s: 60, l: 78 },  // 2 Education  — mor-indigo
  { h: 40,  s: 70, l: 75 },  // 3 Experience — amber
  { h: 155, s: 60, l: 75 },  // 4 Projects   — yeşil
  { h: 350, s: 65, l: 78 },  // 5 Contact    — kırmızı
]

// Sprite = pixel-art silhouette the particles form.
// For each section we define HOW to generate that silhouette
// and WHICH DOM element anchors its position on screen.
export const SECTION_SPRITES = {
  hero: {
    type: 'image',
    src: '/erimpixel.png',
    anchorSelector: '[data-river-node="hero"]',
    sampleStep: 4,
    fit: 0.92,
  },
  about: {
    type: 'image',
    src: '/erimpixel.png',
    anchorSelector: '[data-river-node="about"]',
    sampleStep: 4,
    fit: 0.78,
  },
  education: {
    type: 'text',
    text: 'EDUCATION',
    font: '900 240px Anton, Impact, sans-serif',
    anchorSelector: '[data-river-node="education"]',
    sampleStep: 4,
    fit: 0.88,
  },
  experience: {
    type: 'text',
    text: 'EXPERIENCE',
    font: '900 240px Anton, Impact, sans-serif',
    anchorSelector: '[data-river-node="experience"]',
    sampleStep: 4,
    fit: 0.88,
  },
  projects: {
    type: 'text',
    text: 'PROJECTS',
    font: '900 240px Anton, Impact, sans-serif',
    anchorSelector: '[data-river-node="projects"]',
    sampleStep: 4,
    fit: 0.88,
  },
  contact: {
    type: 'text',
    text: "LET'S\nCONNECT",
    font: '900 240px Anton, Impact, sans-serif',
    anchorSelector: '[data-river-node="contact"]',
    sampleStep: 4,
    fit: 0.88,
  },
}

// Ordered section keys — drives transition pairs.
export const SECTION_ORDER = [
  'hero', 'about', 'education', 'experience', 'projects', 'contact',
]

// One entry per inter-section transition (5 transitions for 6 sections).
// fromKey → toKey : sprite at fromKey's anchor dissolves, particles flow,
// then reassemble into sprite at toKey's anchor.
export const TRANSITIONS = SECTION_ORDER.slice(0, -1).map((fromKey, i) => {
  const toKey = SECTION_ORDER[i + 1]
  return {
    fromKey,
    toKey,
    fromIdx: i,
    toIdx: i + 1,
    toId: toKey,
    branches: 1,
  }
})

// Generates a winding snake path from (x0,y0) to (x1,y1).
// Kept for backwards-compatibility with any consumer that imports it.
export function generatePath(x0, y0, x1, y1, amplitude = 70) {
  const SEGMENTS = 10
  const points = []
  for (let i = 0; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    const bx = x0 + (x1 - x0) * ease
    const by = y0 + (y1 - y0) * t
    const wave = amplitude * Math.sin(t * Math.PI * 2.8) * Math.sin(t * Math.PI)
    points.push({ x: bx + wave, y: by })
  }
  return points
}

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
