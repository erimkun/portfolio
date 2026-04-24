// ──────────────────────────────────────────────────────────
//  usePixelRiver
//  For every adjacent pair of sections, renders a scroll-linked
//  "dissolve → flow → reform" particle animation.
//
//  Lifecycle of a single particle as scroll progresses 0 → 1:
//    • It begins at a pixel sampled from the FROM section's sprite,
//      positioned at that section's anchor element.
//    • After its individual `delay` it flies along a bezier curve
//      whose midpoint is randomized for "river" feel.
//    • It lands at a pixel sampled from the TO section's sprite,
//      positioned at that section's anchor element.
//    • Because each particle has its own `delay` + `duration`,
//      the crowd naturally dissolves, streams, and reforms
//      — reading as a particle river between images.
//
//  Scroll range is generous + heavily scrubbed, so the user
//  experiences the transition rather than it flashing by.
// ──────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  TRANSITIONS,
  SECTION_SPRITES,
  SECTION_ACCENTS,
} from '../data/riverConfig'

gsap.registerPlugin(ScrollTrigger)

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const lerp  = (a, b, t) => a + (b - a) * t
const smoothstep = (t) => t * t * (3 - 2 * t)

const PARTICLES_PER_TRANSITION_DESKTOP = 1200
const PARTICLES_PER_TRANSITION_MOBILE  = 520

// ─── Sprite sampling ──────────────────────────────────────

function sampleImageBitmap(img, step = 4) {
  const nw = img.naturalWidth  || img.width
  const nh = img.naturalHeight || img.height
  const sw = Math.max(1, Math.round(nw / step))
  const sh = Math.max(1, Math.round(nh / step))
  const off = document.createElement('canvas')
  off.width = sw; off.height = sh
  const c = off.getContext('2d', { willReadFrequently: true })
  c.imageSmoothingEnabled = false
  c.drawImage(img, 0, 0, sw, sh)
  const data = c.getImageData(0, 0, sw, sh).data
  const pts = []
  const cxs = sw / 2, cys = sh / 2
  for (let py = 0; py < sh; py++) {
    for (let px = 0; px < sw; px++) {
      const i = (py * sw + px) * 4
      if (data[i + 3] < 40) continue
      pts.push({
        dx: (px - cxs) * step,
        dy: (py - cys) * step,
        r: data[i], g: data[i + 1], b: data[i + 2],
        a: (data[i + 3] / 255),
      })
    }
  }
  return { points: pts, w: nw, h: nh }
}

function sampleText(text, font, step = 4) {
  const lines = text.split('\n')
  const meas = document.createElement('canvas').getContext('2d')
  meas.font = font
  const fontPx = parseInt((font.match(/(\d+)px/) || ['', '240'])[1], 10) || 240
  const lineH = Math.ceil(fontPx * 1.02)    // matches h2 line-height 0.9-1.0

  let maxW = 0
  for (const ln of lines) {
    const w = meas.measureText(ln).width
    if (w > maxW) maxW = w
  }
  const tw = Math.ceil(maxW) + 40
  const th = Math.ceil(lineH * lines.length + fontPx * 0.25)

  const off = document.createElement('canvas')
  off.width = tw; off.height = th
  const c = off.getContext('2d', { willReadFrequently: true })
  c.font = font
  c.fillStyle = '#ffffff'
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  const totalH = lineH * lines.length
  const firstY = th / 2 - totalH / 2 + lineH / 2
  for (let li = 0; li < lines.length; li++) {
    c.fillText(lines[li], tw / 2, firstY + li * lineH)
  }

  const data = c.getImageData(0, 0, tw, th).data
  const pts = []
  const cxs = tw / 2, cys = th / 2
  for (let py = 0; py < th; py += step) {
    for (let px = 0; px < tw; px += step) {
      const i = (py * tw + px) * 4
      if (data[i + 3] < 70) continue
      pts.push({
        dx: (px - cxs),
        dy: (py - cys),
        r: 238, g: 234, b: 220,
        a: (data[i + 3] / 255) * 0.95,
      })
    }
  }
  return { points: pts, w: tw, h: th }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function buildSprite(spec) {
  if (spec.type === 'image') {
    const img = await loadImage(spec.src)
    return sampleImageBitmap(img, spec.sampleStep || 4)
  }
  if (spec.type === 'text') {
    return sampleText(spec.text, spec.font, spec.sampleStep || 4)
  }
  return { points: [], w: 1, h: 1 }
}

// ─── Particle pair construction ───────────────────────────

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function buildPairs(fromSprite, toSprite, count) {
  if (!fromSprite.points.length || !toSprite.points.length) return []
  const src = shuffle([...fromSprite.points])
  const tgt = shuffle([...toSprite.points])
  const n = Math.min(
    count,
    Math.floor(Math.max(src.length, tgt.length) * 1.1),
  )
  const pairs = []
  for (let i = 0; i < n; i++) {
    const s = src[i % src.length]
    const t = tgt[i % tgt.length]
    pairs.push({
      sdx: s.dx, sdy: s.dy,
      tdx: t.dx, tdy: t.dy,
      sr: s.r, sg: s.g, sb: s.b, sa: s.a,
      tr: t.r, tg: t.g, tb: t.b, ta: t.a,
      // Per-particle lifecycle (within the 0-1 scroll range)
      delay:    Math.random() * 0.38,                    // when flight begins
      duration: 0.52 + Math.random() * 0.44,             // flight length
      // River midpoint scatter — shapes the bezier into a stream
      mx: (Math.random() - 0.5) * 560,
      my: 170 + Math.random() * 340,
      // Airborne wobble
      phase: Math.random() * Math.PI * 2,
      wobAmp: 10 + Math.random() * 28,
      wobFreq: 1.2 + Math.random() * 1.8,
      size: Math.random() < 0.08 ? 3 : (Math.random() < 0.30 ? 2 : 1),
      baseA: 0.84 + Math.random() * 0.34,
    })
  }
  return pairs
}

// ─── Anchor helpers ───────────────────────────────────────

function anchorRect(el) {
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (r.width < 2 || r.height < 2) return null
  return {
    cx: r.left + r.width / 2,
    cy: r.top  + r.height / 2,
    w:  r.width,
    h:  r.height,
  }
}

function spriteScale(spriteW, spriteH, rect, fit) {
  const sx = rect.w / spriteW
  const sy = rect.h / spriteH
  return Math.min(sx, sy) * fit
}

// ─── The hook ─────────────────────────────────────────────

export function usePixelRiver(canvasRef, scrollerRef, active) {
  useEffect(() => {
    if (!active) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = canvasRef.current
    const scroller = scrollerRef.current
    if (!canvas || !scroller) return

    const ctx = canvas.getContext('2d')
    let W = canvas.width  = window.innerWidth
    let H = canvas.height = window.innerHeight
    let cancelled = false
    const particleCount = W < 768
      ? PARTICLES_PER_TRANSITION_MOBILE
      : PARTICLES_PER_TRANSITION_DESKTOP

    // Per-transition runtime state
    const state = TRANSITIONS.map(() => ({
      progress: 0,
      pairs: null,
      fromSprite: null,
      toSprite: null,
      fromAnchor: null,
      toAnchor: null,
      fromSpec: null,
      toSpec: null,
    }))

    const scrollTriggers = []
    let raf = null
    let canvasVisible = false

    // Build sprites (async, once) then wire up scroll triggers
    ;(async () => {
      const spriteMap = {}
      await Promise.all(
        Object.entries(SECTION_SPRITES).map(async ([key, spec]) => {
          try {
            spriteMap[key] = await buildSprite(spec)
          } catch (e) {
            console.warn('[pixel-river] sprite failed', key, e)
            spriteMap[key] = { points: [], w: 1, h: 1 }
          }
        })
      )
      if (cancelled) return

      TRANSITIONS.forEach((tr, i) => {
        const fromSpec = SECTION_SPRITES[tr.fromKey]
        const toSpec   = SECTION_SPRITES[tr.toKey]
        state[i].fromSprite = spriteMap[tr.fromKey]
        state[i].toSprite   = spriteMap[tr.toKey]
        state[i].fromSpec   = fromSpec
        state[i].toSpec     = toSpec
        state[i].fromAnchor = document.querySelector(fromSpec.anchorSelector)
        state[i].toAnchor   = document.querySelector(toSpec.anchorSelector)
        state[i].pairs      = buildPairs(state[i].fromSprite, state[i].toSprite, particleCount)
      })

      // Longer range + heavier scrub = the user experiences the flow.
      // Scrub keeps progress continuous with scroll position, so we rely
      // on onUpdate only (no discrete onLeave / onLeaveBack setting).
      TRANSITIONS.forEach((tr, i) => {
        const st = ScrollTrigger.create({
          trigger: `#section-${tr.toId}`,
          scroller,
          start: 'top 98%',
          end:   'top 28%',
          scrub: 2.4,
          onUpdate: (self) => { state[i].progress = self.progress },
        })
        scrollTriggers.push(st)
      })

      canvas.style.opacity = '0'

      // Tag every anchor we will manipulate so CSS vars are picked up
      const allAnchors = new Set()
      state.forEach(s => {
        if (s.fromAnchor) allAnchors.add(s.fromAnchor)
        if (s.toAnchor)   allAnchors.add(s.toAnchor)
      })
      allAnchors.forEach(el => {
        el.classList.add('river-bound')
        el.style.setProperty('--river-op', '1')
        el.style.setProperty('--river-blur', '0px')
      })

      setTimeout(() => ScrollTrigger.refresh(), 320)
      setTimeout(() => ScrollTrigger.refresh(), 1200)

      const prevStyles = new Map()
      const applyAnchorStyle = (el, op, bl) => {
        if (!el) return
        const prev = prevStyles.get(el) || {}
        const nextOp = op.toFixed(3)
        const nextBl = bl.toFixed(2)
        if (prev.op !== nextOp) {
          el.style.setProperty('--river-op', nextOp)
          prev.op = nextOp
        }
        if (prev.bl !== nextBl) {
          el.style.setProperty('--river-blur', `${nextBl}px`)
          prev.bl = nextBl
        }
        prevStyles.set(el, prev)
      }

      // When the same DOM node is referenced by multiple transitions
      // (e.g. the About photo frame is target of T0 AND source of T1),
      // merge their influences so neither overrides the other.
      function mergeVis(map, el, op, bl) {
        if (!el) return
        const prev = map.get(el)
        if (!prev) { map.set(el, { op, bl }); return }
        map.set(el, {
          op: Math.min(prev.op, op),    // worst-case hidden wins
          bl: Math.max(prev.bl, bl),    // worst-case blurred wins
        })
      }

      const loop = () => {
        raf = requestAnimationFrame(loop)
        const t = performance.now() * 0.001
        ctx.clearRect(0, 0, W, H)
        let hasVisibleParticles = false

        // Start each tracked anchor at its CSS default (visible, no blur).
        // Every transition then merges its dissolve/form contribution.
        const vis = new Map()
        allAnchors.forEach(el => vis.set(el, { op: 1, bl: 0 }))

        TRANSITIONS.forEach((tr, i) => {
          const s = state[i]
          if (!s.pairs) return
          const p = s.progress
          const dissP = smoothstep(clamp(p / 0.46, 0, 1))
          const formP = smoothstep(clamp((p - 0.55) / 0.45, 0, 1))

          // Source fades out over the first third of the transition.
          mergeVis(vis, s.fromAnchor, 1 - dissP, dissP * 7)
          // Target forms in over the last third.
          // Before transition starts (formP = 0) it stays hidden — the h2
          // will appear to "materialize" from the particle river.
          mergeVis(vis, s.toAnchor,   formP, (1 - formP) * 7)

          if (p <= 0.02 || p >= 0.98) return

          const fromRect = anchorRect(s.fromAnchor)
          const toRect   = anchorRect(s.toAnchor)
          if (!fromRect || !toRect) return

          const fromScale = spriteScale(s.fromSprite.w, s.fromSprite.h, fromRect, s.fromSpec.fit || 0.85)
          const toScale   = spriteScale(s.toSprite.w,   s.toSprite.h,   toRect,   s.toSpec.fit   || 0.85)

          const fromAcc = SECTION_ACCENTS[tr.fromIdx]
          const toAcc   = SECTION_ACCENTS[tr.toIdx] ?? fromAcc

          for (const pp of s.pairs) {
            const lp = clamp((p - pp.delay) / pp.duration, 0, 1)
            const lpS = smoothstep(lp)

            const sX = fromRect.cx + pp.sdx * fromScale
            const sY = fromRect.cy + pp.sdy * fromScale
            const tX = toRect.cx   + pp.tdx * toScale
            const tY = toRect.cy   + pp.tdy * toScale

            const mX = (sX + tX) / 2 + pp.mx
            const mY = Math.max(sY, tY) + pp.my

            const one = 1 - lpS
            let x = one * one * sX + 2 * one * lpS * mX + lpS * lpS * tX
            let y = one * one * sY + 2 * one * lpS * mY + lpS * lpS * tY

            const air = Math.sin(Math.PI * lp)
            x += Math.cos(t * pp.wobFreq + pp.phase) * pp.wobAmp * air
            y += Math.sin(t * pp.wobFreq * 0.87 + pp.phase) * pp.wobAmp * 0.6 * air

            const cMix = smoothstep(clamp((lp - 0.35) / 0.5, 0, 1))
            const r = (pp.sr * (1 - cMix) + pp.tr * cMix) | 0
            const g = (pp.sg * (1 - cMix) + pp.tg * cMix) | 0
            const b = (pp.sb * (1 - cMix) + pp.tb * cMix) | 0

            const edgeFade = Math.pow(Math.sin(Math.PI * lp), 0.84)
            const alpha = clamp(pp.baseA * (edgeFade * 1.02), 0, 1.08)

            if (alpha < 0.02) continue
            if (lp <= 0.03 || lp >= 0.97) continue

            hasVisibleParticles = true
            const sz = pp.size

            ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.26})`
            ctx.fillRect(x - sz * 6, y - sz * 6, sz * 12, sz * 12)

            if (lp > 0.08 && lp < 0.92) {
              ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.36})`
              ctx.fillRect(x - sz * 2, y - sz * 2, sz * 4, sz * 4)
            }

            ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(1, alpha * 1.08)})`
            ctx.fillRect(x - sz, y - sz, sz * 2, sz * 2)
            if (sz >= 2) {
              ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha * 0.9)})`
              ctx.fillRect(x, y, 1, 1)
            }
          }

          const tint = Math.sin(p * Math.PI)
          if (tint > 0.02) {
            hasVisibleParticles = true
            const h = Math.round(lerp(fromAcc.h, toAcc.h, p))
            const s_ = Math.round(lerp(fromAcc.s, toAcc.s, p))
            const l  = Math.round(lerp(fromAcc.l, toAcc.l, p))
            ctx.fillStyle = `hsla(${h},${s_}%,${l}%,${tint * 0.055})`
            ctx.fillRect(0, 0, W, H)
          }
        })

        if (hasVisibleParticles !== canvasVisible) {
          canvas.style.opacity = hasVisibleParticles ? '0.96' : '0'
          canvasVisible = hasVisibleParticles
        }

        vis.forEach((v, el) => applyAnchorStyle(el, v.op, v.bl))
      }
      loop()
    })()

    const onResize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelled = true
      if (raf) cancelAnimationFrame(raf)
      scrollTriggers.forEach(st => st.kill())
      window.removeEventListener('resize', onResize)
      document.querySelectorAll('.river-bound').forEach(el => {
        el.style.removeProperty('--river-op')
        el.style.removeProperty('--river-blur')
        el.classList.remove('river-bound')
      })
      canvas.style.removeProperty('opacity')
      ctx.clearRect(0, 0, W, H)
    }
  }, [active, canvasRef, scrollerRef])
}
