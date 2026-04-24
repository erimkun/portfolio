import { useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { projects } from '../data/content'

const PAGE_SIZE = 5
const PAGES = [projects.slice(0, PAGE_SIZE), projects.slice(PAGE_SIZE, PAGE_SIZE * 2)]

const pageVariants = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
}

const pageTransition = {
  type: 'tween',
  ease: [0.16, 1, 0.3, 1],
  duration: 0.48,
}

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.28 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const detailCardVariants = {
  hidden: { x: -28, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] } },
}

const detailPanelVariants = {
  hidden: { x: 44, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.42, delay: 0.08, ease: [0.16, 1, 0.3, 1] } },
}

const revealVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
      when: 'beforeChildren',
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    y: 12,
    transition: { duration: 0.24, ease: [0.4, 0, 0.2, 1] },
  },
}

const revealCardVariants = {
  hidden: { x: -24, opacity: 0, scale: 0.98 },
  visible: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.46, ease: [0.16, 1, 0.3, 1] },
  },
}

const copyGroupVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
}

const copyItemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.34, ease: [0.16, 1, 0.3, 1] },
  },
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function ArrowIcon({ dir = 1 }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
      style={{ transform: dir < 0 ? 'rotate(180deg)' : 'none' }}>
      <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ProjectsSection() {
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState(1)
  const [selected, setSelected] = useState(null)
  const currentProjects = PAGES[page]

  const changePage = (newPage) => {
    setDirection(newPage > page ? 1 : -1)
    setSelected(null)
    setPage(newPage)
  }

  const handleCardClick = (e, proj) => {
    e.preventDefault()
    setSelected(proj)
  }

  const handleClose = () => setSelected(null)

  return (
    <LayoutGroup id="projects-stage">
      <section
        id="section-projects"
        className="portfolio-section projects-section slider-projects"
        data-section-idx="4"
      >
        <div className="section-inner">
          <header className="section-header">
            <span className="section-tag">// PROJELER</span>
            <h2 className="section-title">
              <span className="title-text" data-river-node="projects">PROJECTS</span>
            </h2>
          </header>

          <div className={`slider-stage${selected ? ' is-open' : ''}`}>
            <AnimatePresence initial={false} mode="popLayout">
              {selected ? (
                <motion.div
                  key={`detail-${selected.id}`}
                  className="slider-reveal"
                  variants={revealVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.div className="slider-reveal-card" variants={revealCardVariants}>
                    <motion.a
                      layoutId={`project-card-${selected.id}`}
                      href={selected.url}
                      className="glass-card glass-card--featured"
                      aria-label={selected.name}
                      onClick={(e) => {
                        if (selected.url === '#') {
                          e.preventDefault()
                        }
                      }}
                    >
                      {selected.image && (
                        <div className="glass-card-img-wrap">
                          <img
                            className="glass-card-img"
                            src={selected.image}
                            alt={selected.name}
                          />
                        </div>
                      )}
                      <div className="glass-card-body">
                        <h3 className="glass-card-name">{selected.name}</h3>
                        <ul className="glass-card-tech">
                          {selected.tech?.map((t) => <li key={t}>{t}</li>)}
                        </ul>
                      </div>
                    </motion.a>
                  </motion.div>

                  <motion.div
                    className="slider-reveal-panel"
                    variants={copyGroupVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.button
                      className="slider-close-btn"
                      onClick={handleClose}
                      aria-label="Kapat"
                      variants={copyItemVariants}
                    >
                      <CloseIcon />
                      KAPAT
                    </motion.button>
                    <motion.p className="detail-kicker" variants={copyItemVariants}>
                      // {String(projects.findIndex((p) => p.id === selected.id) + 1).padStart(2, '0')}
                    </motion.p>
                    <motion.h3 className="detail-name" variants={copyItemVariants}>{selected.name}</motion.h3>
                    <motion.p className="detail-desc" variants={copyItemVariants}>{selected.description}</motion.p>
                    {selected.details?.length > 0 && (
                      <motion.ul className="detail-points" variants={copyGroupVariants}>
                        {selected.details.map((d) => (
                          <motion.li key={d} variants={copyItemVariants}>{d}</motion.li>
                        ))}
                      </motion.ul>
                    )}
                    <motion.ul className="detail-tech" variants={copyGroupVariants}>
                      {selected.tech?.map((t) => <motion.li key={t} variants={copyItemVariants}>{t}</motion.li>)}
                    </motion.ul>
                    {selected.url && selected.url !== '#' && (
                      <motion.a
                        href={selected.url}
                        className="detail-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        variants={copyItemVariants}
                      >
                        Projeyi Gör <ArrowIcon />
                      </motion.a>
                    )}
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="slider-overflow-clip">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={`page-${page}`}
                  custom={direction}
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={pageTransition}
                  className="slider-grid-wrap"
                >
                  <motion.div className="slider-grid" layout>
                    {currentProjects.map((proj) => {
                      const isSelected = selected?.id === proj.id

                      if (isSelected) {
                        return null
                      }

                      return (
                        <motion.a
                          key={proj.id}
                          href={proj.url}
                          className="glass-card"
                          layout
                          layoutId={`project-card-${proj.id}`}
                          onClick={(e) => handleCardClick(e, proj)}
                          aria-label={proj.name}
                          transition={{ layout: { duration: 0.46, ease: [0.16, 1, 0.3, 1] } }}
                        >
                          {proj.image && (
                            <div className="glass-card-img-wrap">
                              <img
                                className="glass-card-img"
                                src={proj.image}
                                alt={proj.name}
                                loading="lazy"
                              />
                            </div>
                          )}
                          <div className="glass-card-body">
                            <h3 className="glass-card-name">{proj.name}</h3>
                            <p className="glass-card-desc">{proj.description}</p>
                            <ul className="glass-card-tech">
                              {proj.tech?.map((t) => <li key={t}>{t}</li>)}
                            </ul>
                          </div>
                        </motion.a>
                      )
                    })}
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="slider-pagination">
              <button
                className="slider-nav-btn"
                onClick={() => changePage(0)}
                disabled={page === 0}
                aria-label="Önceki sayfa"
              >
                <ArrowIcon dir={-1} />
              </button>
              {PAGES.map((_, i) => (
                <button
                  key={i}
                  className={`slider-page-dot ${page === i ? 'active' : ''}`}
                  onClick={() => changePage(i)}
                  aria-label={`Sayfa ${i + 1}`}
                  aria-current={page === i ? 'true' : undefined}
                >
                  <span className="slider-page-dot-label">0{i + 1}</span>
                </button>
              ))}
              <button
                className="slider-nav-btn"
                onClick={() => changePage(1)}
                disabled={page === 1}
                aria-label="Sonraki sayfa"
              >
                <ArrowIcon dir={1} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </LayoutGroup>
  )
}
