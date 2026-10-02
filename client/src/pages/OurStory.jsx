import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { publicApi } from '../utils/publicApi'
import './OurStory.css'

const defaultSections = [
  { title: "The nature's gift", body: "The banana plant is considered nature's gift. From the fruit we eat to the flowers and stems cooked in traditional dishes, green leaves used serve food, almost every inch of the plant serves a purpose, except for the other sheaths of the stem. Despite the plant's utility, the outermost layers remained as a burden on farmers and our environment .", image: "/images/tree.png", layout: "image-left" },
  { title: "A waste or a wealth?", body: "India is a large producer of bananas resulting in large quantities of wastage. On many farms, these sheaths were seen as useless, lacking a purpose, they were either left to rot in heaps or, more commonly, burnt. This practice turned a potential resource into ash and smoke, creating a cycle of waste.", image: "/images/fire.png", layout: "image-right" },
  { title: "The spark that made a difference", body: "The turning point came nearly two decades ago in the village of Melakkal. Mr. Murugesan, a humble farmer from the village along with his wife Mrs. Makaradi and village elders started seeking a solution to utilizing the waste. He saw the waste a raw material and perhaps they could be woven into something much stronger.", image: "/images/speak.png", layout: "image-left" },
  { title: "The struggles of hands", body: "In the beginning, Murugesan attempted to weave the fibers manually, but that was not easy. The ropes would split, lose their grip, and fail to stay connected. Without the right tension or technique, creating a durable product by hand seemed nearly impossible.", image: "/images/tie.png", layout: "image-right" },
  { title: "An innovation that transformed", body: "That led him to his first breakthrough, a spinning machine built from bicycle wheel rims and pulleys. This \"trial-and-error\" invention allowed him to braid strands together to achieve high tensile strength. But this method required hard labour but only produced small quantities. Not satisfied with that, he eventually developed and patent an automated rope-making machine. This machine performed a dual functions, simultaneously spinning the rope and braiding it for maximum durability.", image: "/images/wheel.png", layout: "image-left" },
  { title: "The result of hard work", body: "Today, OM banana crafts is a beacon of rural success. What started as a struggle has scaled into a thriving company employing over 400 people, primarily women from his local village. By turning discarded sheaths into bags, mats, and high-quality ropes, Mr. Murugesan didn't just solve a waste problem he built a patented industry that provides dignity and a livelihood to hundreds.", image: "/images/old woman.png", layout: "image-right" },
]

export default function OurStory() {
  const [sections, setSections] = useState(defaultSections)
  const [loading, setLoading] = useState(true)
  const [impactStats, setImpactStats] = useState(null)

  useEffect(() => {
    Promise.all([
      publicApi.story(),
      publicApi.settings().then(s => s.homepage?.statistics)
    ]).then(([storyData, stats]) => {
      if (storyData?.length) {
        setSections(storyData.map(s => ({
          title: s.title,
          body: s.body,
          image: s.image,
          layout: s.layout,
          imageAlt: s.imageAlt,
        })))
      }
      if (stats) setImpactStats(stats)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const stats = impactStats || {
    stat1: { number: '50+', label: 'Agro-waste repurposed annually', image: '/images/50.png' },
    stat2: { number: '10%', label: 'Profit reaches farmers' },
    stat3: { number: '350+', label: 'Rural women employed' },
  }

  return (
    <div className="our-story-page">
      {/* Intro */}
      <section className="our-journey-intro">
        <div className="container">
          <h1 className="our-journey-title">Our Journey</h1>
          <p className="our-journey-subtitle">A path of struggles and success</p>
        </div>
      </section>

      {sections.map((section, index) => (
        <section key={index} className="story-section">
          <div className="container story-grid">
            {section.layout === 'image-left' ? (
              <>
                <div className="story-image">
                  <img src={section.image} alt={section.imageAlt || section.title} loading="lazy" />
                </div>
                <div className="story-text">
                  <h2 className="story-heading">{section.title}</h2>
                  <p className="story-body">{section.body}</p>
                </div>
              </>
            ) : (
              <>
                <div className="story-text">
                  <h2 className="story-heading">{section.title}</h2>
                  <p className="story-body">{section.body}</p>
                </div>
                <div className="story-image">
                  <img src={section.image} alt={section.imageAlt || section.title} loading="lazy" />
                </div>
              </>
            )}
          </div>
        </section>
      ))}

      {/* Impact / Statistics */}
      <section className="impact-stats">
        <div className="container impact-stats-inner">
          <div className="impact-left">
            {stats.stat1?.image && (
              <img
                src={stats.stat1.image}
                alt={stats.stat1.number}
                className="impact-50-img"
                loading="lazy"
              />
            )}
            <p className="impact-50-caption">{stats.stat1?.label || 'Agro-waste repurposed annually'}</p>
          </div>
          <div className="impact-right">
            <div className="impact-item">
              <span className="impact-number">{stats.stat2?.number || '10%'}</span>
              <span className="impact-label">{stats.stat2?.label || 'Profit reaches<br />farmers'}</span>
            </div>
            <div className="impact-item">
              <span className="impact-number">{stats.stat3?.number || '350+'}</span>
              <span className="impact-label">{stats.stat3?.label || 'Rural women<br />employed'}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}