import { motion } from 'framer-motion'
import { useHomepage } from '../../hooks/useCmsData'
import './Stats.css'

const defaultContent = {
  stat1: { number: '50+', label: 'Agro-waste repurposed annually', image: '/images/50.png' },
  stat2: { number: '10%', label: 'Profit reaches farmers', image: null },
  stat3: { number: '350+', label: 'Rural women employed', image: null },
}

export default function StatisticsSection() {
  const { data: homepage } = useHomepage()
  const stats = homepage?.statistics || defaultContent

  return (
    <section className="stats section">
      <div className="container stats-inner">
        <motion.div
          className="stats-left"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <div className="stats-graphic">
            {stats.stat1?.image && <img src={stats.stat1.image} alt={stats.stat1.number} loading="lazy" />}
          </div>
          <p className="stats-label">{stats.stat1?.label || defaultContent.stat1.label}</p>
        </motion.div>

        <motion.div
          className="stats-right"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <div className="stats-item">
            <span className="stats-number">{stats.stat2?.number || defaultContent.stat2.number}</span>
            <span className="stats-desc">{stats.stat2?.label || defaultContent.stat2.label}</span>
          </div>
          <div className="stats-item">
            <span className="stats-number">{stats.stat3?.number || defaultContent.stat3.number}</span>
            <span className="stats-desc">{stats.stat3?.label || defaultContent.stat3.label}</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}