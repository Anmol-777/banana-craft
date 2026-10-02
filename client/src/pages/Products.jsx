import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ProductCard from '../components/ProductCard/ProductCard'
import { publicApi } from '../utils/publicApi'
import './Products.css'

const defaultProducts = [
  { image: '/images/sphere.png', title: 'Sphere lamp shade' },
  { image: '/images/mini.png', title: 'Mini storage box' },
  { image: '/images/bottle shade.png', title: 'Bottle lamp shade' },
  { image: '/images/hand.png', title: 'Hand basket' },
  { image: '/images/storage.png', title: 'Storage box' },
  { image: '/images/pencil.png', title: 'Pencil stand' },
  { image: '/images/pooja.png', title: 'Square pooja basket' },
  { image: '/images/laundry.png', title: 'Laundry basket' },
  { image: '/images/woven plant.png', title: 'Woven plant pot' },
  { image: '/images/ribbon.png', title: 'Ribbon fruit tray' },
  { image: '/images/crochet.png', title: 'Crochet basket' },
  { image: '/images/sphere.png', title: 'Sphere lamp shade' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: 'easeOut' },
  }),
}

export default function Products() {
  const [products, setProducts] = useState(defaultProducts)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    publicApi.products().then(data => {
      if (data?.length) {
        setProducts(data.map(p => ({
          image: p.images?.[0]?.url || '/images/sphere.png',
          title: p.name,
          _id: p._id,
        })))
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <>
      <section className="products-hero section">
        <div className="container">
          <div className="products-hero-card">
            <div className="hero-left">
              <h1 className="hero-title">
                Handcrafted<br />with purpose
              </h1>
              <p className="hero-subtitle">A waste to wealth initiative</p>
            </div>
            <div className="hero-right">
              <img src="/images/prod main.png" alt="Handcrafted products" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="products-grid section">
        <div className="container">
          <div className="grid-inner">
            {products.map((product, i) => (
              <motion.div
                key={product._id || i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
              >
                <ProductCard image={product.image} title={product.title} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="products-support section">
        <div className="container">
          <h2 className="support-title">Your purchase supports</h2>
          <div className="support-icons">
            <div className="support-item">
              <div className="support-icon-box">
                <img src="/images/eco.png" alt="Eco-friendly" loading="lazy" />
              </div>
              <span>Eco-friendly</span>
            </div>
            <div className="support-item">
              <div className="support-icon-box">
                <img src="/images/crafted.png" alt="Handcrafted" loading="lazy" />
              </div>
              <span>Handcrafted</span>
            </div>
            <div className="support-item">
              <div className="support-icon-box">
                <img src="/images/community.png" alt="Community Empowerment" loading="lazy" />
              </div>
              <span>Community Empowerment</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}