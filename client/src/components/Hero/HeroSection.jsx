import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHomepage } from '../../hooks/useCmsData'
import './Hero.css'

const defaultContent = {
  heading: 'Turning Agro-waste<br />to fine crafts',
  defaultImage: '/images/grey.jpg',
  hoverImage: '/images/brown.jpg',
  imageAlt: 'Turning Agro-waste to fine crafts',
}

export default function HeroSection() {
  const [hovered, setHovered] = useState(false)
  const { data: homepage } = useHomepage()
  const content = homepage?.hero || defaultContent

  const handleMouseEnter = useCallback(() => setHovered(true), [])
  const handleMouseLeave = useCallback(() => setHovered(false), [])

  return (
    <section className="hero" aria-label="Hero">
      <div
        className="hero-image-wrapper"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          className="hero-image hero-image-default"
          src={content.defaultImage || defaultContent.defaultImage}
          alt={content.imageAlt || defaultContent.imageAlt}
          loading="eager"
        />
        <AnimatePresence>
          {hovered && content.hoverImage && (
            <motion.img
              className="hero-image hero-image-hover"
              src={content.hoverImage}
              alt=""
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          )}
        </AnimatePresence>

        <div className="hero-overlay">
          <div className="hero-content container">
            <h1 className="hero-heading" dangerouslySetInnerHTML={{ __html: content.heading || defaultContent.heading }} />
          </div>
        </div>
      </div>
    </section>
  )
}