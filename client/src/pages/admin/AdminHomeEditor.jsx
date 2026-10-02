import { useEffect, useState } from 'react';
import { pageContentApi, mediaApi } from '../../api/adminApi';
import toast from 'react-hot-toast';
import './AdminHomeEditor.css';

export default function AdminHomeEditor() {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  useEffect(() => {
    loadContent();
    loadMedia();
  }, []);

  const loadContent = async () => {
    try {
      const res = await pageContentApi.list({ page: 'home' });
      const data = res.data.data;
      const contentMap = {};
      data.forEach(item => {
        contentMap[item.section] = item;
      });
      setContent(contentMap);
    } catch (err) {
      toast.error('Failed to load homepage content');
    } finally {
      setLoading(false);
    }
  };

  const loadMedia = async () => {
    setMediaLoading(true);
    try {
      const res = await mediaApi.list({ limit: 100 });
      setMediaFiles(res.data.data || []);
    } catch (err) {
      console.error('Failed to load media', err);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    setContent(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleImageChange = (section, field, url) => {
    handleChange(section, field, url);
  };

  const handleSave = async (section) => {
    const sectionData = content[section];
    if (!sectionData) return;

    setSaving(true);
    try {
      if (sectionData.key) {
        await pageContentApi.update(sectionData.key, sectionData);
      } else {
        await pageContentApi.create({ page: 'home', section, ...sectionData });
      }
      toast.success(`${section} saved successfully`);
      loadContent();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const getValue = (section, field, defaultValue = '') => {
    return content[section]?.[field] ?? defaultValue;
  };

  if (loading) {
    return <div className="admin-loading">Loading homepage editor...</div>;
  }

  return (
    <div className="admin-home-editor">
      <header className="admin-page-header">
        <h1 className="admin-page-title">Homepage Editor</h1>
        <p className="admin-page-subtitle">Edit all content on the public homepage</p>
      </header>

      <section className="admin-editor-section">
        <h2 className="admin-editor-section-title">Hero Section</h2>
        <div className="admin-editor-grid">
          <div className="admin-editor-field">
            <label className="admin-editor-label">Hero Heading</label>
            <textarea
              className="admin-editor-textarea"
              value={getValue('hero', 'title', 'Turning Agro-waste<br />to fine crafts')}
              onChange={(e) => handleChange('hero', 'title', e.target.value)}
              rows={3}
            />
          </div>
          <div className="admin-editor-field">
            <label className="admin-editor-label">Hero Default Image</label>
            <ImageSelector
              value={getValue('hero', 'images', [])[0]?.url || '/images/grey.jpg'}
              onChange={(url) => handleImageChange('hero', 'images', [{ ...content.hero?.images[0], url }])}
              mediaFiles={mediaFiles}
              mediaLoading={mediaLoading}
            />
          </div>
          <div className="admin-editor-field">
            <label className="admin-editor-label">Hero Hover Image</label>
            <ImageSelector
              value={getValue('hero', 'content', {}).hoverImage || '/images/brown.jpg'}
              onChange={(url) => handleChange('hero', 'content', { ...content.hero?.content, hoverImage: url })}
              mediaFiles={mediaFiles}
              mediaLoading={mediaLoading}
            />
          </div>
        </div>
        <div className="admin-editor-actions">
          <button className="admin-btn admin-btn-primary" onClick={() => handleSave('hero')} disabled={saving}>
            {saving ? 'Saving...' : 'Save Hero Section'}
          </button>
        </div>
      </section>

      <section className="admin-editor-section">
        <h2 className="admin-editor-section-title">Collection Section</h2>
        <div className="admin-editor-grid">
          <div className="admin-editor-field">
            <label className="admin-editor-label">Section Heading</label>
            <input
              className="admin-editor-input"
              value={getValue('collection', 'title', 'The Collection')}
              onChange={(e) => handleChange('collection', 'title', e.target.value)}
            />
          </div>
          <div className="admin-editor-field">
            <label className="admin-editor-label">Section Description</label>
            <textarea
              className="admin-editor-textarea"
              value={getValue('collection', 'body', 'Thoughtfully crafted pieces made from upcycled agro-waste, designed to bring warmth and purpose to your space.')}
              onChange={(e) => handleChange('collection', 'body', e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <h3 className="admin-editor-subsection-title">Products</h3>
        <ProductListEditor
          section="collection"
          products={content.collection?.content?.products || []}
          onChange={(products) => handleChange('collection', 'content', { ...content.collection?.content, products })}
          mediaFiles={mediaFiles}
          mediaLoading={mediaLoading}
        />
        <div className="admin-editor-actions">
          <button className="admin-btn admin-btn-primary" onClick={() => handleSave('collection')} disabled={saving}>
            {saving ? 'Saving...' : 'Save Collection Section'}
          </button>
        </div>
      </section>

      <section className="admin-editor-section">
        <h2 className="admin-editor-section-title">Our Story Section</h2>
        <div className="admin-editor-grid">
          <div className="admin-editor-field">
            <label className="admin-editor-label">Section Heading</label>
            <input
              className="admin-editor-input"
              value={getValue('story', 'title', 'Our Story')}
              onChange={(e) => handleChange('story', 'title', e.target.value)}
            />
          </div>
          <div className="admin-editor-field">
            <label className="admin-editor-label">Section Description</label>
            <textarea
              className="admin-editor-textarea"
              value={getValue('story', 'body', 'At Om Banana Crafts, we transform agricultural waste into exquisite handmade products. What began as a vision to reduce farm waste has grown into a movement that empowers rural artisans and brings sustainable craftsmanship to your home. Every piece tells a story of renewal, skill, and a deep respect for nature.')}
              onChange={(e) => handleChange('story', 'body', e.target.value)}
              rows={4}
            />
          </div>
          <div className="admin-editor-field">
            <label className="admin-editor-label">Button Text</label>
            <input
              className="admin-editor-input"
              value={getValue('story', 'content', {}).buttonText || 'Know our full story'}
              onChange={(e) => handleChange('story', 'content', { ...content.story?.content, buttonText: e.target.value })}
            />
          </div>
          <div className="admin-editor-field">
            <label className="admin-editor-label">Button Link</label>
            <input
              className="admin-editor-input"
              value={getValue('story', 'content', {}).buttonLink || '/our-story'}
              onChange={(e) => handleChange('story', 'content', { ...content.story?.content, buttonLink: e.target.value })}
            />
          </div>
          <div className="admin-editor-field">
            <label className="admin-editor-label">Image</label>
            <ImageSelector
              value={getValue('story', 'images', [])[0]?.url || '/images/man.png'}
              onChange={(url) => handleImageChange('story', 'images', [{ ...content.story?.images[0], url }])}
              mediaFiles={mediaFiles}
              mediaLoading={mediaLoading}
            />
          </div>
        </div>
        <div className="admin-editor-actions">
          <button className="admin-btn admin-btn-primary" onClick={() => handleSave('story')} disabled={saving}>
            {saving ? 'Saving...' : 'Save Story Section'}
          </button>
        </div>
      </section>

      <section className="admin-editor-section">
        <h2 className="admin-editor-section-title">Awards Section</h2>
        <div className="admin-editor-grid">
          <div className="admin-editor-field">
            <label className="admin-editor-label">Section Heading</label>
            <input
              className="admin-editor-input"
              value={getValue('awards', 'title', 'Award and recognition')}
              onChange={(e) => handleChange('awards', 'title', e.target.value)}
            />
          </div>
          <div className="admin-editor-field">
            <label className="admin-editor-label">Section Description</label>
            <textarea
              className="admin-editor-textarea"
              value={getValue('awards', 'body', 'Our commitment to sustainability and craftsmanship has been recognized globally.')}
              onChange={(e) => handleChange('awards', 'body', e.target.value)}
              rows={3}
            />
          </div>
          <div className="admin-editor-field">
            <label className="admin-editor-label">Awards Image</label>
            <ImageSelector
              value={getValue('awards', 'images', [])[0]?.url || '/images/awards.png'}
              onChange={(url) => handleImageChange('awards', 'images', [{ ...content.awards?.images[0], url }])}
              mediaFiles={mediaFiles}
              mediaLoading={mediaLoading}
            />
          </div>
        </div>
        <div className="admin-editor-actions">
          <button className="admin-btn admin-btn-primary" onClick={() => handleSave('awards')} disabled={saving}>
            {saving ? 'Saving...' : 'Save Awards Section'}
          </button>
        </div>
      </section>

      <section className="admin-editor-section">
        <h2 className="admin-editor-section-title">Innovations Section</h2>
        <div className="admin-editor-grid">
          <div className="admin-editor-field">
            <label className="admin-editor-label">Section Heading</label>
            <input
              className="admin-editor-input"
              value={getValue('innovations', 'title', 'Innovations')}
              onChange={(e) => handleChange('innovations', 'title', e.target.value)}
            />
          </div>
          <div className="admin-editor-field">
            <label className="admin-editor-label">Section Description</label>
            <textarea
              className="admin-editor-textarea"
              value={getValue('innovations', 'body', 'Our core innovation lies in the mechanical mastery of natural fiber extraction. Driven by the vision of turning "waste to wealth," our founder Mr. Murugesan has developed specialized machines designed to efficiently process discarded banana stems into high-quality, durable fiber.')}
              onChange={(e) => handleChange('innovations', 'body', e.target.value)}
              rows={4}
            />
          </div>
          <div className="admin-editor-field">
            <label className="admin-editor-label">Button Text</label>
            <input
              className="admin-editor-input"
              value={getValue('innovations', 'content', {}).buttonText || 'Know More'}
              onChange={(e) => handleChange('innovations', 'content', { ...content.innovations?.content, buttonText: e.target.value })}
            />
          </div>
          <div className="admin-editor-field">
            <label className="admin-editor-label">Image</label>
            <ImageSelector
              value={getValue('innovations', 'images', [])[0]?.url || '/images/machine.png'}
              onChange={(url) => handleImageChange('innovations', 'images', [{ ...content.innovations?.images[0], url }])}
              mediaFiles={mediaFiles}
              mediaLoading={mediaLoading}
            />
          </div>
        </div>
        <div className="admin-editor-actions">
          <button className="admin-btn admin-btn-primary" onClick={() => handleSave('innovations')} disabled={saving}>
            {saving ? 'Saving...' : 'Save Innovations Section'}
          </button>
        </div>
      </section>

      <section className="admin-editor-section">
        <h2 className="admin-editor-section-title">Statistics Section</h2>
        <div className="admin-editor-grid">
          <div className="admin-editor-field">
            <label className="admin-editor-label">Main Stat Image</label>
            <ImageSelector
              value={getValue('stats', 'images', [])[0]?.url || '/images/50.png'}
              onChange={(url) => handleImageChange('stats', 'images', [{ ...content.stats?.images[0], url }])}
              mediaFiles={mediaFiles}
              mediaLoading={mediaLoading}
            />
          </div>
          <div className="admin-editor-field">
            <label className="admin-editor-label">Main Stat Label</label>
            <input
              className="admin-editor-input"
              value={getValue('stats', 'body', 'Agro-waste repurposed annually')}
              onChange={(e) => handleChange('stats', 'body', e.target.value)}
            />
          </div>
          <div className="admin-editor-field">
            <label className="admin-editor-label">Stat 1 Number</label>
            <input
              className="admin-editor-input"
              value={getValue('stats', 'content', {}).stat1Number || '10%'}
              onChange={(e) => handleChange('stats', 'content', { ...content.stats?.content, stat1Number: e.target.value })}
            />
          </div>
          <div className="admin-editor-field">
            <label className="admin-editor-label">Stat 1 Description</label>
            <input
              className="admin-editor-input"
              value={getValue('stats', 'content', {}).stat1Desc || 'Profit reaches farmers'}
              onChange={(e) => handleChange('stats', 'content', { ...content.stats?.content, stat1Desc: e.target.value })}
            />
          </div>
          <div className="admin-editor-field">
            <label className="admin-editor-label">Stat 2 Number</label>
            <input
              className="admin-editor-input"
              value={getValue('stats', 'content', {}).stat2Number || '350+'}
              onChange={(e) => handleChange('stats', 'content', { ...content.stats?.content, stat2Number: e.target.value })}
            />
          </div>
          <div className="admin-editor-field">
            <label className="admin-editor-label">Stat 2 Description</label>
            <input
              className="admin-editor-input"
              value={getValue('stats', 'content', {}).stat2Desc || 'Rural women employed'}
              onChange={(e) => handleChange('stats', 'content', { ...content.stats?.content, stat2Desc: e.target.value })}
            />
          </div>
        </div>
        <div className="admin-editor-actions">
          <button className="admin-btn admin-btn-primary" onClick={() => handleSave('stats')} disabled={saving}>
            {saving ? 'Saving...' : 'Save Statistics Section'}
          </button>
        </div>
      </section>
    </div>
  );
}

function ImageSelector({ value, onChange, mediaFiles, mediaLoading }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="admin-image-selector">
      <div className="admin-image-preview" onClick={() => setShowModal(true)}>
        {value ? (
          <img src={value} alt="Preview" />
        ) : (
          <span className="admin-image-placeholder">No image selected</span>
        )}
      </div>
      <div className="admin-image-actions">
        <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(true)}>
          Change Image
        </button>
        {value && (
          <button type="button" className="admin-btn admin-btn-secondary" onClick={() => onChange('')}>
            Remove
          </button>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Select Image</h3>
              <button type="button" className="admin-modal-close" onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="admin-modal-body">
              {mediaLoading ? (
                <div className="admin-loading">Loading media...</div>
              ) : (
                <div className="admin-media-grid">
                  {mediaFiles.map((file) => (
                    <button
                      key={file.id}
                      className={`admin-media-item ${file.url === value ? 'selected' : ''}`}
                      onClick={() => { onChange(file.url); setShowModal(false); }}
                    >
                      <img src={file.url} alt={file.alt || file.filename} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-primary" onClick={() => setShowModal(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductListEditor({ section, products, onChange, mediaFiles, mediaLoading }) {
  return (
    <div className="admin-product-list">
      {products.map((product, index) => (
        <div key={index} className="admin-product-item">
          <div className="admin-product-item-header">
            <span className="admin-product-item-number">Product {index + 1}</span>
            <div className="admin-product-item-actions">
              <button type="button" className="admin-btn-icon" onClick={() => moveProduct(index, -1)} disabled={index === 0}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
              </button>
              <button type="button" className="admin-btn-icon" onClick={() => moveProduct(index, 1)} disabled={index === products.length - 1}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              <button type="button" className="admin-btn-icon admin-btn-danger" onClick={() => removeProduct(index)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              </button>
            </div>
          </div>
          <div className="admin-editor-grid">
            <div className="admin-editor-field">
              <label className="admin-editor-label">Product Name</label>
              <input
                className="admin-editor-input"
                value={product.title || ''}
                onChange={(e) => updateProduct(index, { ...product, title: e.target.value })}
              />
            </div>
            <div className="admin-editor-field">
              <label className="admin-editor-label">Product Description</label>
              <textarea
                className="admin-editor-textarea"
                value={product.description || ''}
                onChange={(e) => updateProduct(index, { ...product, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="admin-editor-field">
              <label className="admin-editor-label">Product Image</label>
              <ImageSelector
                value={product.image || ''}
                onChange={(url) => updateProduct(index, { ...product, image: url })}
                mediaFiles={mediaFiles}
                mediaLoading={mediaLoading}
              />
            </div>
          </div>
        </div>
      ))}
      <button type="button" className="admin-btn admin-btn-secondary" onClick={addProduct}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:16,height:16}}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        Add Product
      </button>
    </div>
  );

  function updateProduct(index, newProduct) {
    const newProducts = [...products];
    newProducts[index] = newProduct;
    onChange(newProducts);
  }

  function addProduct() {
    onChange([...products, { title: '', description: '', image: '' }]);
  }

  function removeProduct(index) {
    onChange(products.filter((_, i) => i !== index));
  }

  function moveProduct(index, direction) {
    const newProducts = [...products];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newProducts.length) return;
    [newProducts[index], newProducts[newIndex]] = [newProducts[newIndex], newProducts[index]];
    onChange(newProducts);
  }
}