import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useToast } from '../hooks/useToast';
import MediaSelector from '../components/MediaSelector';

const initialContent = {
  hero: {
    heading: 'Turning Agro-waste<br />to fine crafts',
    defaultImage: '/images/grey.jpg',
    hoverImage: '/images/brown.jpg',
    imageAlt: 'Turning Agro-waste to fine crafts',
  },
  collectionSection: {
    heading: 'The Collection',
    subtitle: 'Thoughtfully crafted pieces made from upcycled agro-waste, designed to bring warmth and purpose to your space.',
    products: [
      { title: 'Elliptical Planter', description: 'Handcrafted from banana fiber with a sleek elliptical silhouette.', image: '/images/elliptical.jpg' },
      { title: 'Square Basket', description: 'Premium woven square basket for storage and decor.', image: '/images/square.jpg' },
      { title: 'Bottle Vase', description: 'Elegant bottle-shaped vase for fresh or dried arrangements.', image: '/images/bottle.jpg' },
      { title: 'Woven Tray', description: 'Versatile handwoven tray, perfect for serving and display.', image: '/images/woven.jpg' },
    ],
  },
  story: {
    heading: 'Our Story',
    body: 'At Om Banana Crafts, we transform agricultural waste into exquisite handmade products. What began as a vision to reduce farm waste has grown into a movement that empowers rural artisans and brings sustainable craftsmanship to your home. Every piece tells a story of renewal, skill, and a deep respect for nature.',
    buttonText: 'Know our full story',
    buttonLink: '/our-story',
    image: '/images/man.png',
    imageAlt: 'Founder',
  },
  awards: {
    heading: 'Award and recognition',
    subtitle: 'Our commitment to sustainability and craftsmanship has been recognized globally.',
    image: '/images/awards.png',
    imageAlt: 'Awards and recognition',
  },
  innovations: {
    heading: 'Innovations',
    body: 'Our core innovation lies in the mechanical mastery of natural fiber extraction. Driven by the vision of turning &ldquo;waste to wealth,&rdquo; our founder Mr.&nbsp;Murugesan has developed specialized machines designed to efficiently process discarded banana stems into high-quality, durable fiber.',
    buttonText: 'Know More',
    buttonLink: '/innovations',
    image: '/images/machine.png',
    imageAlt: 'Innovation machine',
  },
  statistics: {
    stat1: { number: '50+', label: 'Agro-waste repurposed annually', image: '/images/50.png' },
    stat2: { number: '10%', label: 'Profit reaches farmers', image: null },
    stat3: { number: '350+', label: 'Rural women employed', image: null },
  },
};

export default function HomepageEditor() {
  const { success, error } = useToast();
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  const tabs = [
    { id: 'hero', label: 'Hero' },
    { id: 'collection', label: 'Collection' },
    { id: 'story', label: 'Our Story' },
    { id: 'awards', label: 'Awards' },
    { id: 'innovations', label: 'Innovations' },
    { id: 'statistics', label: 'Statistics' },
  ];

  const loadContent = async () => {
    setLoading(true);
    try {
      const res = await api.settings.get();
      if (res.data?.homepage) {
        setContent({ ...initialContent, ...res.data.homepage });
      }
    } catch (err) {
      console.error('Failed to load homepage content:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    setLoading(true);
    try {
      await api.settings.update({ homepage: content });
      success('Homepage content saved successfully');
    } catch (err) {
      error('Failed to save homepage content');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const updateField = (section, field, value) => {
    setContent(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const updateNestedField = (section, nestedKey, field, value) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedKey]: { ...prev[section][nestedKey], [field]: value },
      },
    }));
  };

  const addCollectionProduct = () => {
    setContent(prev => ({
      ...prev,
      collectionSection: {
        ...prev.collectionSection,
        products: [...prev.collectionSection.products, { title: '', description: '', image: '' }],
      },
    }));
  };

  const removeCollectionProduct = (index) => {
    setContent(prev => ({
      ...prev,
      collectionSection: {
        ...prev.collectionSection,
        products: prev.collectionSection.products.filter((_, i) => i !== index),
      },
    }));
  };

  const moveCollectionProduct = (fromIndex, toIndex) => {
    setContent(prev => {
      const products = [...prev.collectionSection.products];
      const [removed] = products.splice(fromIndex, 1);
      products.splice(toIndex, 0, removed);
      return { ...prev, collectionSection: { ...prev.collectionSection, products } };
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div className="animate-spin" style={{width:40,height:40,border:'3px solid var(--admin-border)',borderTopColor:'var(--admin-primary)',borderRadius:'50%'}} />
      </div>
    );
  }

  return (
    <div>
      <div className="admin-section-header">
        <h1 className="admin-section-title">Homepage Editor</h1>
        <button className="admin-btn admin-btn-primary" onClick={saveContent} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-card-body">
          {activeTab === 'hero' && (
            <HeroEditor content={content.hero} onChange={v => updateField('hero', v.target.name, v.target.value)} onImageSelect={(field, url) => updateField('hero', field, url)} />
          )}
          {activeTab === 'collection' && (
            <CollectionEditor
              content={content.collectionSection}
              onChange={(field, value) => updateField('collectionSection', field, value)}
              onProductChange={(index, field, value) => {
                setContent(prev => ({
                  ...prev,
collectionSection: {
                    ...prev.collectionSection,
                    products: prev.collectionSection.products.map((p, i) => i === index ? { ...p, [field]: value } : p),
                  },
                }));
              }}
              onAdd={addCollectionProduct}
              onRemove={removeCollectionProduct}
              onMove={moveCollectionProduct}
            />
          )}
          {activeTab === 'story' && (
            <StoryEditor content={content.story} onChange={v => updateField('story', v.target.name, v.target.value)} onImageSelect={(field, url) => updateField('story', field, url)} />
          )}
          {activeTab === 'awards' && (
            <AwardsEditor content={content.awards} onChange={v => updateField('awards', v.target.name, v.target.value)} onImageSelect={(field, url) => updateField('awards', field, url)} />
          )}
          {activeTab === 'innovations' && (
            <InnovationsEditor content={content.innovations} onChange={v => updateField('innovations', v.target.name, v.target.value)} onImageSelect={(field, url) => updateField('innovations', field, url)} />
          )}
          {activeTab === 'statistics' && (
            <StatisticsEditor content={content.statistics} onChange={(key, field, value) => updateNestedField('statistics', key, field, value)} />
          )}
        </div>
      </div>
    </div>
  );
}

function HeroEditor({ content, onChange, onImageSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="admin-form-group">
        <label className="admin-form-label">Hero Heading (supports <br />)</label>
        <textarea
          name="heading"
          className="admin-form-textarea"
          value={content.heading}
          onChange={onChange}
          rows={3}
          placeholder="Turning Agro-waste<br />to fine crafts"
        />
      </div>

      <div className="admin-form-row">
        <div className="admin-form-group">
          <label className="admin-form-label">Default Image</label>
          <MediaSelector
            value={content.defaultImage}
            onChange={(url) => onImageSelect('defaultImage', url)}
            previewAlt={content.imageAlt}
          />
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Hover Image</label>
          <MediaSelector
            value={content.hoverImage}
            onChange={(url) => onImageSelect('hoverImage', url)}
            previewAlt={content.imageAlt}
          />
        </div>
      </div>

      <div className="admin-form-group">
        <label htmlFor="hero-image-alt" className="admin-form-label">Image Alt Text</label>
        <input
          type="text"
          id="hero-image-alt"
          name="imageAlt"
          className="admin-form-input"
          value={content.imageAlt}
          onChange={onChange}
          placeholder="Alt text for hero images"
        />
      </div>
    </div>
  );
}

function CollectionEditor({ content, onChange, onProductChange, onAdd, onRemove, onMove }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="admin-form-group">
        <label className="admin-form-label">Section Heading</label>
        <input
          type="text"
          name="heading"
          className="admin-form-input"
          value={content.heading}
          onChange={onChange}
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Section Description</label>
        <textarea
          name="subtitle"
          className="admin-form-textarea"
          value={content.subtitle}
          onChange={onChange}
          rows={3}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Product Cards</h3>
        <button type="button" className="admin-btn admin-btn-secondary" onClick={onAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'6px'}}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Product
        </button>
      </div>

      {content.products.map((product, index) => (
        <div key={index} className="admin-card" style={{ marginBottom: '16px' }}>
          <div className="admin-card-header">
            <h4 className="admin-card-title">Product #{index + 1}</h4>
            <div className="admin-table-actions">
              <button type="button" className="admin-icon-btn" onClick={() => index > 0 && onMove(index, index - 1)} title="Move Up" disabled={index === 0}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15" /></svg>
              </button>
              <button type="button" className="admin-icon-btn" onClick={() => index < content.products.length - 1 && onMove(index, index + 1)} title="Move Down" disabled={index === content.products.length - 1}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              <button type="button" className="admin-icon-btn delete" onClick={() => onRemove(index)} title="Delete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              </button>
            </div>
          </div>
          <div className="admin-card-body">
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Product Name</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={product.title}
                  onChange={(e) => onProductChange(index, 'title', e.target.value)}
                  placeholder="Product name"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Image</label>
                <MediaSelector
                  value={product.image}
                  onChange={(url) => onProductChange(index, 'image', url)}
                  previewAlt={product.title}
                />
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Description</label>
              <textarea
                className="admin-form-textarea"
                value={product.description}
                onChange={(e) => onProductChange(index, 'description', e.target.value)}
                rows={2}
                placeholder="Product description"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StoryEditor({ content, onChange, onImageSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="admin-form-group">
        <label className="admin-form-label">Heading</label>
        <input
          type="text"
          name="heading"
          className="admin-form-input"
          value={content.heading}
          onChange={onChange}
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Body Text</label>
        <textarea
          name="body"
          className="admin-form-textarea"
          value={content.body}
          onChange={onChange}
          rows={4}
        />
      </div>

      <div className="admin-form-row">
        <div className="admin-form-group">
          <label className="admin-form-label">Button Text</label>
          <input
            type="text"
            name="buttonText"
            className="admin-form-input"
            value={content.buttonText}
            onChange={onChange}
          />
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Button Link</label>
          <input
            type="text"
            name="buttonLink"
            className="admin-form-input"
            value={content.buttonLink}
            onChange={onChange}
          />
        </div>
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Image</label>
        <MediaSelector
          value={content.image}
          onChange={(url) => onImageSelect('image', url)}
          previewAlt={content.imageAlt}
        />
      </div>

      <div className="admin-form-group">
        <label htmlFor="story-image-alt" className="admin-form-label">Image Alt Text</label>
        <input
          type="text"
          id="story-image-alt"
          name="imageAlt"
          className="admin-form-input"
          value={content.imageAlt}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function AwardsEditor({ content, onChange, onImageSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="admin-form-group">
        <label className="admin-form-label">Heading</label>
        <input
          type="text"
          name="heading"
          className="admin-form-input"
          value={content.heading}
          onChange={onChange}
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Subtitle</label>
        <textarea
          name="subtitle"
          className="admin-form-textarea"
          value={content.subtitle}
          onChange={onChange}
          rows={2}
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Image</label>
        <MediaSelector
          value={content.image}
          onChange={(url) => onImageSelect('image', url)}
          previewAlt={content.imageAlt}
        />
      </div>

      <div className="admin-form-group">
        <label htmlFor="awards-image-alt" className="admin-form-label">Image Alt Text</label>
        <input
          type="text"
          id="awards-image-alt"
          name="imageAlt"
          className="admin-form-input"
          value={content.imageAlt}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function InnovationsEditor({ content, onChange, onImageSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="admin-form-group">
        <label className="admin-form-label">Heading</label>
        <input
          type="text"
          name="heading"
          className="admin-form-input"
          value={content.heading}
          onChange={onChange}
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Body Text</label>
        <textarea
          name="body"
          className="admin-form-textarea"
          value={content.body}
          onChange={onChange}
          rows={4}
        />
      </div>

      <div className="admin-form-row">
        <div className="admin-form-group">
          <label className="admin-form-label">Button Text</label>
          <input
            type="text"
            name="buttonText"
            className="admin-form-input"
            value={content.buttonText}
            onChange={onChange}
          />
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Button Link</label>
          <input
            type="text"
            name="buttonLink"
            className="admin-form-input"
            value={content.buttonLink}
            onChange={onChange}
          />
        </div>
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Image</label>
        <MediaSelector
          value={content.image}
          onChange={(url) => onImageSelect('image', url)}
          previewAlt={content.imageAlt}
        />
      </div>

      <div className="admin-form-group">
        <label htmlFor="innovations-image-alt" className="admin-form-label">Image Alt Text</label>
        <input
          type="text"
          id="innovations-image-alt"
          name="imageAlt"
          className="admin-form-input"
          value={content.imageAlt}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function StatisticsEditor({ content, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <p className="admin-form-help">Edit the three statistics displayed on the homepage</p>

      {Object.entries(content).map(([key, stat]) => (
        <div key={key} className="admin-card">
          <div className="admin-card-header">
            <h4 className="admin-card-title">Statistic: {stat.number}</h4>
          </div>
          <div className="admin-card-body">
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Number</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={stat.number}
                  onChange={(e) => onChange(key, 'number', e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Label</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={stat.label}
                  onChange={(e) => onChange(key, 'label', e.target.value)}
                />
              </div>
            </div>
            {stat.image && (
              <div className="admin-form-group">
                <label className="admin-form-label">Image (optional)</label>
                <MediaSelector
                  value={stat.image}
                  onChange={(url) => onChange(key, 'image', url)}
                  previewAlt={stat.label}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}