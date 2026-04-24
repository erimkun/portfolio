import { useEffect } from 'react'

const CX = 120, CY = 120, BASE_R = 94, N = 22

function smoothClosed(pts) {
  const n = pts.length
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i-1+n)%n], p1 = pts[i]
    const p2 = pts[(i+1)%n],   p3 = pts[(i+2)%n]
    const c1x = p1[0]+(p2[0]-p0[0])/6, c1y = p1[1]+(p2[1]-p0[1])/6
    const c2x = p2[0]-(p3[0]-p1[0])/6, c2y = p2[1]-(p3[1]-p1[1])/6
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`
  }
  return d + ' Z'
}

function buildPath(s, t) {
  const mxSvg = CX + s.mx * 240
  const mySvg = CY + s.my * 240
  const pts = []
  for (let k = 0; k < N; k++) {
    const a   = (k / N) * Math.PI * 2 - Math.PI / 2
    const p   = s.pts[k]
    const wob = Math.sin(t * 0.00045 * p.speed + p.phase) * p.amp
    const r   = BASE_R * (1 + wob + p.bias)
    let px = CX + Math.cos(a) * r
    let py = CY + Math.sin(a) * r
    const dx = mxSvg - px, dy = mySvg - py
    const dist = Math.max(1, Math.sqrt(dx*dx + dy*dy))
    if (dist < 165) {
      const f = 1 - dist / 165
      const str = f * f * 22
      px += (dx / dist) * str
      py += (dy / dist) * str
    }
    pts.push([px, py])
  }
  return smoothClosed(pts)
}

export function useEyeBlob(containerRef) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const eyeEls = [...container.querySelectorAll('.eye')]
    const state  = eyeEls.map((el, i) => {
      const side = i === 0 ? 'L' : 'R'
      return {
        el,
        pts: Array.from({ length: N }, () => ({
          phase: Math.random() * Math.PI * 2,
          speed: 0.28 + Math.random() * 0.4,
          amp:   0.012 + Math.random() * 0.018,
          bias:  (Math.random() - 0.5) * 0.018,
        })),
        mx: 0, my: 0, tx: 0, ty: 0,
        bodyPath:   el.querySelector(`#bodyPath${side}`),
        clipShape:  el.querySelector(`#shape${side}`),
        strokePath: el.querySelector(`#strokePath${side}`),
        spec:       el.querySelector(`#specPath${side}`),
        pin:        el.querySelector(`#pin${side}`),
        bx:  i === 0 ? 88  : 152,
        pbx: i === 0 ? 76  : 164,
      }
    })

    function onMove(e) {
      const p = e.touches ? e.touches[0] : e
      for (const s of state) {
        const r = s.el.getBoundingClientRect()
        s.tx = Math.max(-1.5, Math.min(1.5, (p.clientX - (r.left + r.width  * 0.5)) / 240))
        s.ty = Math.max(-1.5, Math.min(1.5, (p.clientY - (r.top  + r.height * 0.5)) / 240))
      }
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })

    let raf
    function tick(t) {
      for (const s of state) {
        s.mx += (s.tx - s.mx) * 0.04
        s.my += (s.ty - s.my) * 0.04
        const d = buildPath(s, t)
        s.bodyPath?.setAttribute('d', d)
        s.clipShape?.setAttribute('d', d)
        s.strokePath?.setAttribute('d', d)
        const sx = s.mx * 12, sy = s.my * 9
        s.spec?.setAttribute('cx', String(s.bx  + sx))
        s.spec?.setAttribute('cy', String(68    + sy))
        s.pin?.setAttribute('cx',  String(s.pbx + sx))
        s.pin?.setAttribute('cy',  String(60    + sy))
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
    }
  }, [])
}
