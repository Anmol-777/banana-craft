import { useEffect, useState } from 'react';
import { innovationsApi, galleryApi, mediaApi } from '../../api/adminApi';
import toast from 'react-hot-toast';
import './AdminInnovations.css';

export default function AdminInnovations() {
  const [innovations, setInnovations] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('innovations');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(initialInnovationState());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [innRes, galRes] = await Promise.all([
        innovationsApi.list({ includeInactive: 'true', limit: 200 }),
        galleryApi.list({ includeInactive: 'true', limit: 200 }),
      ]);
      setInnovations(innRes.data.data || []);
      setGallery(galRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

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

  function initialInnovationState() {
    return {
      name: '',
      slug: '',
      summary: '',
      body: '',
      image: '',
      imageAlt: '',
      images: [],
      order: 0,
      active: true,
    };
  }

  function initialGalleryState() {
    return {
      title: '',
      caption: '',
      image: '',
      imageAlt: '',
      layout: 'small',
      order: 0,
      active: true,
    };
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (url) => {
    handleChange('image', url);
  };

  const handleGalleryImageChange = (url) => {
    handleChange('image', url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData, order: Number(formData.order) || 0 };
      if (activeTab === 'innovations') {
        if (editingItem) {
          await innovationsApi.update(editingItem.id, payload);
          toast.success('Innovation updated');
        } else {
          await innovationsApi.create(payload);
          toast.success('Innovation created');
        }
      } else {
        if (editingItem) {
          await galleryApi.update(editingItem.id, payload);
          toast.success('Gallery item updated');
        } else {
          await galleryApi.create(payload);
          toast.success('Gallery item created');
        }
      }
      closeForm();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    if (activeTab === 'innovations') {
      setFormData({
        name: item.name,
        slug: item.slug || '',
        summary: item.summary || '',
        body: item.body || '',
        image: item.image || '',
        imageAlt: item.imageAlt || '',
        images: (item.images || []).map(img => ({ url: img.url, alt: img.alt || '', caption: img.caption || '' })),
        order: item.order || 0,
        active: item.active !== false,
      });
    } else {
      setFormData({
        title: item.title || '',
        caption: item.caption || '',
        image: item.image || '',
        imageAlt: item.imageAlt || '',
        layout: item.layout || 'small',
        order: item.order || 0,
        active: item.active !== false,
      });
    }
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      if (activeTab === 'innovations') {
        await innovationsApi.delete(id);
      } else {
        await galleryApi.delete(id);
      }
      toast.success('Item deleted');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Delete failed');
    }
  };

  const handleToggleActive = async (item) => {
    try {
      if (activeTab === 'innovations') {
        await innovationsApi.update(item.id, { active: !item.active });
      } else {
        await galleryApi.update(item.id, { active: !item.active });
      }
      toast.success(`Item ${item.active ? 'deactivated' : 'activated'}`);
      loadData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleReorder = async (items) => {
    try {
      if (activeTab === 'innovations') {
        await innovationsApi.reorder(items);
      } else {
        await galleryApi.reorder(items);
      }
      toast.success('Order updated');
      loadData();
    } catch (err) {
      toast.error('Failed to reorder');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData(activeTab === 'innovations' ? initialInnovationState() : initialGalleryState());
  };

  const handleAddNew = () => {
    closeForm();
    const nextOrder = (activeTab === 'innovations' ? innovations : gallery).length;
    setFormData({
      ...(activeTab === 'innovations' ? initialInnovationState() : initialGalleryState()),
      order: nextOrder,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <div className="admin-loading">Loading innovations...</div>;
  }

  const currentItems = activeTab === 'innovations' ? innovations : gallery;

  return (
    <div className="admin-innovations">
      <header className="admin-page-header">
        <h1 className="admin-page-title">Innovations</h1>
        <p className="admin-page-subtitle">Manage innovations and gallery items</p>
      </header>

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'innovations' ? 'active' : ''}`} onClick={() => { setActiveTab('innovations'); closeForm(); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
          Innovations ({innovations.length})
        </button>
        <button className={`admin-tab ${activeTab === 'gallery' ? 'active' : ''}`} onClick={() => { setActiveTab('gallery'); closeForm(); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
          Gallery ({gallery.length})
        </button>
      </div>

      <div className="admin-toolbar">
        <button className="admin-btn admin-btn-primary" onClick={handleAddNew}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add {activeTab === 'innovations' ? 'Innovation' : 'Gallery Item'}
        </button>
      </div>

      {showForm && (
        <section className="admin-form-section">
          <div className="admin-form-header">
            <h2 className="admin-form-title">{editingItem ? 'Edit' : 'Add'} {activeTab === 'innovations' ? 'Innovation' : 'Gallery Item'}</h2>
            <button type="button" className="admin-btn-icon" onClick={closeForm}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="admin-form">
            {activeTab === 'innovations' ? (
              <>
                <div className="admin-form-row">
                  <div className="admin-form-field">
                    <label className="admin-form-label">Name *</label>
                    <input className="admin-form-input" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required />
                  </div>
                  <div className="admin-form-field">
                    <label className="admin-form-label">Slug</label>
                    <input className="admin-form-input" value={formData.slug} onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="auto-generated" />
                  </div>
                </div>

                <div className="admin-form-field">
                  <label className="admin-form-label">Summary</label>
                  <textarea className="admin-form-textarea" value={formData.summary} onChange={(e) => handleChange('summary', e.target.value)} rows={2} placeholder="Brief description for cards" />
                </div>

                <div className="admin-form-field">
                  <label className="admin-form-label">Full Description</label>
                  <textarea className="admin-form-textarea" value={formData.body} onChange={(e) => handleChange('body', e.target.value)} rows={4} />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-field">
                    <label className="admin-form-label">Order</label>
                    <input type="number" className="admin-form-input" min="0" value={formData.order} onChange={(e) => handleChange('order', e.target.value)} />
                  </div>
                </div>

                <fieldset className="admin-form-field">
                  <legend className="admin-form-label">Main Image</legend>
                  <div className="admin-image-row">
                    <ImageSelector
                      value={formData.image}
                      onChange={handleImageChange}
                      mediaFiles={mediaFiles}
                      mediaLoading={mediaLoading}
                    />
                    <div className="admin-image-meta">
                      <input className="admin-form-input" placeholder="Alt text" value={formData.imageAlt} onChange={(e) => handleChange('imageAlt', e.target.value)} />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="admin-form-field">
                  <legend className="admin-form-label">Additional Images</legend>
                  <div className="admin-images-list">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="admin-image-row">
                        <ImageSelector
                          value={img.url}
                          onChange={(url) => { const n=[...formData.images]; n[idx]={...n[idx],url}; setFormData({...formData,images:n}); }}
                          mediaFiles={mediaFiles}
                          mediaLoading={mediaLoading}
                        />
                        <div className="admin-image-meta">
                          <input className="admin-form-input" placeholder="Alt text" value={img.alt} onChange={(e) => { const n=[...formData.images]; n[idx]={...n[idx],alt:e.target.value}; setFormData({...formData,images:n}); }} />
                          <input className="admin-form-input" placeholder="Caption" value={img.caption} onChange={(e) => { const n=[...formData.images]; n[idx]={...n[idx],caption:e.target.value}; setFormData({...formData,images:n}); }} />
                        </div>
                        <button type="button" className="admin-btn-icon admin-btn-danger" onClick={() => { const n=formData.images.filter((_,i)=>i!==idx); setFormData({...formData,images:n}); }} disabled={formData.images.length <= 1}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="admin-btn admin-btn-secondary" onClick={() => { setFormData({...formData,images:[...formData.images,{url:'',alt:'',caption:''}]}); }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:16,height:16}}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Add Image
                  </button>
                </fieldset>

                <div className="admin-form-row">
                  <div className="admin-form-field">
                    <label className="admin-form-label admin-checkbox-label">
                      <input type="checkbox" checked={formData.active} onChange={(e) => handleChange('active', e.target.checked)} />
                      Active
                    </label>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="admin-form-row">
                  <div className="admin-form-field">
                    <label className="admin-form-label">Title</label>
                    <input className="admin-form-input" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} />
                  </div>
                  <div className="admin-form-field">
                    <label className="admin-form-label">Order</label>
                    <input type="number" className="admin-form-input" min="0" value={formData.order} onChange={(e) => handleChange('order', e.target.value)} />
                  </div>
                </div>

                <div className="admin-form-field">
                  <label className="admin-form-label">Caption</label>
                  <textarea className="admin-form-textarea" value={formData.caption} onChange={(e) => handleChange('caption', e.target.value)} rows={2} />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-field">
                    <label className="admin-form-label">Layout</label>
                    <select className="admin-form-select" value={formData.layout} onChange={(e) => handleChange('layout', e.target.value)}>
                      <option value="large">Large (Left Column)</option>
                      <option value="small">Small (Right Column)</option>
                    </select>
                  </div>
                </div>

                <fieldset className="admin-form-field">
                  <legend className="admin-form-label">Image *</legend>
                  <div className="admin-image-row">
                    <ImageSelector
                      value={formData.image}
                      onChange={handleGalleryImageChange}
                      mediaFiles={mediaFiles}
                      mediaLoading={mediaLoading}
                    />
                    <div className="admin-image-meta">
                      <input className="admin-form-input" placeholder="Alt text" value={formData.imageAlt} onChange={(e) => handleChange('imageAlt', e.target.value)} />
                    </div>
                  </div>
                </fieldset>

                <div className="admin-form-row">
                  <div className="admin-form-field">
                    <label className="admin-form-label admin-checkbox-label">
                      <input type="checkbox" checked={formData.active} onChange={(e) => handleChange('active', e.target.checked)} />
                      Active
                    </label>
                  </div>
                </div>
              </>
            )}

            <div className="admin-form-actions">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={closeForm}>Cancel</button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                {saving ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-list-section">
        <div className="admin-list-header">
          <h3 className="admin-list-title">{activeTab === 'innovations' ? 'Innovations' : 'Gallery Items'} ({currentItems.length})</h3>
          <p className="admin-list-hint">Drag to reorder • Click to edit</p>
        </div>

        <div className="admin-drag-list" onDrop={handleDrop} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          {currentItems.map((item, index) => (
            <div key={item.id || item._id} className="admin-drag-item" draggable data-id={item.id || item._id} data-order={item.order}>
              <div className="admin-drag-handle" title="Drag to reorder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
              </div>
              <div className="admin-drag-image">
                {item.image ? <img src={item.image} alt="" /> : <span className="admin-no-image">No image</span>}
              </div>
              <div className="admin-drag-content">
                <h4 className="admin-drag-title">{activeTab === 'innovations' ? item.name : (item.title || 'Untitled')}</h4>
                <p className="admin-drag-body">{(activeTab === 'innovations' ? item.summary : item.caption)?.substring(0, 100)}...</p>
              </div>
              <div className="admin-drag-meta">
                <span className={`admin-status-badge ${item.active ? 'active' : 'inactive'}`}>
                  {item.active ? 'Active' : 'Inactive'}
                </span>
                {activeTab === 'gallery' && <span className="admin-drag-layout">{item.layout}</span>}
              </div>
              <div className="admin-drag-actions">
                <button className="admin-btn-icon" onClick={() => handleEdit(item)} title="Edit">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </button>
                <button className="admin-btn-icon" onClick={() => handleToggleActive(item)} title={item.active ? 'Deactivate' : 'Activate'}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{item.active ? <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" /> : <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />} /></svg>
                </button>
                <button className="admin-btn-icon admin-btn-danger" onClick={() => handleDelete(item.id || item._id)} title="Delete">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {currentItems.length === 0 && (
          <div className="admin-empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {activeTab === 'innovations' ? <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /> : <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />}
            </svg>
            <h3>No {activeTab === 'innovations' ? 'innovations' : 'gallery items'} yet</h3>
            <p>Create your first {activeTab === 'innovations' ? 'innovation' : 'gallery item'} to get started</p>
            <button className="admin-btn admin-btn-primary" onClick={handleAddNew}>Add {activeTab === 'innovations' ? 'Innovation' : 'Gallery Item'}</button>
          </div>
        )}
      </section>
    </div>
  );
}

let draggedItem = null;

function handleDragOver(e) {
  e.preventDefault();
  const afterElement = getDragAfterElement(e.currentTarget, e.clientY);
  const draggable = document.querySelector('.admin-drag-item.dragging');
  if (afterElement == null) {
    e.currentTarget.appendChild(draggable);
  } else {
    e.currentTarget.insertBefore(draggable, afterElement);
  }
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  const items = Array.from(e.currentTarget.querySelectorAll('.admin-drag-item'));
  const newOrder = items.map((item, index) => ({
    id: item.dataset.id,
    order: index,
  }));
  e.currentTarget.onDrop?.(newOrder);
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.admin-drag-item:not(.dragging)')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    }
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function ImageSelector({ value, onChange, mediaFiles, mediaLoading }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="admin-image-selector-compact" onClick={() => setShowModal(true)}>
      {value ? <img src={value} alt="Preview" /> : <span className="admin-image-placeholder">Add image</span>}
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
              {mediaLoading ? <div className="admin-loading">Loading...</div> : (
                <div className="admin-media-grid">
                  {mediaFiles.map(file => (
                    <button key={file.id} className={`admin-media-item ${file.url === value ? 'selected' : ''}`} onClick={() => { onChange(file.url); setShowModal(false); }}>
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