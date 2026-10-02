import React, { useCallback } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useSettings } from '../../hooks/useCmsData'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = React.useState(false)
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

  const toggleMenu = useCallback(() => setMenuOpen(prev => !prev), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <img src={settings?.logo || '/images/logo.jpg'} alt={settings?.logoAlt || 'Om Banana Crafts'} loading="lazy" />
        </Link>

        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <ul className={`nav-links ${menuOpen ? 'mobile-open' : ''}`}>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
                end={item.path === '/'}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}