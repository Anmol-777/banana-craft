import { useState, useEffect } from 'react'
import { publicApi } from '../utils/publicApi'
import './Contact.css'

function PhoneIcon() {
  return (
    <svg className="contact-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7.2 3.5 9.4 3a1.5 1.5 0 0 1 1.8.8l1.2 2.7a1.5 1.5 0 0 1-.4 1.7L10.6 9.5a13.5 13.5 0 0 0 3.9 3.9l1.3-1.4a1.5 1.5 0 0 1 1.7-.4l2.7 1.2a1.5 1.5 0 0 1 .8 1.8l-.5 2.2a2.2 2.2 0 0 1-2.3 1.8C10.6 18.1 5.9 13.4 5.4 5.8a2.2 2.2 0 0 1 1.8-2.3Z" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg className="contact-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19.8 11.4a7.7 7.7 0 0 1-11.2 6.9L4.2 19.8l1.5-4.2a7.7 7.7 0 1 1 14.1-4.2Z" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.6 8.3c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.5.6c-.2.2-.2.4-.1.6.5.8 1.2 1.4c.5.5 1 .8 1.5.9.2.1.4 0 .6-.2l.7-.8c.2-.2.4-.2.6-.1l1.5.7c.3.1.4.3.4.5 0 .6-.4 1.1-.8 1.3-.4.3-1 .4-1.6.2-1.2-.3-2.4-1-3.3-1.9-1-1-1.6-2.1-1.8-3.2-.1-.6 0-1.1.5-1.3Z" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg className="contact-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.2" y="5.2" width="17.6" height="13.6" rx="2" stroke="currentColor" strokeWidth="1.65" />
      <path d="m4.2 7 7.8 6 7.8-6" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg className="contact-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19.2 10.1c0 4.8-7.2 10.2-7.2 10.2S4.8 14.9 4.8 10.1a7.2 7.2 0 1 1 14.4 0Z" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10.1" r="2.4" stroke="currentColor" strokeWidth="1.65" />
    </svg>
  )
}

const iconComponents = {
  phone: PhoneIcon,
  whatsapp: WhatsAppIcon,
  email: EmailIcon,
  location: LocationIcon,
}

const defaultContact = {
  heading: 'Extend an Enquiry',
  subtitle: 'We serve both B2B and B2C clients globally,\nReach out to place orders',
  details: [
    { id: 'phone', icon: 'phone', value: <a href="tel:+919360597884">+91 93605 97884</a> },
    { id: 'whatsapp', icon: 'whatsapp', value: <a href="https://wa.me/919360597884">+91 93605 97884</a> },
    { id: 'email', icon: 'email', value: <a href="mailto:bananafibermdu@gmail.com">bananafibermdu@gmail.com</a> },
    { id: 'address', icon: 'location', value: <><span>3/43, Melakkal, Madurai</span><br /><span>Tamil Nadu 625234</span></> },
  ],
  mapImage: '/images/map.png',
  mapAlt: 'Map showing Om Banana Crafts in Melakkal, Madurai',
}

export default function Contact() {
  const [contact, setContact] = useState(defaultContact)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    publicApi.contact().then(data => {
      if (data) {
        setContact({
          heading: data.contactPageHeading || defaultContact.heading,
          subtitle: data.contactPageSubtitle || defaultContact.subtitle,
          details: [
            { id: 'phone', icon: 'phone', value: <a href={`tel:${data.phone || '+919360597884'}`}>{data.phone || '+91 93605 97884'}</a> },
            { id: 'whatsapp', icon: 'whatsapp', value: <a href={`https://wa.me/${(data.whatsapp || '+919360597884').replace(/\D/g, '')}`}>{data.whatsapp || '+91 93605 97884'}</a> },
            { id: 'email', icon: 'email', value: <a href={`mailto:${data.email || 'bananafibermdu@gmail.com'}`}>{data.email || 'bananafibermdu@gmail.com'}</a> },
            { id: 'address', icon: 'location', value: <><span>{data.address?.line1 || '3/43, Melakkal, Madurai'}</span><br /><span>{data.address?.city || 'Madurai'}, {data.address?.state || 'Tamil Nadu'} {data.address?.postalCode || '625234'}</span></> },
          ],
          mapImage: data.mapImage || defaultContact.mapImage,
          mapAlt: data.mapAlt || defaultContact.mapAlt,
        })
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div style={{padding:'48px',textAlign:'center'}}><div className="animate-spin" style={{width:40,height:40,border:'3px solid var(--admin-border)',borderTopColor:'var(--admin-primary)',borderRadius:'50%',margin:'0 auto'}} /></div>
  }

  return (
    <div className="contact-page">
      <section className="contact-section" aria-labelledby="contact-title">
        <div className="container contact-grid">
          <div className="contact-details">
            <h1 id="contact-title" className="contact-heading">{contact.heading}</h1>
            <p className="contact-subtitle">{contact.subtitle}</p>

            <div className="contact-list">
              {contact.details.map((detail) => {
                const Icon = iconComponents[detail.icon]
                return (
                  <div className="contact-row" key={detail.id}>
                    <span className="contact-icon-box">
                      <Icon />
                    </span>
                    <div className="contact-value">{detail.value}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="contact-map-wrap">
            <img
              className="contact-map"
              src={contact.mapImage}
              alt={contact.mapAlt}
            />
          </div>
        </div>
      </section>
    </div>
  )
}