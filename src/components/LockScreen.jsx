import { useRef } from 'react'
import { useClock }    from '../hooks/useClock'
import { useStarField } from '../hooks/useStarField'
import Eyes        from './Eyes'
import SmileCanvas from './SmileCanvas'

export default function LockScreen({ onUnlock }) {
  const starsRef  = useRef(null)
  const eyesRef   = useRef(null)
  const stageRef  = useRef(null)
  const hintRef   = useRef(null)
  const subRef    = useRef(null)
  const waveRef   = useRef(null)
  const { time, date } = useClock()

  useStarField(starsRef)

  return (
    <div className="stage" ref={stageRef}>
      <canvas className="stars-canvas" ref={starsRef} />

      <div className="brand">erim · 04.20</div>
      <div className="status"><span className="status-dot" />LOCKED</div>

      <div className="chrome">
        <div className="chrome-date">{date}</div>
        <div className="chrome-time">{time}</div>
      </div>

      <Eyes containerRef={eyesRef} />

      <div className="caption">
        <div className="caption-hint" ref={hintRef}>draw a smile to unlock</div>
        <div className="caption-sub"  ref={subRef}>swipe a gentle curve below the eyes</div>
      </div>

      <SmileCanvas
        eyesRef={eyesRef}
        stageRef={stageRef}
        hintRef={hintRef}
        subRef={subRef}
        waveRef={waveRef}
        onUnlock={onUnlock}
      />

      <div className="wave" ref={waveRef} />
    </div>
  )
}
