import { useEffect } from 'react'

const COLORS = [
  { bg: '#020714', grad: '220, 240' },   // Hero       — mavi
  { bg: '#0a0d2e', grad: '240, 260' },   // About      — mavi-mor
  { bg: '#0d0828', grad: '260, 280' },   // Education  — mor-indigo
  { bg: '#1a1208', grad: '35, 45'   },   // Experience — amber
  { bg: '#071a12', grad: '150, 160' },   // Projects   — yeşil
  { bg: '#1a0810', grad: '350, 10'  },   // Contact    — kırmızı
]

export function useScrollColor(scrollerRef) {
  useEffect(() => {
    const container = scrollerRef.current
    if (!container) return

    const sections = Array.from(container.querySelectorAll('[data-section-idx]'))
    if (!sections.length) return

    const apply = (idx) => {
      const c = COLORS[idx] ?? COLORS[0]
      document.documentElement.style.setProperty('--section-bg', c.bg)
      document.documentElement.style.setProperty('--section-grad', c.grad)
    }

    apply(0)

    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.sectionIdx, 10)
            if (!Number.isNaN(idx)) apply(idx)
          }
        }
      },
      { root: container, threshold: 0.45 }
    )

    sections.forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [scrollerRef])
}
