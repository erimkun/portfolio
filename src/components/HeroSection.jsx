import { useRef, useEffect } from 'react'

export default function HeroSection({ visible, onReset }) {
  const nw1Ref = useRef(null)
  const imgRef = useRef(null)
  const nw2Ref = useRef(null)
  const subRef = useRef(null)

  useEffect(() => {
    const refs = [nw1Ref, imgRef, nw2Ref, subRef]
    if (!visible) {
      refs.forEach(r => r.current?.classList.remove('in'))
      return
    }
    const delays = [380, 450, 520, 800]
    const ids = refs.map((r, i) =>
      setTimeout(() => r.current?.classList.add('in'), delays[i])
    )
    return () => ids.forEach(clearTimeout)
  }, [visible])

  return (
    <section id="section-hero" className="portfolio-section hero-section" data-section-idx="0">
      <div className="unlock-content">
        <div className="unlocked-title">
          <span ref={nw1Ref} className="name-word">ERDEN</span>
          <img
            ref={imgRef}
            className="pixel-logo"
            src="/erimpixel.png"
            alt=""
            data-river-node="hero"
          />
          <span ref={nw2Ref} className="name-word">ERİM</span>
        </div>
        <div ref={subRef} className="unlocked-sub">must to know ↓</div>
      </div>
      <button className="reset-btn" onClick={onReset}>reset</button>
    </section>
  )
}
