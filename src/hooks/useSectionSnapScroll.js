import { useCallback, useEffect, useRef } from 'react'

const WHEEL_THRESHOLD = 10
const TOUCH_THRESHOLD = 34
const WHEEL_DURATION_MS = 980
const DOT_NAV_DURATION_MS = 1280
const SETTLE_DELAY_MS = 130

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
const easeInOutCubic = (t) => (
  t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
)

export function useSectionSnapScroll(scrollerRef, sections) {
  const rafRef = useRef(null)
  const settleTimerRef = useRef(null)
  const wheelResetTimerRef = useRef(null)
  const wheelAccumRef = useRef(0)
  const touchStartYRef = useRef(null)
  const isAnimatingRef = useRef(false)

  const clearAnimation = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    isAnimatingRef.current = false
  }, [])

  const getSectionElements = useCallback((container) => {
    if (!container) return []

    const sorted = Array.from(container.querySelectorAll('[data-section-idx]'))
      .map((el) => {
        const idx = parseInt(el.dataset.sectionIdx, 10)
        return { idx, el }
      })
      .filter(({ idx }) => !Number.isNaN(idx))
      .sort((a, b) => a.idx - b.idx)

    return sorted.map(({ el }) => el)
  }, [])

  const getNearestSectionIndex = useCallback((container, sectionEls) => {
    if (!container || !sectionEls.length) return 0
    const top = container.scrollTop

    let nearest = 0
    let nearestDist = Infinity

    sectionEls.forEach((el, idx) => {
      const dist = Math.abs(el.offsetTop - top)
      if (dist < nearestDist) {
        nearestDist = dist
        nearest = idx
      }
    })

    return nearest
  }, [])

  const animateToIndex = useCallback((targetIndex, duration = WHEEL_DURATION_MS) => {
    const container = scrollerRef.current
    if (!container) return

    const sectionEls = getSectionElements(container)
    if (!sectionEls.length) return

    const safeIndex = clamp(targetIndex, 0, sectionEls.length - 1)
    const targetTop = sectionEls[safeIndex].offsetTop
    const startTop = container.scrollTop
    const delta = targetTop - startTop

    if (Math.abs(delta) < 1) {
      container.scrollTop = targetTop
      return
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || duration <= 0) {
      container.scrollTop = targetTop
      return
    }

    clearAnimation()
    isAnimatingRef.current = true

    const startTime = performance.now()

    const tick = (now) => {
      const t = clamp((now - startTime) / duration, 0, 1)
      const eased = easeInOutCubic(t)
      container.scrollTop = startTop + delta * eased

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      container.scrollTop = targetTop
      isAnimatingRef.current = false
      rafRef.current = null
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [clearAnimation, getSectionElements, scrollerRef])

  const scrollToSectionId = useCallback((sectionId, duration = DOT_NAV_DURATION_MS) => {
    const targetIdx = sections.findIndex((s) => s.id === sectionId)
    if (targetIdx < 0) return
    animateToIndex(targetIdx, duration)
  }, [animateToIndex, sections])

  useEffect(() => {
    const container = scrollerRef.current
    if (!container) return

    const onWheel = (event) => {
      if (isAnimatingRef.current) {
        event.preventDefault()
        return
      }

      const delta = event.deltaY
      if (!delta) return

      event.preventDefault()

      wheelAccumRef.current += delta

      if (wheelResetTimerRef.current) {
        clearTimeout(wheelResetTimerRef.current)
      }
      wheelResetTimerRef.current = setTimeout(() => {
        wheelAccumRef.current = 0
      }, 120)

      if (Math.abs(wheelAccumRef.current) < WHEEL_THRESHOLD) return

      const sectionEls = getSectionElements(container)
      if (!sectionEls.length) return

      const current = getNearestSectionIndex(container, sectionEls)
      const dir = wheelAccumRef.current > 0 ? 1 : -1
      const next = clamp(current + dir, 0, sectionEls.length - 1)
      wheelAccumRef.current = 0

      if (next === current) return
      animateToIndex(next, WHEEL_DURATION_MS)
    }

    const onTouchStart = (event) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null
    }

    const onTouchEnd = (event) => {
      if (isAnimatingRef.current) return

      const startY = touchStartYRef.current
      const endY = event.changedTouches[0]?.clientY
      touchStartYRef.current = null

      if (startY == null || endY == null) return
      const delta = startY - endY
      if (Math.abs(delta) < TOUCH_THRESHOLD) return

      const sectionEls = getSectionElements(container)
      if (!sectionEls.length) return

      const current = getNearestSectionIndex(container, sectionEls)
      const dir = delta > 0 ? 1 : -1
      const next = clamp(current + dir, 0, sectionEls.length - 1)

      if (next === current) return
      animateToIndex(next, WHEEL_DURATION_MS)
    }

    const onScroll = () => {
      if (isAnimatingRef.current) return

      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current)
      }

      settleTimerRef.current = setTimeout(() => {
        const sectionEls = getSectionElements(container)
        if (!sectionEls.length) return

        const nearest = getNearestSectionIndex(container, sectionEls)
        const targetTop = sectionEls[nearest]?.offsetTop ?? 0

        if (Math.abs(container.scrollTop - targetTop) < 2) return
        animateToIndex(nearest, 760)
      }, SETTLE_DELAY_MS)
    }

    container.addEventListener('wheel', onWheel, { passive: false })
    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchend', onTouchEnd, { passive: true })
    container.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchend', onTouchEnd)
      container.removeEventListener('scroll', onScroll)

      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current)
        settleTimerRef.current = null
      }

      if (wheelResetTimerRef.current) {
        clearTimeout(wheelResetTimerRef.current)
        wheelResetTimerRef.current = null
      }

      wheelAccumRef.current = 0

      clearAnimation()
    }
  }, [animateToIndex, clearAnimation, getNearestSectionIndex, getSectionElements, scrollerRef])

  return { scrollToSectionId }
}