import { motion } from 'framer-motion'
import { useHomepage } from '../../hooks/useCmsData'
import './Awards.css'

const defaultContent = {
  heading: 'Award and recognition',
  subtitle: 'Our commitment to sustainability and craftsmanship has been recognized globally.',
  image: '/images/awards.png',
  imageAlt: 'Awards and recognition',
}

export default function AwardsSection() {
  const { data: homepage } = useHomepage()
  const content = homepage?.awards || defaultContent

  return (
    <section className="awards section">
      <div className="container">
        <motion.div
          className="awards-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="awards-title">{content.heading || defaultContent.heading}</h2>
          <p className="awards-subtitle">{content.subtitle || defaultContent.subtitle}</p>
        </motion.div>

        <motion.div
          className="awards-image"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <img src={content.image || defaultContent.image} alt={content.imageAlt || defaultContent.imageAlt} loading="lazy" />
        </motion.div>
      </div>
    </section>
  )
}