import { motion } from 'framer-motion'
import ProductCard from '../ProductCard/ProductCard'
import { useHomepage } from '../../hooks/useCmsData'
import './Collection.css'

const defaultContent = {
  heading: 'The Collection',
  subtitle: 'Thoughtfully crafted pieces made from upcycled agro-waste, designed to bring warmth and purpose to your space.',
  products: [
    { title: 'Elliptical Planter', description: 'Handcrafted from banana fiber with a sleek elliptical silhouette.', image: '/images/elliptical.jpg' },
    { title: 'Square Basket', description: 'Premium woven square basket for storage and decor.', image: '/images/square.jpg' },
    { title: 'Bottle Vase', description: 'Elegant bottle-shaped vase for fresh or dried arrangements.', image: '/images/bottle.jpg' },
    { title: 'Woven Tray', description: 'Versatile handwoven tray, perfect for serving and display.', image: '/images/woven.jpg' },
  ],
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' },
  }),
}

export default function CollectionSection() {
  const { data: homepage } = useHomepage()
  const content = homepage?.collectionSection || defaultContent

  return (
    <section className="collection section">
      <div className="container">
        <motion.div
          className="collection-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="collection-title">{content.heading || defaultContent.heading}</h2>
          <p className="collection-subtitle">{content.subtitle || defaultContent.subtitle}</p>
        </motion.div>

        <div className="collection-grid">
          {(content.products || defaultContent.products).map((product, i) => (
            <motion.div
              key={product.title || i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
            >
              <ProductCard
                image={product.image}
                title={product.title}
                description={product.description}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="collection-cta"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <img src="/images/all products.jpg" alt="All Products" loading="lazy" className="btn-all-products" />
        </motion.div>
      </div>
    </section>
  )
}