import { useEffect, useMemo, useRef, useState } from 'react'
import { skillsClusters } from '../data/content'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const getCurvedPath = (x1, y1, x2, y2, curve = 0.16) => {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 0.01) return `M ${x1} ${y1} L ${x2} ${y2}`
  const mx = ((x1 + x2) / 2 + (-dy / len) * (len * curve)).toFixed(2)
  const my = ((y1 + y2) / 2 + (dx / len) * (len * curve)).toFixed(2)
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`
}

export default function SkillsSection() {
  const sectionRef = useRef(null)
  const [activeCluster, setActiveCluster] = useState(skillsClusters[0]?.id ?? null)
  const [floatShift, setFloatShift] = useState(0)
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const [constPointer, setConstPointer] = useState({ x: 0, y: 0 })

  const nodes = useMemo(
    () => skillsClusters.flatMap((cluster) => (
      cluster.stars.map((star) => ({
        ...star,
        clusterId: cluster.id,
        hue: cluster.hue,
      }))
    )),
    []
  )

  const edges = useMemo(() => {
    let i = 0
    return skillsClusters.flatMap((cluster) =>
      cluster.links.map(([from, to]) => ({
        id: `${cluster.id}-edge-${i}`,
        from,
        to,
        clusterId: cluster.id,
        hue: cluster.hue,
        gidx: i++,
      }))
    )
  }, [])

  const nodeById = useMemo(
    () => new Map(nodes.map((node) => [node.id, node])),
    [nodes]
  )

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const scroller = section.closest('.shell-scroll')
    const scrollSource = scroller || window
    let rafId = 0

    const updateFloat = () => {
      const rect = section.getBoundingClientRect()
      const viewportHeight = window.innerHeight || 1
      const sectionCenter = rect.top + rect.height / 2
      const viewportCenter = viewportHeight / 2
      const normalized = clamp((viewportCenter - sectionCenter) / viewportHeight, -1, 1)
      setFloatShift(normalized * 48)
    }

    const scheduleUpdate = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = 0
        updateFloat()
      })
    }

    scheduleUpdate()
    scrollSource.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate, { passive: true })

    return () => {
      scrollSource.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  const handleOrbitalPointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2
    setPointer({ x: clamp(x, -1, 1), y: clamp(y, -1, 1) })
  }

  const handleConstellationPointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2
    setConstPointer({ x: clamp(x, -1, 1), y: clamp(y, -1, 1) })
  }

  return (
    <section
      ref={sectionRef}
      id="section-skills"
      className="portfolio-section skills-section"
      data-section-idx="5"
    >
      <div className="section-inner skills-inner">
        <header className="section-header">
          <span className="section-tag">// YETENEK HARITASI</span>
          <h2 className="section-title">
            <span className="title-text" data-river-node="skills">SKILLS</span>
          </h2>
        </header>

        <div className="skills-layout">
          <div
            className="skills-constellation"
            onMouseLeave={() => {
              setActiveCluster(skillsClusters[0]?.id ?? null)
              setConstPointer({ x: 0, y: 0 })
            }}
            onMouseMove={handleConstellationPointerMove}
          >
            {/* Parallax field — SVG + stars move together */}
            <div
              className="constellation-field"
              style={{
                transform: `translate(${(constPointer.x * 3).toFixed(1)}px, ${(constPointer.y * 3).toFixed(1)}px)`,
              }}
            >
              <svg
                className="constellation-lines"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {edges.map((edge) => {
                  const from = nodeById.get(edge.from)
                  const to = nodeById.get(edge.to)
                  if (!from || !to) return null

                  const isActive = activeCluster === edge.clusterId
                  const d = getCurvedPath(from.x, from.y, to.x, to.y)
                  const durSec = (1.6 + (edge.gidx % 7) * 0.28).toFixed(2)

                  return (
                    <g key={edge.id}>
                      <path
                        className={`constellation-edge${isActive ? ' is-active' : ''}`}
                        d={d}
                        fill="none"
                        style={{ '--cluster-hue': edge.hue }}
                      />
                      {isActive && (
                        <>
                          <circle
                            r="0.65"
                            fill={`hsla(${edge.hue}, 100%, 90%, 0.95)`}
                            style={{ filter: `drop-shadow(0 0 1.2px hsla(${edge.hue}, 100%, 88%, 1))` }}
                          >
                            <animateMotion
                              path={d}
                              dur={`${durSec}s`}
                              repeatCount="indefinite"
                              calcMode="linear"
                            />
                          </circle>
                          <circle
                            r="0.42"
                            fill={`hsla(${edge.hue}, 100%, 90%, 0.55)`}
                            style={{ filter: `drop-shadow(0 0 0.8px hsla(${edge.hue}, 100%, 88%, 0.7))` }}
                          >
                            <animateMotion
                              path={d}
                              dur={`${durSec}s`}
                              begin={`-${(parseFloat(durSec) * 0.5).toFixed(2)}s`}
                              repeatCount="indefinite"
                              calcMode="linear"
                            />
                          </circle>
                        </>
                      )}
                    </g>
                  )
                })}

                {nodes
                  .filter((n) => n.clusterId === activeCluster)
                  .map((node) => (
                    <circle
                      key={`pulse-${node.id}`}
                      cx={node.x}
                      cy={node.y}
                      r="1.2"
                      fill="none"
                      stroke={`hsla(${node.hue}, 90%, 82%, 0.55)`}
                      strokeWidth="0.18"
                      className="node-pulse-ring"
                    />
                  ))}
              </svg>

              <div className="constellation-stars">
                {nodes.map((node) => {
                  const isActive = activeCluster === node.clusterId

                  return (
                    <button
                      key={node.id}
                      type="button"
                      className={`skill-star${isActive ? ' is-active' : ''}`}
                      style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        '--cluster-hue': node.hue,
                      }}
                      onMouseEnter={() => setActiveCluster(node.clusterId)}
                      onFocus={() => setActiveCluster(node.clusterId)}
                      aria-label={node.label}
                    >
                      <span className="skill-star-core" />
                      <span className="skill-star-label">{node.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="constellation-legend" role="note">
              <p>Hover a cluster to amplify glow + links.</p>
              <ul>
                {skillsClusters.map((cluster) => (
                  <li key={cluster.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveCluster(cluster.id)}
                      onFocus={() => setActiveCluster(cluster.id)}
                      className={`legend-btn${activeCluster === cluster.id ? ' is-active' : ''}`}
                      style={{ '--cluster-hue': cluster.hue }}
                    >
                      {cluster.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className="skills-orbital-grid"
            onMouseMove={handleOrbitalPointerMove}
            onMouseLeave={() => setPointer({ x: 0, y: 0 })}
          >
            {skillsClusters.map((cluster, idx) => {
              const isActive = activeCluster === cluster.id

              return (
                <article
                  key={cluster.id}
                  className={`orbit-card${isActive ? ' is-active' : ''}`}
                  onMouseEnter={() => setActiveCluster(cluster.id)}
                  onFocus={() => setActiveCluster(cluster.id)}
                  tabIndex={0}
                  style={{
                    '--cluster-hue': cluster.hue,
                    '--orbit-offset': `${Math.round(floatShift * cluster.orbit)}px`,
                    '--orbit-tilt-x': `${(-pointer.y * 2.2 * cluster.orbit).toFixed(2)}deg`,
                    '--orbit-tilt-y': `${(pointer.x * 3.2 * cluster.orbit).toFixed(2)}deg`,
                    '--orbit-delay': `${idx * -1.15}s`,
                  }}
                >
                  <p className="orbit-card-kicker">// {cluster.label.toUpperCase()} ORBIT</p>
                  <h3 className="orbit-card-title">{cluster.headline}</h3>
                  <p className="orbit-card-copy">{cluster.summary}</p>
                  <ul className="orbit-tags">
                    {cluster.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
