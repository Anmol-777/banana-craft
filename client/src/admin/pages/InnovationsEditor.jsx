import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useToast } from '../hooks/useToast';
import MediaSelector from '../components/MediaSelector';

export default function InnovationsEditor() {
  const { success, error } = useToast();
  const [innovations, setInnovations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingInnovation, setEditingInnovation] = useState(null);

  const initialFormData = {
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

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    loadInnovations();
  }, []);

  const loadInnovations = async () => {
    setLoading(true);
    try {
      const res = await api.innovations.list({ includeInactive: 'true', sort: 'order' });
      setInnovations(res.data);
    } catch (err) {
      error('Failed to load innovations');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingInnovation(null);
    setFormData({ ...initialFormData, order: innovations.length });
    setShowModal(true);
  };

  const openEditModal = (innovation) => {
    setEditingInnovation(innovation);
    setFormData({
      ...initialFormData,
      ...innovation,
      images: innovation.images || [],
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingInnovation(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.slug) payload.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (editingInnovation) {
        await api.innovations.update(editingInnovation._id, payload);
        success('Innovation updated');
      } else {
        await api.innovations.create(payload);
        success('Innovation created');
      }
      closeModal();
      loadInnovations();
    } catch (err) {
      error(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this innovation?')) return;
    try {
      await api.innovations.delete(id);
      success('Innovation deleted');
      loadInnovations();
    } catch (err) {
      error('Failed to delete');
    }
  };

  if (loading && innovations.length === 0) {
    return <div style={{padding:'48px',textAlign:'center'}}><div className="animate-spin" style={{width:40,height:40,border:'3px solid var(--admin-border)',borderTopColor:'var(--admin-primary)',borderRadius:'50%',margin:'0 auto'}} /></div>;
  }

  return (
    <div>
      <div className="admin-section-header">
        <h1 className="admin-section-title">Innovations</h1>
        <button className="admin-btn admin-btn-primary" onClick={openCreateModal}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'6px'}}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Innovation
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card-body" style={{padding:0}}>
          {innovations.length === 0 ? (
            <div className="admin-empty" style={{padding:'64px 24px'}}>
              <div className="admin-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:64,height:64}}>
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8" />
                  <path d="M12 17v4" />
                </svg>
              </div>
              <p className="admin-empty-title">No innovations yet</p>
              <div className="admin-empty-action">
                <button className="admin-btn admin-btn-primary" onClick={openCreateModal}>Add Innovation</button>
              </div>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{width:'40px'}}>Order</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Summary</th>
                    <th>Status</th>
                    <th style={{width:'120px'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {innovations.map((innovation) => (
                    <tr key={innovation._id} className="admin-sortable-item">
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
                        {innovation.image ? (
                          <img src={innovation.image} alt={innovation.imageAlt} style={{width:50,height:50,objectFit:'cover',borderRadius:'6px'}} />
                        ) : (
                          <div className="admin-image-placeholder" style={{width:50,height:50}}>No image</div>
                        )}
                      </td>
                      <td style={{fontWeight:500}}>{innovation.name}</td>
                      <td style={{maxWidth:'250px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{innovation.summary}</td>
                      <td>
                        <span className={`admin-badge ${innovation.active ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                          {innovation.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button className="admin-icon-btn" onClick={() => openEditModal(innovation)} title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button className="admin-icon-btn delete" onClick={() => handleDelete(innovation._id)} title="Delete">
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
        <InnovationModal
          innovation={editingInnovation}
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

function InnovationModal({ innovation, formData, onChange, onSubmit, onClose, loading }) {
  return (
    <form onSubmit={onSubmit} className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{maxWidth:'800px'}} onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">{innovation ? 'Edit Innovation' : 'Add Innovation'}</h3>
          <button type="button" className="admin-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="admin-modal-body" style={{maxHeight:'70vh',overflow:'auto'}}>
          <div className="admin-form-group">
            <label htmlFor="inn-name" className="admin-form-label">Name *</label>
            <input
              type="text"
              id="inn-name"
              className="admin-form-input"
              value={formData.name}
              onChange={(e) => onChange({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="inn-slug" className="admin-form-label">Slug</label>
            <input
              type="text"
              id="inn-slug"
              className="admin-form-input"
              value={formData.slug}
              onChange={(e) => onChange({...formData, slug: e.target.value})}
              placeholder="auto-generated from name"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="inn-summary" className="admin-form-label">Summary</label>
            <textarea
              id="inn-summary"
              className="admin-form-textarea"
              value={formData.summary}
              onChange={(e) => onChange({...formData, summary: e.target.value})}
              rows={2}
              placeholder="Brief summary for listing"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="inn-body" className="admin-form-label">Full Description</label>
            <textarea
              id="inn-body"
              className="admin-form-textarea"
              value={formData.body}
              onChange={(e) => onChange({...formData, body: e.target.value})}
              rows={4}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Main Image</label>
            <MediaSelector
              value={formData.image}
              onChange={(url) => onChange({...formData, image: url})}
              previewAlt={formData.imageAlt}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="inn-image-alt" className="admin-form-label">Image Alt Text</label>
            <input
              type="text"
              id="inn-image-alt"
              className="admin-form-input"
              value={formData.imageAlt}
              onChange={(e) => onChange({...formData, imageAlt: e.target.value})}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Additional Images</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
              {formData.images.map((img, i) => (
                <div key={i} style={{ position: 'relative', width: '100px' }}>
                  <img src={img.url} alt={img.alt || ''} style={{width:'100%',aspectRatio:'1',objectFit:'cover',borderRadius:'8px'}} />
                  <button type="button" className="admin-icon-btn delete" style={{position:'absolute',top:'-8px',right:'-8px',zIndex:10}} onClick={(e)=>{e.preventDefault();onChange({...formData, images: formData.images.filter((_,j)=>j!==i)})}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              ))}
              <MediaSelector
                value=""
                onChange={(url) => {
                  if (url) onChange({...formData, images: [...formData.images, { url, alt: '', caption: '' }]});
                }}
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="inn-order" className="admin-form-label">Display Order</label>
              <input
                type="number"
                id="inn-order"
                className="admin-form-input"
                value={formData.order}
                onChange={(e) => onChange({...formData, order: parseInt(e.target.value) || 0})}
                min="0"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  className="admin-checkbox"
                  checked={formData.active}
                  onChange={(e) => onChange({...formData, active: e.target.checked})}
                />
                Active
              </label>
            </div>
          </div>
        </div>

        <div className="admin-modal-footer">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (innovation ? 'Update' : 'Create')}
          </button>
        </div>
      </div>
    </form>
  );
}