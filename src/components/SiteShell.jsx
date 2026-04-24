import { useRef } from 'react'
import { useParticles } from '../hooks/useParticles'
import { useScrollColor } from '../hooks/useScrollColor'
import HeroSection from './HeroSection'
import AboutSection from './AboutSection'
import EducationSection from './EducationSection'
import ExperienceSection from './ExperienceSection'
import ProjectsSection from './ProjectsSection'
import ContactSection from './ContactSection'
import DotNav from './DotNav'
import PixelRiver from './PixelRiver'
import { useSectionSnapScroll } from '../hooks/useSectionSnapScroll'

const SECTIONS = [
  { id: 'hero',       label: 'HOME'       },
  { id: 'about',      label: 'ABOUT'      },
  { id: 'education',  label: 'EDUCATION'  },
  { id: 'experience', label: 'EXPERIENCE' },
  { id: 'projects',   label: 'PROJECTS'   },
  { id: 'contact',    label: 'CONTACT'    },
]

export default function SiteShell({ visible, onReset }) {
  const canvasRef = useRef(null)
  const scrollRef = useRef(null)

  useParticles(canvasRef, visible)
  useScrollColor(scrollRef)
  const { scrollToSectionId } = useSectionSnapScroll(scrollRef, SECTIONS)

  return (
    <div className={`site-shell${visible ? ' on' : ''}`}>
      <canvas ref={canvasRef} className="particle-canvas" />
      <PixelRiver scrollerRef={scrollRef} active={visible} />
      <DotNav
        sections={SECTIONS}
        scrollerRef={scrollRef}
        onNavigate={scrollToSectionId}
      />
      <div ref={scrollRef} className="shell-scroll">
        <HeroSection visible={visible} onReset={onReset} />
        <AboutSection />
        <EducationSection />
        <ExperienceSection />
        <ProjectsSection />
        <ContactSection />
      </div>
    </div>
  )
}
