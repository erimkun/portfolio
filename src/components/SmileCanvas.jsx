import { useEffect, useRef } from 'react'

export default function SmileCanvas({ eyesRef, stageRef, hintRef, subRef, waveRef, onUnlock }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const c   = canvasRef.current
    const ctx = c.getContext('2d')
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let w = 0, h = 0

    function resize() {
      w = window.innerWidth
      h = window.innerHeight
      c.width  = w * dpr
      c.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    let drawing  = false
    let points   = []
    let unlocked = false

    function pos(e) {
      const p = e.touches ? e.touches[0] : e
      return { x: p.clientX, y: p.clientY }
    }

    function start(e) {
      if (unlocked) return
      if (e.target?.closest?.('.reset-btn')) return
      e.preventDefault()
      drawing = true
      points  = [pos(e)]
      ctx.clearRect(0, 0, w, h)
      if (hintRef.current) hintRef.current.style.opacity = '.35'
      if (subRef.current)  subRef.current.style.opacity  = '.35'
    }

    function move(e) {
      if (!drawing) return
      e.preventDefault()
      const p    = pos(e)
      const last = points[points.length - 1]
      if (Math.hypot(p.x - last.x, p.y - last.y) < 1.5) return
      points.push(p)
      render()
    }

    function end() {
      if (!drawing) return
      drawing = false
      evaluate()
    }

    function render() {
      ctx.clearRect(0, 0, w, h)
      if (points.length < 2) return
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'

      ctx.strokeStyle = 'rgba(140,190,255,.20)'; ctx.lineWidth = 28
      ctx.shadowBlur = 38; ctx.shadowColor = 'rgba(120,180,255,.45)'
      strokePath()

      ctx.strokeStyle = 'rgba(190,215,255,.58)'; ctx.lineWidth = 11
      ctx.shadowBlur = 18; ctx.shadowColor = 'rgba(170,210,255,.72)'
      strokePath()

      ctx.strokeStyle = 'rgba(255,225,160,.42)'; ctx.lineWidth = 5
      ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(255,210,140,.55)'
      strokePath()

      ctx.strokeStyle = 'rgba(255,255,255,.97)'; ctx.lineWidth = 1.8
      ctx.shadowBlur = 6; ctx.shadowColor = 'rgba(230,245,255,1)'
      strokePath()
      ctx.shadowBlur = 0
    }

    function strokePath() {
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i+1].x) / 2
        const yc = (points[i].y + points[i+1].y) / 2
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
      }
      const L = points[points.length - 1]
      ctx.lineTo(L.x, L.y)
      ctx.stroke()
    }

    function evaluate() {
      if (points.length < 10) { fade(); return }
      const xs    = points.map(p => p.x)
      const ys    = points.map(p => p.y)
      const minX  = Math.min(...xs), maxX = Math.max(...xs)
      const width = maxX - minX
      if (width < 140) { fade('a little wider, gently'); return }

      const s = points[0], e = points[points.length - 1]
      if (Math.abs(e.y - s.y) > width * 0.35) { fade('keep the ends level'); return }

      const mid = points.filter(p => p.x > minX + width*0.3 && p.x < maxX - width*0.3)
      if (mid.length < 3) { fade(); return }
      const dip = Math.max(...mid.map(p => p.y)) - (s.y + e.y) / 2
      if (dip < width * 0.12) { fade('curve it a bit more'); return }

      let signChanges = 0, lastSign = 0
      for (let i = 2; i < points.length; i++) {
        const dy = points[i].y - points[i-1].y
        const sg = dy > 0.5 ? 1 : dy < -0.5 ? -1 : 0
        if (sg !== 0 && sg !== lastSign && lastSign !== 0) signChanges++
        if (sg !== 0) lastSign = sg
      }
      if (signChanges < 1) { fade(); return }

      const avgY = ys.reduce((a, b) => a + b, 0) / ys.length
      if (avgY < window.innerHeight * 0.42) { fade('draw below the eyes'); return }

      success()
    }

    function fade(msg) {
      if (hintRef.current) {
        hintRef.current.textContent = msg || 'try again — a gentle smile'
        hintRef.current.style.opacity = '1'
      }
      if (subRef.current) {
        subRef.current.textContent = 'slow curve, ends level'
        subRef.current.style.opacity = '.7'
      }
      let alpha = 1
      const id = setInterval(() => {
        alpha -= 0.06
        ctx.save()
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillStyle = 'rgba(0,0,0,.14)'
        ctx.fillRect(0, 0, w, h)
        ctx.restore()
        if (alpha <= 0) {
          clearInterval(id)
          ctx.clearRect(0, 0, w, h)
          setTimeout(() => {
            if (hintRef.current) hintRef.current.textContent = 'draw a smile to unlock'
            if (subRef.current)  subRef.current.textContent  = 'swipe a gentle curve below the eyes'
          }, 900)
        }
      }, 30)
    }

    function success() {
      unlocked = true
      // no "vaporizing…" text — just fade everything out via .collapsing
      const stage = stageRef.current
      if (stage) stage.classList.add('collapsing')

      // shockwave
      const wave = waveRef.current
      if (wave) { wave.classList.remove('go'); void wave.offsetWidth; wave.classList.add('go') }

      const logoImg = new Image()
      logoImg.src = '/erimpixel.png'

      const run = () => {
        // Get the FINAL logo rect from UnlockPage's DOM (always mounted, opacity 0).
        // Neutralize its transform briefly so getBoundingClientRect returns the resting position.
        let tLeft, tTop, tW, tH
        const logoEl = document.querySelector('.pixel-logo')
        if (logoEl) {
          const prev = logoEl.style.cssText
          logoEl.style.transition = 'none'
          logoEl.style.transform  = 'translateY(0) scale(1)'
          const r = logoEl.getBoundingClientRect()
          tLeft = r.left; tTop = r.top; tW = r.width; tH = r.height
          void logoEl.offsetWidth
          logoEl.style.cssText = prev
        } else {
          tH = Math.min(340, Math.max(96, w * 0.21))
          tW = tH * ((logoImg.naturalWidth || 1) / (logoImg.naturalHeight || 1))
          tLeft = w / 2 - tW / 2; tTop = h / 2 - tH / 2
        }

        // Sample the logo on a fixed grid → target voxels
        const SAMPLE = 4
        const off = document.createElement('canvas')
        off.width  = Math.max(1, Math.round(tW / SAMPLE))
        off.height = Math.max(1, Math.round(tH / SAMPLE))
        const offCtx = off.getContext('2d', { willReadFrequently: true })
        offCtx.imageSmoothingEnabled = false
        offCtx.drawImage(logoImg, 0, 0, off.width, off.height)
        const data = offCtx.getImageData(0, 0, off.width, off.height).data

        const targets = []
        for (let py = 0; py < off.height; py++) {
          for (let px = 0; px < off.width; px++) {
            const i = (py * off.width + px) * 4
            if (data[i + 3] < 40) continue
            targets.push({
              x: tLeft + (px + 0.5) * SAMPLE,
              y: tTop  + (py + 0.5) * SAMPLE,
              r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] / 255,
            })
          }
        }
        // shuffle so convergence reads as swirl, not scan
        for (let i = targets.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[targets[i], targets[j]] = [targets[j], targets[i]]
        }

        // Each particle starts at a random point across the ENTIRE viewport — reads as "whole scene pixelated"
        const particles = targets.map((t) => ({
          sx: Math.random() * w,
          sy: Math.random() * h,
          tx: t.x, ty: t.y,
          r: t.r, g: t.g, b: t.b, alpha: t.a,
          size: SAMPLE - 0.5 + Math.random() * 0.8,
          phase: Math.random() * Math.PI * 2,
          swirl: 90 + Math.random() * 300,
          dropDelay: Math.random() * 0.28,
        }))

        // clear smile ink, voxels take over immediately
        ctx.clearRect(0, 0, w, h)

        // flash covers the scene-break moment
        if (stage) {
          const flash = document.createElement('div')
          Object.assign(flash.style, {
            position: 'fixed', inset: '0', zIndex: '18',
            background: 'rgba(210,230,255,.7)', pointerEvents: 'none',
          })
          stage.appendChild(flash)
          flash.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 720, easing: 'ease-out', fill: 'forwards' })
            .onfinish = () => flash.remove()
        }

        const DURATION = 1900
        const startT   = performance.now()

        function frame(now) {
          const t = Math.min(1, (now - startT) / DURATION)
          ctx.clearRect(0, 0, w, h)

          for (const p of particles) {
            const tt = Math.max(0, Math.min(1, (t - p.dropDelay) / (1 - p.dropDelay)))
            const e  = tt < 0.5 ? 4 * tt * tt * tt : 1 - Math.pow(-2 * tt + 2, 3) / 2

            // bezier with sagged control point → particles pour down then rise into the logo
            const mx = (p.sx + p.tx) / 2
            const my = Math.max(p.sy, p.ty) + 180
            const one = 1 - e
            const baseX = one * one * p.sx + 2 * one * e * mx + e * e * p.tx
            const baseY = one * one * p.sy + 2 * one * e * my + e * e * p.ty

            const rSwirl  = (1 - e) * p.swirl
            const spinAng = p.phase + tt * 9
            const x = baseX + Math.cos(spinAng) * rSwirl
            const y = baseY + Math.sin(spinAng) * rSwirl * 0.55

            const fa = Math.min(1, tt * 1.8 + 0.2)
            ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.alpha * fa})`
            ctx.fillRect(x, y, p.size, p.size)
          }

          if (t < 1) requestAnimationFrame(frame)
          else {
            // Voxels are now in the exact position of Hero's .pixel-logo img.
            // SiteShell has faded in on top by this point, so the real
            // erimpixel.png image is visible at the same spot — hand off
            // to it and clear the fixed lock-screen canvas so it doesn't
            // shadow the page when the user scrolls.
            setTimeout(() => ctx.clearRect(0, 0, w, h), 1400)
          }
        }
        requestAnimationFrame(frame)

        // unlock page mists in while voxels are already assembled
        setTimeout(onUnlock, DURATION - 220)
      }

      if (logoImg.complete && logoImg.naturalWidth) run()
      else {
        logoImg.onload  = run
        logoImg.onerror = () => setTimeout(onUnlock, 700)
      }
    }

    window.addEventListener('mousedown',  start)
    window.addEventListener('mousemove',  move)
    window.addEventListener('mouseup',    end)
    window.addEventListener('touchstart', start, { passive: false })
    window.addEventListener('touchmove',  move,  { passive: false })
    window.addEventListener('touchend',   end)

    return () => {
      window.removeEventListener('resize',     resize)
      window.removeEventListener('mousedown',  start)
      window.removeEventListener('mousemove',  move)
      window.removeEventListener('mouseup',    end)
      window.removeEventListener('touchstart', start)
      window.removeEventListener('touchmove',  move)
      window.removeEventListener('touchend',   end)
    }
  }, [])

  return <canvas ref={canvasRef} className="ink-canvas" />
}
