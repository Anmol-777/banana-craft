import { motion } from 'framer-motion'
import { useHomepage } from '../../hooks/useCmsData'
import './Innovations.css'

const defaultContent = {
  heading: 'Innovations',
  body: 'Our core innovation lies in the mechanical mastery of natural fiber extraction. Driven by the vision of turning &ldquo;waste to wealth,&rdquo; our founder Mr.&nbsp;Murugesan has developed specialized machines designed to efficiently process discarded banana stems into high-quality, durable fiber.',
  buttonText: 'Know More',
  buttonLink: '/innovations',
  image: '/images/machine.png',
  imageAlt: 'Innovation machine',
}

export default function InnovationsSection() {
  const { data: homepage } = useHomepage()
  const content = homepage?.innovations || defaultContent

  return (
    <section className="innovations section">
      <div className="container innovations-inner">
        <motion.div
          className="innovations-image"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <img src={content.image || defaultContent.image} alt={content.imageAlt || defaultContent.imageAlt} loading="lazy" />
        </motion.div>

        <motion.div
          className="innovations-text"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
        >
          <h2 className="innovations-title">{content.heading || defaultContent.heading}</h2>
          <p className="innovations-paragraph" dangerouslySetInnerHTML={{ __html: content.body || defaultContent.body }} />
          {content.buttonText && (
            <a href={content.buttonLink || defaultContent.buttonLink} className="btn-mustard" style={{textDecoration:'none'}}>
              {content.buttonText}
            </a>
          )}
        </motion.div>
      </div>
    </section>
  )
}