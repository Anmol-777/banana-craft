import { Link } from 'react-router-dom'
import { useSettings } from '../../hooks/useCmsData'
import './Footer.css'

export default function Footer() {
  const { data: settings } = useSettings()

  const navItems = settings?.nav?.length
    ? settings.nav.filter(n => n.visible !== false).sort((a, b) => (a.order || 0) - (b.order || 0))
    : [
        { path: '/', label: 'Home' },
        { path: '/products', label: 'Products' },
        { path: '/our-story', label: 'Our Story' },
        { path: '/innovations', label: 'Innovations' },
        { path: '/contact', label: 'Contact us' },
      ]

  const contact = settings?.contact || {}
  const footer = settings?.footer || {}
  const address = contact?.address || {}

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-col">
          <h4 className="footer-brand">{settings?.brandName || 'Om Banana Crafts'}</h4>
          <p className="footer-desc">
            {footer.description || 'Transforming agro-waste into timeless handcrafted pieces for a sustainable future.'}
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Navigation</h4>
          <ul className="footer-links">
            {navItems.map((item) => (
              <li key={item.path}><Link to={item.path}>{item.label}</Link></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Contact us</h4>
          <ul className="footer-contact">
            <li>Phone: {contact.phone || '+91 93605 97884'}</li>
            <li>E mail : {contact.email || 'bananafibermdu@gmail.com'}</li>
            <li>
              Address: {address.line1 || '3/43, Melakkal,'}<br />
              {address.city || 'Madurai'},{address.state || 'Tamil nadu'} {address.postalCode || ''}
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}