import { useState } from 'react';
import { api } from '../utils/api';
import { useToast } from '../hooks/useToast';

export default function MediaSelector({ value, onChange, previewAlt = '' }) {
  const { success, error } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const loadMedia = async (pageNum = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const res = await api.media.list({ page: pageNum, limit: 20, folder: 'general', sort: '-createdAt' });
      const data = res.data;
      if (pageNum === 1) {
        setMediaFiles(data);
      } else {
        setMediaFiles(prev => [...prev, ...data]);
      }
      setHasMore(data.length === 20);
    } catch (err) {
      error('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files) => {
    setUploading(true);
    try {
      const res = await api.media.upload(files, 'general', []);
      success(`${res.data.length} file(s) uploaded`);
      loadMedia(1);
    } catch (err) {
      error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) handleUpload(files);
  };

  const selectImage = (media) => {
    onChange(media.url);
    setShowModal(false);
  };

  if (!showModal && !value) {
    return (
      <button
        type="button"
        className="admin-btn admin-btn-secondary"
        onClick={() => { setShowModal(true); loadMedia(); }}
        style={{ width: '100%' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{marginRight:'8px'}}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8" />
          <path d="M12 17v4" />
          <circle cx="12" cy="10" r="2" />
        </svg>
        Select Image
      </button>
    );
  }

  if (!showModal && value) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src={value} alt={previewAlt} className="admin-image-preview" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {value.split('/').pop()}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-ghost"
            style={{ padding: '4px 10px', fontSize: '12px', marginTop: '4px' }}
            onClick={() => { setShowModal(true); loadMedia(); }}
          >
            Change
          </button>
        </div>
        <button
          type="button"
          className="admin-icon-btn delete"
          onClick={() => onChange('')}
          title="Remove"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
      <div className="admin-modal" style={{maxWidth:'900px'}} onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Media Library</h3>
          <button className="admin-modal-close" onClick={() => setShowModal(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="admin-modal-body">
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input
              type="file"
              id="media-upload"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={uploading}
            />
            <label htmlFor="media-upload" className="admin-btn admin-btn-primary" disabled={uploading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'6px'}}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {uploading ? 'Uploading...' : 'Upload Images'}
            </label>

            <div style={{ flex: 1, minWidth: 200, maxWidth: 400 }}>
              <input
                type="text"
                placeholder="Search media..."
                className="admin-form-input"
                value={search}
                onChange={(e) => { setSearch(e.target.value); loadMedia(1, e.target.value); }}
              />
            </div>
          </div>

          {loading && mediaFiles.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
              <div className="animate-spin" style={{width:40,height:40,border:'3px solid var(--admin-border)',borderTopColor:'var(--admin-primary)',borderRadius:'50%'}} />
            </div>
          ) : mediaFiles.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:64,height:64}}>
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8" />
                  <path d="M12 17v4" />
                  <circle cx="12" cy="10" r="2" />
                </svg>
              </div>
              <p className="admin-empty-title">No images yet</p>
              <p>Upload your first image to get started</p>
              <div className="admin-empty-action">
                <label htmlFor="media-upload" className="admin-btn admin-btn-primary">
                  Upload Images
                </label>
              </div>
            </div>
          ) : (
            <div className="admin-media-grid">
              {mediaFiles.map((media) => (
                <div key={media.id} className="admin-media-item" onClick={() => selectImage(media)}>
                  <img src={media.url} alt={media.alt || media.filename} className="admin-media-image" />
                  <div className="admin-media-info">
                    <div className="admin-media-name">{media.filename}</div>
                    <div className="admin-media-meta">{(media.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <div className="admin-media-actions">
                    <button className="admin-icon-btn" onClick={(e) => { e.stopPropagation(); selectImage(media); }} title="Select">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasMore && !loading && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => { setPage(p => p + 1); loadMedia(page + 1, search); }}
                disabled={loading}
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}