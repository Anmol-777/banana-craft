import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useToast } from '../hooks/useToast';
import MediaSelector from '../components/MediaSelector';

export default function ContactEditor() {
  const { success, error } = useToast();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.settings.get();
      setSettings(res.data || {});
    } catch (err) {
      error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => {
      if (!prev) return prev;
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else if (keys.length === 2) {
        return { ...prev, [keys[0]]: { ...prev[keys[0]], [keys[1]]: value } };
      } else if (keys.length === 3) {
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            [keys[1]]: { ...prev[keys[0]][keys[1]], [keys[2]]: value }
          }
        };
      }
      return prev;
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await api.settings.update(settings);
      success('Contact settings saved');
    } catch (err) {
      error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{padding:'48px',textAlign:'center'}}><div className="animate-spin" style={{width:40,height:40,border:'3px solid var(--admin-border)',borderTopColor:'var(--admin-primary)',borderRadius:'50%',margin:'0 auto'}} /></div>;
  }

  const contact = settings?.contact || {};
  const address = contact?.address || {};

  return (
    <div>
      <div className="admin-section-header">
        <h1 className="admin-section-title">Contact Page</h1>
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="admin-grid admin-grid-2">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Page Content</h2>
          </div>
          <div className="admin-card-body">
            <div className="admin-form-group">
              <label htmlFor="contact-heading" className="admin-form-label">Page Heading</label>
              <input
                type="text"
                id="contact-heading"
                className="admin-form-input"
                value={settings?.contactPageHeading || 'Extend an Enquiry'}
                onChange={(e) => handleChange('contactPageHeading', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="contact-subtitle" className="admin-form-label">Subtitle</label>
              <textarea
                id="contact-subtitle"
                className="admin-form-textarea"
                value={settings?.contactPageSubtitle || 'We serve both B2B and B2C clients globally,\nReach out to place orders'}
                onChange={(e) => handleChange('contactPageSubtitle', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Contact Details</h2>
          </div>
          <div className="admin-card-body">
            <div className="admin-form-group">
              <label htmlFor="contact-phone" className="admin-form-label">Phone Number</label>
              <input
                type="tel"
                id="contact-phone"
                className="admin-form-input"
                value={contact.phone || '+91 93605 97884'}
                onChange={(e) => handleChange('contact.phone', e.target.value)}
                placeholder="+91 93605 97884"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="contact-whatsapp" className="admin-form-label">WhatsApp Number</label>
              <input
                type="tel"
                id="contact-whatsapp"
                className="admin-form-input"
                value={contact.whatsapp || '+91 93605 97884'}
                onChange={(e) => handleChange('contact.whatsapp', e.target.value)}
                placeholder="+91 93605 97884"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="contact-email" className="admin-form-label">Email</label>
              <input
                type="email"
                id="contact-email"
                className="admin-form-input"
                value={contact.email || 'bananafibermdu@gmail.com'}
                onChange={(e) => handleChange('contact.email', e.target.value)}
                placeholder="bananafibermdu@gmail.com"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Map Image</label>
              <MediaSelector
                value={contact.mapImage || '/images/map.png'}
                onChange={(url) => handleChange('contact.mapImage', url)}
                previewAlt={contact.mapAlt || 'Map location'}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="contact-map-alt" className="admin-form-label">Map Alt Text</label>
              <input
                type="text"
                id="contact-map-alt"
                className="admin-form-input"
                value={contact.mapAlt || 'Map showing Om Banana Crafts in Melakkal, Madurai'}
                onChange={(e) => handleChange('contact.mapAlt', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="contact-hours" className="admin-form-label">Working Hours (optional)</label>
              <input
                type="text"
                id="contact-hours"
                className="admin-form-input"
                value={contact.workingHours || ''}
                onChange={(e) => handleChange('contact.workingHours', e.target.value)}
                placeholder="Mon-Fri 9:00-18:00"
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Address</h2>
          </div>
          <div className="admin-card-body">
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label htmlFor="addr-line1" className="admin-form-label">Address Line 1</label>
                <input
                  type="text"
                  id="addr-line1"
                  className="admin-form-input"
                  value={address.line1 || '3/43, Melakkal'}
                  onChange={(e) => handleChange('contact.address.line1', e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="addr-line2" className="admin-form-label">Address Line 2</label>
                <input
                  type="text"
                  id="addr-line2"
                  className="admin-form-input"
                  value={address.line2 || ''}
                  onChange={(e) => handleChange('contact.address.line2', e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label htmlFor="addr-city" className="admin-form-label">City</label>
                <input
                  type="text"
                  id="addr-city"
                  className="admin-form-input"
                  value={address.city || 'Madurai'}
                  onChange={(e) => handleChange('contact.address.city', e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="addr-state" className="admin-form-label">State</label>
                <input
                  type="text"
                  id="addr-state"
                  className="admin-form-input"
                  value={address.state || 'Tamil Nadu'}
                  onChange={(e) => handleChange('contact.address.state', e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label htmlFor="addr-country" className="admin-form-label">Country</label>
                <input
                  type="text"
                  id="addr-country"
                  className="admin-form-input"
                  value={address.country || 'India'}
                  onChange={(e) => handleChange('contact.address.country', e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="addr-postal" className="admin-form-label">Postal Code</label>
                <input
                  type="text"
                  id="addr-postal"
                  className="admin-form-input"
                  value={address.postalCode || '625234'}
                  onChange={(e) => handleChange('contact.address.postalCode', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}