import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useToast } from '../hooks/useToast';

export default function FooterEditor() {
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
      if (keys.length === 1) return { ...prev, [field]: value };
      if (keys.length === 2) return { ...prev, [keys[0]]: { ...prev[keys[0]], [keys[1]]: value } };
      if (keys.length === 3) return { ...prev, [keys[0]]: { ...prev[keys[0]], [keys[1]]: { ...prev[keys[0]][keys[1]], [keys[2]]: value } } };
      return prev;
    });
  };

  const handleNavChange = (index, field, value) => {
    setSettings(prev => {
      if (!prev?.nav) return prev;
      const nav = [...prev.nav];
      nav[index] = { ...nav[index], [field]: value };
      return { ...prev, nav };
    });
  };

  const addNavItem = () => {
    setSettings(prev => ({
      ...prev,
      nav: [...(prev.nav || []), { label: '', path: '/', order: (prev.nav || []).length + 1, visible: true }],
    }));
  };

  const removeNavItem = (index) => {
    setSettings(prev => ({
      ...prev,
      nav: prev.nav.filter((_, i) => i !== index),
    }));
  };

  const moveNavItem = (from, to) => {
    setSettings(prev => {
      const nav = [...prev.nav];
      const [item] = nav.splice(from, 1);
      nav.splice(to, 0, item);
      return { ...prev, nav: nav.map((n, i) => ({ ...n, order: i + 1 })) };
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await api.settings.update(settings);
      success('Footer settings saved');
    } catch (err) {
      error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{padding:'48px',textAlign:'center'}}><div className="animate-spin" style={{width:40,height:40,border:'3px solid var(--admin-border)',borderTopColor:'var(--admin-primary)',borderRadius:'50%',margin:'0 auto'}} /></div>;
  }

  const footer = settings?.footer || {};
  const nav = settings?.nav || [];

  return (
    <div>
      <div className="admin-section-header">
        <h1 className="admin-section-title">Footer & Navigation</h1>
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="admin-grid admin-grid-2">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Footer Content</h2>
          </div>
          <div className="admin-card-body">
            <div className="admin-form-group">
              <label htmlFor="footer-brand" className="admin-form-label">Brand Name</label>
              <input
                type="text"
                id="footer-brand"
                className="admin-form-input"
                value={settings?.brandName || 'Om Banana Crafts'}
                onChange={(e) => handleChange('brandName', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="footer-logo" className="admin-form-label">Logo URL</label>
              <input
                type="text"
                id="footer-logo"
                className="admin-form-input"
                value={settings?.logo || '/images/logo.jpg'}
                onChange={(e) => handleChange('logo', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="footer-logo-alt" className="admin-form-label">Logo Alt Text</label>
              <input
                type="text"
                id="footer-logo-alt"
                className="admin-form-input"
                value={settings?.logoAlt || 'Om Banana Crafts'}
                onChange={(e) => handleChange('logoAlt', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="footer-tagline" className="admin-form-label">Tagline</label>
              <input
                type="text"
                id="footer-tagline"
                className="admin-form-input"
                value={settings?.tagline || ''}
                onChange={(e) => handleChange('tagline', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="footer-desc" className="admin-form-label">Footer Description</label>
              <textarea
                id="footer-desc"
                className="admin-form-textarea"
                value={footer.description || 'Transforming agro-waste into timeless handcrafted pieces for a sustainable future.'}
                onChange={(e) => handleChange('footer.description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="footer-copyright" className="admin-form-label">Copyright Text</label>
              <input
                type="text"
                id="footer-copyright"
                className="admin-form-input"
                value={footer.copyright || 'Om Banana Crafts'}
                onChange={(e) => handleChange('footer.copyright', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  className="admin-checkbox"
                  checked={footer.showSocial !== false}
                  onChange={(e) => handleChange('footer.showSocial', e.target.checked)}
                />
                Show Social Links
              </label>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Navigation Menu</h2>
          </div>
          <div className="admin-card-body">
            <p className="admin-form-help">This controls both header and footer navigation</p>

            {nav.map((item, index) => (
              <div key={index} className="admin-card" style={{marginBottom:'16px'}}>
                <div className="admin-card-header">
                  <h4 className="admin-card-title">Menu Item #{index + 1}</h4>
                  <div className="admin-table-actions">
                    <button type="button" className="admin-icon-btn" onClick={() => index > 0 && moveNavItem(index, index - 1)} disabled={index === 0} title="Move Up">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
                    </button>
                    <button type="button" className="admin-icon-btn" onClick={() => index < nav.length - 1 && moveNavItem(index, index + 1)} disabled={index === nav.length - 1} title="Move Down">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                    </button>
                    <button type="button" className="admin-icon-btn delete" onClick={() => removeNavItem(index)} title="Delete">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </button>
                  </div>
                </div>
                <div className="admin-card-body">
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Label</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={item.label}
                        onChange={(e) => handleNavChange(index, 'label', e.target.value)}
                        placeholder="Home"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Path</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={item.path}
                        onChange={(e) => handleNavChange(index, 'path', e.target.value)}
                        placeholder="/"
                      />
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Order</label>
                      <input
                        type="number"
                        className="admin-form-input"
                        value={item.order}
                        onChange={(e) => handleNavChange(index, 'order', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-checkbox-label">
                        <input
                          type="checkbox"
                          className="admin-checkbox"
                          checked={item.visible !== false}
                          onChange={(e) => handleNavChange(index, 'visible', e.target.checked)}
                        />
                        Visible
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button type="button" className="admin-btn admin-btn-secondary" onClick={addNavItem} style={{marginTop:'12px'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'6px'}}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Menu Item
            </button>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Social Links</h2>
          </div>
          <div className="admin-card-body">
            <p className="admin-form-help">Social media links shown in footer (when enabled)</p>

            <div className="admin-form-group">
              <label className="admin-form-label">Platform</label>
              <select
                className="admin-form-select"
                value={settings?.social?.[0]?.platform || 'instagram'}
                onChange={(e) => handleChange('social.0.platform', e.target.value)}
              >
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="twitter">Twitter/X</option>
                <option value="linkedin">LinkedIn</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Label</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={settings?.social?.[0]?.label || 'Instagram'}
                  onChange={(e) => handleChange('social.0.label', e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">URL</label>
                <input
                  type="url"
                  className="admin-form-input"
                  value={settings?.social?.[0]?.url || ''}
                  onChange={(e) => handleChange('social.0.url', e.target.value)}
                  placeholder="https://instagram.com/yourprofile"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">SEO Settings</h2>
          </div>
          <div className="admin-card-body">
            <div className="admin-form-group">
              <label htmlFor="seo-title" className="admin-form-label">Site Title</label>
              <input
                type="text"
                id="seo-title"
                className="admin-form-input"
                value={settings?.seo?.title || ''}
                onChange={(e) => handleChange('seo.title', e.target.value)}
                placeholder="Om Banana Crafts - Sustainable Handcrafted Products"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="seo-desc" className="admin-form-label">Meta Description</label>
              <textarea
                id="seo-desc"
                className="admin-form-textarea"
                value={settings?.seo?.description || ''}
                onChange={(e) => handleChange('seo.description', e.target.value)}
                rows={2}
                placeholder="Transforming agro-waste into timeless handcrafted pieces..."
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="seo-keywords" className="admin-form-label">Keywords (comma separated)</label>
              <input
                type="text"
                id="seo-keywords"
                className="admin-form-input"
                value={settings?.seo?.keywords?.join(', ') || ''}
                onChange={(e) => handleChange('seo.keywords', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))}
                placeholder="banana fiber, sustainable crafts, eco-friendly products"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="seo-og-image" className="admin-form-label">Open Graph Image</label>
              <input
                type="url"
                id="seo-og-image"
                className="admin-form-input"
                value={settings?.seo?.ogImage || ''}
                onChange={(e) => handleChange('seo.ogImage', e.target.value)}
                placeholder="https://example.com/og-image.jpg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}