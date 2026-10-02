import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useToast } from '../hooks/useToast';
import MediaSelector from '../components/MediaSelector';

export default function StoryEditor() {
  const { success, error } = useToast();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);

  const initialFormData = {
    key: '',
    title: '',
    body: '',
    image: '',
    imageAlt: '',
    layout: 'image-left',
    order: 0,
    active: true,
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    setLoading(true);
    try {
      const res = await api.story.list({ includeInactive: 'true' });
      setSections(res.data);
    } catch (err) {
      error('Failed to load story sections');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingSection(null);
    setFormData({ ...initialFormData, key: `section-${Date.now()}`, order: sections.length });
    setShowModal(true);
  };

  const openEditModal = (section) => {
    setEditingSection(section);
    setFormData(section);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSection(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.key) payload.key = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (editingSection) {
        await api.story.update(editingSection.key, payload);
        success('Story section updated');
      } else {
        await api.story.create(payload);
        success('Story section created');
      }
      closeModal();
      loadSections();
    } catch (err) {
      error(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (key) => {
    if (!window.confirm('Delete this story section?')) return;
    try {
      await api.story.delete(key);
      success('Section deleted');
      loadSections();
    } catch (err) {
      error('Failed to delete');
    }
  };

  const handleReorder = async () => {
    const items = sections.map((s, i) => ({ key: s.key, order: i }));
    try {
      await api.story.reorder(items);
      success('Order updated');
    } catch (err) {
      error('Failed to update order');
    }
  };

  if (loading && sections.length === 0) {
    return <div style={{padding:'48px',textAlign:'center'}}><div className="animate-spin" style={{width:40,height:40,border:'3px solid var(--admin-border)',borderTopColor:'var(--admin-primary)',borderRadius:'50%',margin:'0 auto'}} /></div>;
  }

  return (
    <div>
      <div className="admin-section-header">
        <h1 className="admin-section-title">Our Story Sections</h1>
        <button className="admin-btn admin-btn-primary" onClick={openCreateModal}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'6px'}}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Section
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card-body" style={{padding:0}}>
          {sections.length === 0 ? (
            <div className="admin-empty" style={{padding:'64px 24px'}}>
              <div className="admin-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:64,height:64}}>
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 17H20" />
                  <path d="M4 14.5A2.5 2.5 0 0 1 6.5 12H20" />
                  <path d="M6.5 12H20" />
                </svg>
              </div>
              <p className="admin-empty-title">No story sections yet</p>
              <div className="admin-empty-action">
                <button className="admin-btn admin-btn-primary" onClick={openCreateModal}>Add Section</button>
              </div>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{width:'40px'}}>Order</th>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Layout</th>
                    <th>Status</th>
                    <th style={{width:'120px'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((section) => (
                    <tr key={section.key} className="admin-sortable-item">
                      <td>
                        <span className="admin-drag-handle">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                          </svg>
                        </span>
                      </td>
                      <td>
                        {section.image ? (
                          <img src={section.image} alt={section.imageAlt} style={{width:50,height:50,objectFit:'cover',borderRadius:'6px'}} />
                        ) : (
                          <div className="admin-image-placeholder" style={{width:50,height:50}}>No image</div>
                        )}
                      </td>
                      <td style={{fontWeight:500}}>{section.title || section.key}</td>
                      <td>{section.layout}</td>
                      <td>
                        <span className={`admin-badge ${section.active ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                          {section.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button className="admin-icon-btn" onClick={() => openEditModal(section)} title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button className="admin-icon-btn delete" onClick={() => handleDelete(section.key)} title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <StoryModal
          section={editingSection}
          formData={formData}
          onChange={setFormData}
          onSubmit={handleSubmit}
          onClose={closeModal}
          loading={loading}
        />
      )}
    </div>
  );
}

function StoryModal({ section, formData, onChange, onSubmit, onClose, loading }) {
  return (
    <form onSubmit={onSubmit} className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{maxWidth:'700px'}} onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">{section ? 'Edit Story Section' : 'Add Story Section'}</h3>
          <button type="button" className="admin-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="admin-modal-body">
          <div className="admin-form-group">
            <label htmlFor="story-key" className="admin-form-label">Key *</label>
            <input
              type="text"
              id="story-key"
              className="admin-form-input"
              value={formData.key}
              onChange={(e) => onChange({...formData, key: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '')})}
              required
              placeholder="e.g., nature-gift, spark-difference"
            />
            <p className="admin-form-help">Unique identifier (lowercase, numbers, dots, dashes, underscores only)</p>
          </div>

          <div className="admin-form-group">
            <label htmlFor="story-title" className="admin-form-label">Title</label>
            <input
              type="text"
              id="story-title"
              className="admin-form-input"
              value={formData.title}
              onChange={(e) => onChange({...formData, title: e.target.value})}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="story-body" className="admin-form-label">Body Text</label>
            <textarea
              id="story-body"
              className="admin-form-textarea"
              value={formData.body}
              onChange={(e) => onChange({...formData, body: e.target.value})}
              rows={5}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Image</label>
            <MediaSelector
              value={formData.image}
              onChange={(url) => onChange({...formData, image: url})}
              previewAlt={formData.imageAlt}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="story-image-alt" className="admin-form-label">Image Alt Text</label>
            <input
              type="text"
              id="story-image-alt"
              className="admin-form-input"
              value={formData.imageAlt}
              onChange={(e) => onChange({...formData, imageAlt: e.target.value})}
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="story-layout" className="admin-form-label">Layout</label>
              <select
                id="story-layout"
                className="admin-form-select"
                value={formData.layout}
                onChange={(e) => onChange({...formData, layout: e.target.value})}
              >
                <option value="image-left">Image Left, Text Right</option>
                <option value="image-right">Image Right, Text Left</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label htmlFor="story-order" className="admin-form-label">Display Order</label>
              <input
                type="number"
                id="story-order"
                className="admin-form-input"
                value={formData.order}
                onChange={(e) => onChange({...formData, order: parseInt(e.target.value) || 0})}
                min="0"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                className="admin-checkbox"
                checked={formData.active}
                onChange={(e) => onChange({...formData, active: e.target.checked})}
              />
              Active (visible on website)
            </label>
          </div>
        </div>

        <div className="admin-modal-footer">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (section ? 'Update' : 'Create')}
          </button>
        </div>
      </div>
    </form>
  );
}