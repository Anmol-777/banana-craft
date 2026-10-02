import { useEffect, useState } from 'react';
import { storyApi, mediaApi } from '../../api/adminApi';
import toast from 'react-hot-toast';
import './AdminStory.css';

export default function AdminStory() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState(initialFormState());

  useEffect(() => {
    loadSections();
    loadMedia();
  }, []);

  const loadSections = async () => {
    try {
      const res = await storyApi.list({ includeInactive: 'true' });
      setSections(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load story sections');
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

  function initialFormState() {
    return {
      key: '',
      title: '',
      body: '',
      image: '',
      imageAlt: '',
      layout: 'image-left',
      order: 0,
      active: true,
    };
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData, order: Number(formData.order) || 0 };
      if (editingSection) {
        await storyApi.update(editingSection.key, payload);
        toast.success('Story section updated');
      } else {
        await storyApi.create(payload);
        toast.success('Story section created');
      }
      closeForm();
      loadSections();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setFormData({
      key: section.key,
      title: section.title || '',
      body: section.body || '',
      image: section.image || '',
      imageAlt: section.imageAlt || '',
      layout: section.layout || 'image-left',
      order: section.order || 0,
      active: section.active !== false,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (key) => {
    if (!window.confirm('Are you sure you want to delete this story section?')) return;
    try {
      await storyApi.delete(key);
      toast.success('Story section deleted');
      loadSections();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Delete failed');
    }
  };

  const handleToggleActive = async (section) => {
    try {
      await storyApi.update(section.key, { active: !section.active });
      toast.success(`Section ${section.active ? 'deactivated' : 'activated'}`);
      loadSections();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleReorder = async (items) => {
    try {
      await storyApi.reorder(items);
      toast.success('Order updated');
      loadSections();
    } catch (err) {
      toast.error('Failed to reorder');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSection(null);
    setFormData(initialFormState());
  };

  const handleAddNew = () => {
    closeForm();
    const nextKey = `section-${Date.now()}`;
    setFormData({ ...initialFormState(), key: nextKey, order: sections.length });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageChange = (url) => {
    handleChange('image', url);
  };

  if (loading) {
    return <div className="admin-loading">Loading story sections...</div>;
  }

  return (
    <div className="admin-story">
      <header className="admin-page-header">
        <h1 className="admin-page-title">Our Story</h1>
        <p className="admin-page-subtitle">Manage all story sections on the Our Story page</p>
      </header>

      <div className="admin-toolbar">
        <button className="admin-btn admin-btn-primary" onClick={handleAddNew}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Section
        </button>
      </div>

      {showForm && (
        <section className="admin-form-section">
          <div className="admin-form-header">
            <h2 className="admin-form-title">{editingSection ? 'Edit Section' : 'Add Section'}</h2>
            <button type="button" className="admin-btn-icon" onClick={closeForm}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-form-row">
              <div className="admin-form-field">
                <label className="admin-form-label">Key *</label>
                <input className="admin-form-input" value={formData.key} onChange={(e) => handleChange('key', e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))} required />
                <small className="admin-form-hint">Unique identifier (lowercase, numbers, dots, dashes, underscores)</small>
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Order</label>
                <input type="number" className="admin-form-input" min="0" value={formData.order} onChange={(e) => handleChange('order', e.target.value)} />
              </div>
            </div>

            <div className="admin-form-field">
              <label className="admin-form-label">Heading</label>
              <input className="admin-form-input" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} />
            </div>

            <div className="admin-form-field">
              <label className="admin-form-label">Body Text</label>
              <textarea className="admin-form-textarea" value={formData.body} onChange={(e) => handleChange('body', e.target.value)} rows={6} />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-field">
                <label className="admin-form-label">Layout</label>
                <select className="admin-form-select" value={formData.layout} onChange={(e) => handleChange('layout', e.target.value)}>
                  <option value="image-left">Image Left, Text Right</option>
                  <option value="image-right">Image Right, Text Left</option>
                </select>
              </div>
            </div>

            <fieldset className="admin-form-field">
              <legend className="admin-form-label">Image</legend>
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

            <div className="admin-form-row">
              <div className="admin-form-field">
                <label className="admin-form-label admin-checkbox-label">
                  <input type="checkbox" checked={formData.active} onChange={(e) => handleChange('active', e.target.checked)} />
                  Active
                </label>
              </div>
            </div>

            <div className="admin-form-actions">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={closeForm}>Cancel</button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                {saving ? 'Saving...' : (editingSection ? 'Update Section' : 'Create Section')}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-list-section">
        <div className="admin-list-header">
          <h3 className="admin-list-title">Story Sections ({sections.length})</h3>
          <p className="admin-list-hint">Drag to reorder • Click to edit</p>
        </div>

        <div className="admin-drag-list" data-reorder-items={JSON.stringify(sections.map(s => ({ id: s.id, key: s.key, order: s.order })))} onDrop={handleDrop} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          {sections.map((section, index) => (
            <div key={section.key} className="admin-drag-item" draggable data-key={section.key} data-order={section.order}>
              <div className="admin-drag-handle" title="Drag to reorder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" /></svg>
              </div>
              <div className="admin-drag-image">
                {section.image ? <img src={section.image} alt="" /> : <span className="admin-no-image">No image</span>}
              </div>
              <div className="admin-drag-content">
                <h4 className="admin-drag-title">{section.title || 'Untitled'}</h4>
                <p className="admin-drag-key">{section.key}</p>
                <p className="admin-drag-body">{section.body?.substring(0, 100)}...</p>
              </div>
              <div className="admin-drag-meta">
                <span className={`admin-status-badge ${section.active ? 'active' : 'inactive'}`}>
                  {section.active ? 'Active' : 'Inactive'}
                </span>
                <span className="admin-drag-layout">{section.layout}</span>
              </div>
              <div className="admin-drag-actions">
                <button className="admin-btn-icon" onClick={() => handleEdit(section)} title="Edit">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </button>
                <button className="admin-btn-icon" onClick={() => handleToggleActive(section)} title={section.active ? 'Deactivate' : 'Activate'}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{section.active ? <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" /> : <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />} /></svg>
                </button>
                <button className="admin-btn-icon admin-btn-danger" onClick={() => handleDelete(section.key)} title="Delete">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {sections.length === 0 && (
          <div className="admin-empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
            <h3>No story sections yet</h3>
            <p>Create your first story section to get started</p>
            <button className="admin-btn admin-btn-primary" onClick={handleAddNew}>Add Section</button>
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
    id: item.dataset.key,
    key: item.dataset.key,
    order: index,
  }));
  e.currentTarget.onDrop(newOrder);
}

function handleDrop(items) {
  // Handled by parent
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