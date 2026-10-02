import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { useToast } from '../hooks/useToast';

export default function MediaLibrary() {
  const { success, error } = useToast();
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('general');
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(new Set());

  const loadMedia = useCallback(async (pageNum = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const res = await api.media.list({ page: pageNum, limit: 50, folder, sort: '-createdAt' });
      const data = res.data;
      if (pageNum === 1) {
        setMediaFiles(data);
        setSelectedFiles(new Set());
      } else {
        setMediaFiles(prev => [...prev, ...data]);
      }
      setHasMore(data.length === 50);
    } catch (err) {
      error('Failed to load media');
    } finally {
      setLoading(false);
    }
  }, [folder, error]);

  useEffect(() => {
    loadMedia(1);
  }, [folder, loadMedia]);

  const handleUpload = async (files) => {
    setUploading(true);
    try {
      const res = await api.media.upload(files, folder, []);
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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await api.media.delete(id);
      success('Image deleted');
      setMediaFiles(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      error('Failed to delete');
    }
  };

  const toggleSelect = (id) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (!selectedFiles.size) return;
    if (!window.confirm(`Delete ${selectedFiles.size} selected images?`)) return;
    try {
      await Promise.all([...selectedFiles].map(id => api.media.delete(id)));
      success(`${selectedFiles.size} images deleted`);
      setMediaFiles(prev => prev.filter(m => !selectedFiles.has(m._id)));
      setSelectedFiles(new Set());
    } catch (err) {
      error('Failed to delete some images');
    }
  };

  const handleFolderChange = (newFolder) => {
    setFolder(newFolder);
    setPage(1);
  };

  if (loading && mediaFiles.length === 0) {
    return <div style={{padding:'48px',textAlign:'center'}}><div className="animate-spin" style={{width:40,height:40,border:'3px solid var(--admin-border)',borderTopColor:'var(--admin-primary)',borderRadius:'50%',margin:'0 auto'}} /></div>;
  }

  const folders = ['general', 'hero', 'products', 'story', 'innovations', 'gallery', 'contact', 'footer'];

  return (
    <div>
      <div className="admin-section-header">
        <h1 className="admin-section-title">Media Library</h1>
        <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
          <select
            className="admin-form-select"
            style={{width:'auto',minWidth:'180px'}}
            value={folder}
            onChange={(e) => handleFolderChange(e.target.value)}
          >
            {folders.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
          </select>
          <input
            type="file"
            id="media-upload"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{display:'none'}}
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
        </div>
      </div>

      {selectedFiles.size > 0 && (
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 24px',background:'#fdf0f0',border:'1px solid var(--admin-danger)',borderRadius:'var(--admin-radius)',marginBottom:'24px'}}>
          <span>{selectedFiles.size} item(s) selected</span>
          <button className="admin-btn admin-btn-danger" onClick={handleBulkDelete}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'6px'}}>
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete Selected
          </button>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-body" style={{padding:0}}>
          <div style={{padding:'16px 24px',borderBottom:'1px solid var(--admin-border)'}}>
            <input
              type="text"
              placeholder="Search media..."
              className="admin-form-input"
              style={{maxWidth:'300px'}}
              value={search}
              onChange={(e) => { setSearch(e.target.value); loadMedia(1, e.target.value); }}
            />
          </div>

          {mediaFiles.length === 0 ? (
            <div className="admin-empty" style={{padding:'64px 24px'}}>
              <div className="admin-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:64,height:64}}>
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8" />
                  <path d="M12 17v4" />
                  <circle cx="12" cy="10" r="2" />
                </svg>
              </div>
              <p className="admin-empty-title">No images in this folder</p>
              <p>Upload your first image to get started</p>
              <div className="admin-empty-action">
                <label htmlFor="media-upload" className="admin-btn admin-btn-primary">Upload Images</label>
              </div>
            </div>
          ) : (
            <div className="admin-media-grid" style={{padding:'24px'}}>
              {mediaFiles.map((media) => (
                <div
                  key={media._id}
                  className={`admin-media-item ${selectedFiles.has(media._id) ? 'selected' : ''}`}
                  onClick={() => toggleSelect(media._id)}
                >
                  <input
                    type="checkbox"
                    className="admin-checkbox"
                    style={{position:'absolute',top:'8px',left:'8px',zIndex:10,width:'18px',height:'18px'}}
                    checked={selectedFiles.has(media._id)}
                    onChange={() => toggleSelect(media._id)}
                  />
                  <img src={media.url} alt={media.alt || media.filename} className="admin-media-image" />
                  <div className="admin-media-info">
                    <div className="admin-media-name">{media.filename}</div>
                    <div className="admin-media-meta">{(media.size / 1024).toFixed(1)} KB • {media.mimeType}</div>
                  </div>
                  <div className="admin-media-actions">
                    <button className="admin-icon-btn delete" onClick={(e) => { e.stopPropagation(); handleDelete(media._id); }} title="Delete">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasMore && !loading && (
            <div style={{padding:'16px 24px',borderTop:'1px solid var(--admin-border)',textAlign:'center'}}>
              <button className="admin-btn admin-btn-secondary" onClick={() => loadMedia(page + 1)} disabled={loading}>
                Load More
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .admin-media-item.selected {
          border-color: var(--admin-primary);
          box-shadow: 0 0 0 2px var(--admin-primary-light);
        }
        .admin-media-item.selected .admin-media-image {
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}