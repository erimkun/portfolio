// src/components/PixelRiver.jsx
import { useRef } from 'react'
import { usePixelRiver } from '../hooks/usePixelRiver'

export default function PixelRiver({ scrollerRef, active }) {
  const canvasRef = useRef(null)
  usePixelRiver(canvasRef, scrollerRef, active)

  return (
    <canvas
      ref={canvasRef}
      className="river-canvas"
      aria-hidden="true"
    />
  )
}
