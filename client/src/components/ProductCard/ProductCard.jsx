import { memo } from 'react'
import { motion } from 'framer-motion'
import './ProductCard.css'

function ProductCard({ image, title, description }) {
  return (
    <motion.article
      className="product-card"
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="product-card-image">
        <motion.img
          src={image}
          alt={title}
          loading="lazy"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <div className="product-card-body">
        <h3 className="product-card-title">{title}</h3>
        {description && <p className="product-card-desc">{description}</p>}
      </div>
    </motion.article>
  )
}

export default memo(ProductCard)
