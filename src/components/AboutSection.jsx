import { useEffect, useRef, useState } from 'react'

export default function AboutSection() {
  const rootRef = useRef(null)
  const dustRef = useRef(null)
  const [revealed, setRevealed] = useState(false)

  // Reveal (pixel → real photo) while section is in view; dissolve back on leave
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          setRevealed(e.intersectionRatio >= 0.35)
        }
      },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Cosmic dust over the photo
  useEffect(() => {
    const canvas = dustRef.current
    if (!canvas) return
    const cx = canvas.getContext('2d')
    const parent = canvas.parentElement

    let W, H, dots, raf
    const resize = () => {
      const r = parent.getBoundingClientRect()
      W = canvas.width  = Math.max(1, Math.floor(r.width))
      H = canvas.height = Math.max(1, Math.floor(r.height))
      const count = Math.floor((W * H) / 5200)
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() < 0.15 ? 1.6 : 0.8,
        a: 0.12 + Math.random() * 0.45,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -0.04 - Math.random() * 0.18,
        hue: [200, 220, 35, 280][Math.floor(Math.random() * 4)],
        ph: Math.random() * Math.PI * 2,
      }))
    }

    const loop = () => {
      raf = requestAnimationFrame(loop)
      const t = performance.now() * 0.001
      cx.clearRect(0, 0, W, H)
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy
        if (d.y < -4) { d.y = H + 4; d.x = Math.random() * W }
        if (d.x < -4) d.x = W + 4
        if (d.x > W + 4) d.x = -4
        const tw = 0.55 + 0.45 * Math.sin(t * 1.4 + d.ph)
        const a = d.a * tw
        cx.fillStyle = `hsla(${d.hue},70%,82%,${a * 0.18})`
        cx.fillRect(d.x - d.r * 3, d.y - d.r * 3, d.r * 6, d.r * 6)
        cx.fillStyle = `hsla(${d.hue},60%,95%,${a})`
        cx.fillRect(d.x - d.r, d.y - d.r, d.r * 2, d.r * 2)
      }
    }

    resize()
    loop()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return (
    <section
      ref={rootRef}
      id="section-about"
      className={`portfolio-section about-section${revealed ? ' revealed' : ''}`}
      data-section-idx="1"
    >
      <div className="about-grid">
        {/* ── LEFT: photo ───────────────────────────────────── */}
        <figure className="about-photo">
          <div className="photo-frame" data-river-node="about">
            <img
              className="photo-real"
              src="https://picsum.photos/seed/erim-portrait/900/1200"
              alt="Erden Erim"
              draggable="false"
            />
            <img
              className="photo-pixel"
              src="/erimpixel.png"
              alt=""
              aria-hidden="true"
            />
            <canvas ref={dustRef} className="photo-dust" />
            <span className="scan-line" />
            <span className="frame-corner tl" />
            <span className="frame-corner tr" />
            <span className="frame-corner bl" />
            <span className="frame-corner br" />
          </div>
          <figcaption className="photo-meta">
            <span>ID-0421.ERM</span>
            <span>REF // SELF-PORTRAIT</span>
          </figcaption>
        </figure>

        {/* ── RIGHT: data panels ───────────────────────────── */}
        <div className="about-data">
          <header className="data-head">
            <span className="data-tag">// FILE_01</span>
            <h2 className="data-title">
              BIOMETRIC DATA<span className="data-title-sep">:</span>
              <span className="data-title-name">ERDEN ERİM</span>
            </h2>
            <div className="data-underline" />
          </header>

          <div className="data-panel">
            <div className="panel-noise" />
            <p className="data-body">
              Uzay-zaman sürekliliğinde dijital bir iz: piksel piksellerle kod
              yazan, gerçekliği yeniden hayal eden bir simyacı. 8-bitlik nostaljiyi
              kuantum hesaplamanın sınırlarıyla harmanlayan bir tasarım mühendisi.
              Hem kodda hem de kozmosta düzen arayışında. İstanbul, TR'de konumlu —
              sonsuzluğa bağlı.
            </p>
          </div>

          <dl className="data-stats">
            <div className="stat">
              <dt>STATUS</dt>
              <dd><i className="stat-dot" /> ACTIVE</dd>
            </div>
            <div className="stat">
              <dt>LOCATION</dt>
              <dd>ISTANBUL, TR</dd>
            </div>
            <div className="stat">
              <dt>SIGNAL</dt>
              <dd>∞ / STABLE</dd>
            </div>
            <div className="stat">
              <dt>BUILD</dt>
              <dd>v4.7 — 2026</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
