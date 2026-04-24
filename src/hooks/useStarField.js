import { useEffect } from 'react'

export function useStarField(canvasRef) {
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let stars = [], w = 0, h = 0, raf

    function resize() {
      w = window.innerWidth
      h = window.innerHeight
      c.width  = w * dpr
      c.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.floor(w * h / 2400)
      stars = Array.from({ length: count }, () => ({
        x:  Math.random() * w,
        y:  Math.random() * h * (0.85 + Math.random() * 0.15),
        r:  Math.random() * 1.2 + 0.15,
        a:  Math.random() * 0.8 + 0.2,
        tw: Math.random() * Math.PI * 2,
        sp: 0.6 + Math.random() * 1.4,
      }))
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        const tw = 0.55 + 0.45 * Math.sin(t * 0.001 * s.sp + s.tw)
        const sx = Math.round(s.x), sy = Math.round(s.y)
        const ss = Math.max(1, Math.round(s.r))
        ctx.globalAlpha = s.a * tw * 0.08
        ctx.fillStyle = '#c8d8ff'
        ctx.fillRect(sx - ss*3, sy - ss*3, ss*6, ss*6)
        ctx.globalAlpha = s.a * tw
        ctx.fillStyle = '#dde8ff'
        ctx.fillRect(sx - ss, sy - ss, ss*2, ss*2)
        if (ss >= 2) {
          ctx.globalAlpha = s.a * tw * 0.9
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(sx, sy, 1, 1)
        }
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])
}
