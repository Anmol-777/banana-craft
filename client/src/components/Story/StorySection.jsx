import { motion } from 'framer-motion'
import { useHomepage } from '../../hooks/useCmsData'
import './Story.css'

const defaultContent = {
  heading: 'Our Story',
  body: 'At Om Banana Crafts, we transform agricultural waste into exquisite handmade products. What began as a vision to reduce farm waste has grown into a movement that empowers rural artisans and brings sustainable craftsmanship to your home. Every piece tells a story of renewal, skill, and a deep respect for nature.',
  buttonText: 'Know our full story',
  buttonLink: '/our-story',
  image: '/images/man.png',
  imageAlt: 'Founder',
}

export default function StorySection() {
  const { data: homepage } = useHomepage()
  const content = homepage?.story || defaultContent

  return (
    <section className="story section">
      <div className="container story-inner">
        <motion.div
          className="story-text"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <h2 className="story-title">{content.heading || defaultContent.heading}</h2>
          <p className="story-paragraph">{content.body || defaultContent.body}</p>
          {content.buttonText && (
            <a href={content.buttonLink || defaultContent.buttonLink} className="btn-mustard" style={{textDecoration:'none',display:'inline-block'}}>
              {content.buttonText}
            </a>
          )}
        </motion.div>

        <motion.div
          className="story-image"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
        >
          <img src={content.image || defaultContent.image} alt={content.imageAlt || defaultContent.imageAlt} loading="lazy" />
        </motion.div>
      </div>
    </section>
  )
}