import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { publicApi } from '../utils/publicApi'
import './Innovations.css'

const defaultMachines = [
  { id: 'power', image: '/images/power rope machine.png', alt: 'Power rope machine', title: 'Power rope machine', body: 'The machine produces 3,000 meters of rope per 8-hour shift, maintaining a consistent output. It supports adjustable diameter rangeing from 2mm to 5mm banana fiber ropes.' },
  { id: 'cutting', image: '/images/cutting.png', alt: 'Cutting machine', title: 'Cutting machine', body: 'The machine supports in cutting banana fiber sheaths into smaller strips which help in effective crafting of basket braiding.' },
  { id: 'twist', image: '/images/twist.png', alt: 'Double twist rope machine', title: 'Double twist rope\nmachine', body: 'The automated machine produces about 5000 to 6000 meters double twisted rope per 8 hr shift.' },
  { id: 'single', image: '/images/single.png', alt: 'Single rope machine', title: 'Single rope machine', body: 'The automated machine produces about 5000 to 6000 meters single twisted rope per 8 hr shift.' },
  { id: 'fiber', image: '/images/fiber.png', alt: 'Fiber extraction machine', title: 'Fiber extraction\nmachine', body: 'The machine is employed to extract banana fiber. An 8hr shift yields about 4 to 5 Kg of fiber utilizing agriculture waste from over 100 banana trees.' },
]

const defaultGallery = [
  '/images/1.png',
  '/images/2.png',
  '/images/3.png',
  '/images/4.png',
  '/images/5.png',
]

export default function Innovations() {
  const [machines, setMachines] = useState(defaultMachines)
  const [gallery, setGallery] = useState(defaultGallery)
  const [hero, setHero] = useState({
    title: 'Ideas in Motion.',
    subtitle: 'Specialized machines innovations made to efficiently process discarded banana stems into high-quality, durable fiber.',
    image: '/images/page 4 man.png',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      publicApi.innovations(),
      publicApi.gallery(),
      publicApi.settings().then(s => s.homepage?.innovations)
    ]).then(([innovationsData, galleryData, heroData]) => {
      if (innovationsData?.length) {
        setMachines(innovationsData.map(m => ({
          id: m._id,
          image: m.image,
          alt: m.imageAlt || m.name,
          title: m.name,
          body: m.body,
        })))
      }
      if (galleryData?.length) {
        setGallery(galleryData.map((g, i) => g.image).filter(Boolean))
      }
      if (heroData) {
        setHero({
          title: heroData.heading || hero.title,
          subtitle: heroData.body || hero.subtitle,
          image: heroData.image || hero.image,
        })
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div style={{padding:'48px',textAlign:'center'}}><div className="animate-spin" style={{width:40,height:40,border:'3px solid var(--admin-border)',borderTopColor:'var(--admin-primary)',borderRadius:'50%',margin:'0 auto'}} /></div>
  }

  return (
    <div className="innovations-page">
      {/* HERO */}
      <section className="innovations-hero">
        <div className="container">
          <div className="innovations-hero-card">
            <div className="innovations-hero-left">
              <h1 className="innovations-hero-title">{hero.title}</h1>
              <p className="innovations-hero-subtitle">{hero.subtitle}</p>
            </div>
            <div className="innovations-hero-right">
              <img src={hero.image} alt="Man operating machine" loading="eager" />
            </div>
          </div>
        </div>
      </section>

      {/* MACHINE SECTIONS */}
      {machines.map((m) => (
        <section key={m.id} className="machine-section">
          <div className="container machine-row">
            <div className="machine-image">
              <img src={m.image} alt={m.alt} loading="lazy" />
            </div>
            <div className="machine-panel">
              <h2 className="machine-title">
                {m.title.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < m.title.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </h2>
              <p className="machine-body">{m.body}</p>
            </div>
          </div>
        </section>
      ))}

      {/* GALLERY */}
      {gallery.length > 0 && (
        <section className="gallery-section">
          <div className="container">
            <h2 className="gallery-title">Gallery</h2>
            <div className="gallery-grid">
              <div className="gallery-large">
                <img src={gallery[0]} alt="Gallery 1" loading="lazy" />
              </div>
              <div className="gallery-right">
                {gallery.slice(1).map((img, i) => (
                  <img key={i} src={img} alt={`Gallery ${i + 2}`} loading="lazy" />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}