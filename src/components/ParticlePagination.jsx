import { useEffect, useRef } from 'react'

// Common canvas particle logic for morphing shapes
function createParticleSystem(canvas, getTargetPoints, interactive = false) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  let particles = []
  let targets = []
  let animationId
  let width, height
  
  let mouse = { x: -1000, y: -1000, radius: 60 }
  
  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    width = rect.width
    height = rect.height
    canvas.width = width
    canvas.height = height
    updateTargets()
  }

  const updateTargets = () => {
    targets = getTargetPoints(width, height)
    
    // Adjust particle count
    while (particles.length < targets.length) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        originX: 0,
        originY: 0,
        color: `rgba(180, 210, 255, ${0.4 + Math.random() * 0.6})`,
        size: 0.8 + Math.random() * 1.5
      })
    }
    if (particles.length > targets.length) {
      particles.splice(targets.length)
    }

    // Shuffle targets for organic morphing
    targets.sort(() => Math.random() - 0.5)

    // Assign targets
    for (let i = 0; i < particles.length; i++) {
      particles[i].originX = targets[i].x
      particles[i].originY = targets[i].y
    }
  }

  const loop = () => {
    ctx.clearRect(0, 0, width, height)
    
    for (let i = 0; i < particles.length; i++) {
      let p = particles[i]
      
      let dx = p.originX - p.x
      let dy = p.originY - p.y
      
      // Mouse repulsion (only if interactive)
      if (interactive) {
        let mx = mouse.x - p.x
        let my = mouse.y - p.y
        let dist = Math.sqrt(mx * mx + my * my)
        
        if (dist < mouse.radius) {
          let force = (mouse.radius - dist) / mouse.radius
          let angle = Math.atan2(my, mx)
          p.vx -= Math.cos(angle) * force * 4
          p.vy -= Math.sin(angle) * force * 4
        }
      }
      
      // Spring to target
      p.vx += dx * 0.05
      p.vy += dy * 0.05
      
      // Friction
      p.vx *= 0.82
      p.vy *= 0.82
      
      p.x += p.vx
      p.y += p.vy
      
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }
    
    animationId = requestAnimationFrame(loop)
  }

  const handleMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect()
    mouse.x = e.clientX - rect.left
    mouse.y = e.clientY - rect.top
  }

  const handleMouseLeave = () => {
    mouse.x = -1000
    mouse.y = -1000
  }

  window.addEventListener('resize', resize)
  if (interactive) {
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)
  }
  
  resize()
  loop()
  
  return {
    updateTargets,
    destroy: () => {
      window.removeEventListener('resize', resize)
      if (interactive) {
        canvas.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('mouseleave', handleMouseLeave)
      }
      cancelAnimationFrame(animationId)
    }
  }
}

// Generate points from text
function getTextPoints(text, width, height) {
  const offscreen = document.createElement('canvas')
  offscreen.width = width
  offscreen.height = height
  const ctx = offscreen.getContext('2d', { willReadFrequently: true })
  
  ctx.fillStyle = 'white'
  ctx.font = `bold ${Math.min(width, height) * 0.8}px 'Anton', sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, width / 2, height / 2)
  
  const imgData = ctx.getImageData(0, 0, width, height).data
  const points = []
  
  // Sample pixels, step determines particle density
  const step = 4
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4
      if (imgData[idx + 3] > 128) {
        points.push({ x, y })
      }
    }
  }
  return points
}

// Generate points from an arrow shape
function getArrowPoints(direction, width, height) {
  const offscreen = document.createElement('canvas')
  offscreen.width = width
  offscreen.height = height
  const ctx = offscreen.getContext('2d', { willReadFrequently: true })
  
  ctx.fillStyle = 'white'
  ctx.beginPath()
  
  const cx = width / 2
  const cy = height / 2
  const s = Math.min(width, height) * 0.4
  
  if (direction === 'right') {
    ctx.moveTo(cx - s/2, cy - s)
    ctx.lineTo(cx + s/2, cy)
    ctx.lineTo(cx - s/2, cy + s)
  } else {
    ctx.moveTo(cx + s/2, cy - s)
    ctx.lineTo(cx - s/2, cy)
    ctx.lineTo(cx + s/2, cy + s)
  }
  
  ctx.lineWidth = 14
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = 'white'
  ctx.stroke()
  
  const imgData = ctx.getImageData(0, 0, width, height).data
  const points = []
  
  const step = 3
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4
      if (imgData[idx + 3] > 128) {
        points.push({ x, y })
      }
    }
  }
  return points
}

export function ParticleNumber({ value }) {
  const canvasRef = useRef(null)
  const systemRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    
    if (!systemRef.current) {
      systemRef.current = createParticleSystem(
        canvasRef.current,
        (w, h) => getTextPoints(value.toString(), w, h),
        false
      )
    } else {
      systemRef.current.updateTargets()
    }
    
    return () => {
      systemRef.current?.destroy()
      systemRef.current = null
    }
  }, [value])

  return (
    <canvas 
      ref={canvasRef} 
      style={{ width: '120px', height: '120px', display: 'block', margin: '0 auto' }} 
    />
  )
}

export function ParticleArrow({ direction, onClick }) {
  const canvasRef = useRef(null)
  const systemRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    
    systemRef.current = createParticleSystem(
      canvasRef.current,
      (w, h) => getArrowPoints(direction, w, h),
      true // interactive
    )
    
    return () => {
      systemRef.current?.destroy()
      systemRef.current = null
    }
  }, [direction])

  return (
    <canvas 
      ref={canvasRef}
      onClick={onClick}
      style={{ 
        width: '80px', 
        height: '80px', 
        display: 'block',
        cursor: 'pointer'
      }} 
    />
  )
}
