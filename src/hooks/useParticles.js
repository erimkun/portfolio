import { useEffect } from 'react'

const CLUSTERS = [
  {x:.08,y:.35,n:220,sp:.20,hue:35},  {x:.92,y:.65,n:220,sp:.20,hue:285},
  {x:.20,y:.70,n:180,sp:.16,hue:190}, {x:.80,y:.30,n:180,sp:.16,hue:215},
  {x:.38,y:.18,n:150,sp:.15,hue:320}, {x:.62,y:.82,n:150,sp:.15,hue:50},
  {x:.50,y:.50,n:140,sp:.24,hue:260}, {x:.15,y:.55,n:120,sp:.14,hue:175},
  {x:.85,y:.45,n:120,sp:.14,hue:230}, {x:.35,y:.80,n:110,sp:.13,hue:290},
  {x:.65,y:.20,n:110,sp:.13,hue:45},  {x:.25,y:.30,n:90, sp:.28,hue:345},
  {x:.75,y:.70,n:90, sp:.28,hue:195}, {x:.50,y:.15,n:80, sp:.22,hue:220},
  {x:.50,y:.85,n:80, sp:.22,hue:310}, {x:.10,y:.80,n:75, sp:.18,hue:55},
  {x:.90,y:.20,n:75, sp:.18,hue:270}, {x:.42,y:.42,n:70, sp:.30,hue:165},
  {x:.58,y:.58,n:70, sp:.30,hue:340},
]

function buildParticles(W, H) {
  const scale = W < 700 ? 0.45 : 1
  const list = []
  for (const cl of CLUSTERS) {
    const n = Math.round(cl.n * scale)
    for (let i = 0; i < n; i++) {
      const a  = Math.random() * Math.PI * 2
      const d  = Math.random() * Math.random() * cl.sp
      const hx = Math.min(W-1, Math.max(0, (cl.x + Math.cos(a)*d) * W))
      const hy = Math.min(H-1, Math.max(0, (cl.y + Math.sin(a)*d) * H))
      list.push({
        hx, hy, x: hx, y: hy, vx: 0, vy: 0,
        sz:     Math.random() < .12 ? 2 : 1,
        base:   .10 + Math.random() * .38,
        cur:    0,
        hue:    cl.hue + (Math.random() - .5) * 28,
        phaseX:  Math.random() * Math.PI * 2,
        phaseY:  Math.random() * Math.PI * 2,
        phaseX2: Math.random() * Math.PI * 2,
        phaseY2: Math.random() * Math.PI * 2,
        freqX:  0.10 + Math.random() * 0.28,
        freqY:  0.08 + Math.random() * 0.24,
        ampX:   38 + Math.random() * 58,
        ampY:   38 + Math.random() * 58,
      })
    }
  }
  return list
}

function ss(dist, reach) {
  if (dist >= reach) return 0
  const t = 1 - dist / reach
  return t * t * (3 - 2*t)
}

export function useParticles(canvasRef, active) {
  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const cx = canvas.getContext('2d')

    let W = canvas.width  = window.innerWidth
    let H = canvas.height = window.innerHeight
    let particles = buildParticles(W, H)
    let mx = -9e4, my = -9e4
    let raf

    const onMove  = e => { mx = e.clientX; my = e.clientY }
    const onTouch = e => { const t = e.touches[0]; if (t) { mx = t.clientX; my = t.clientY } }
    const onResize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      particles = buildParticles(W, H)
    }

    function loop() {
      raf = requestAnimationFrame(loop)
      const t = performance.now() * 0.001
      cx.clearRect(0, 0, W, H)

      for (const p of particles) {
        p.cur = Math.min(p.base, p.cur + .005)

        const tx = p.hx + p.ampX * (0.62 * Math.sin(t * p.freqX  + p.phaseX)
                                   + 0.38 * Math.sin(t * p.freqX * 2.73 + p.phaseX2))
        const ty = p.hy + p.ampY * (0.62 * Math.sin(t * p.freqY  + p.phaseY)
                                   + 0.38 * Math.sin(t * p.freqY * 3.17 + p.phaseY2))

        const dx = p.x - mx, dy = p.y - my
        const dist = Math.hypot(dx, dy)
        const inf  = ss(dist, 150)
        if (inf > 0 && dist > 2) {
          const flee = inf * 22
          p.vx += (dx / dist) * flee
          p.vy += (dy / dist) * flee
        }

        p.vx += (tx - p.x) * .032
        p.vy += (ty - p.y) * .032
        p.vx *= .86; p.vy *= .86
        p.vx = Math.max(-20, Math.min(20, p.vx))
        p.vy = Math.max(-20, Math.min(20, p.vy))
        p.x += p.vx; p.y += p.vy

        const spd   = Math.hypot(p.vx, p.vy)
        const alpha = Math.min(.94, p.cur + spd * .10)
        const s = p.sz
        const px = Math.round(p.x), py = Math.round(p.y)

        cx.fillStyle = `hsla(${p.hue},62%,78%,${alpha * .09})`
        cx.fillRect(px - s*3, py - s*3, s*6, s*6)
        cx.fillStyle = `hsla(${p.hue},55%,93%,${alpha})`
        cx.fillRect(px - s, py - s, s*2, s*2)
        if (s >= 2) {
          cx.fillStyle = `rgba(255,255,255,${alpha * .88})`
          cx.fillRect(px, py, 1, 1)
        }
      }
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('resize', onResize)
    loop()

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('touchmove', onTouch)
      window.removeEventListener('resize', onResize)
      cx.clearRect(0, 0, W, H)
    }
  }, [active])
}
