import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useToast } from '../hooks/useToast';
import MediaSelector from '../components/MediaSelector';

export default function ProductsEditor() {
  const { success, error } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');

  const initialFormData = {
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    sku: '',
    category: '',
    materials: [],
    dimensions: { width: null, height: null, depth: null, unit: 'cm' },
    price: null,
    currency: 'INR',
    inStock: true,
    featured: false,
    images: [],
    order: 0,
    active: true,
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    loadProducts();
  }, [page, search]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.products.list({ page, limit: 20, search, includeInactive: 'true', sort: 'order' });
      const data = res.data;
      if (page === 1) setProducts(data);
      else setProducts(prev => [...prev, ...data]);
      setHasMore(data.length === 20);
    } catch (err) {
      error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      ...initialFormData,
      ...product,
      images: product.images || [],
      materials: product.materials || [],
      dimensions: product.dimensions || { width: null, height: null, depth: null, unit: 'cm' },
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.slug) payload.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (editingProduct) {
        await api.products.update(editingProduct._id, payload);
        success('Product updated');
      } else {
        await api.products.create(payload);
        success('Product created');
      }
      closeModal();
      setPage(1);
      loadProducts();
    } catch (err) {
      error(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.products.delete(id);
      success('Product deleted');
      setPage(1);
      loadProducts();
    } catch (err) {
      error('Failed to delete product');
    }
  };

  const handleReorder = async () => {
    const items = products.map((p, i) => ({ id: p._id, order: i }));
    try {
      await api.products.reorder(items);
      success('Order updated');
    } catch (err) {
      error('Failed to update order');
    }
  };

  if (loading && products.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
        <div className="animate-spin" style={{width:40,height:40,border:'3px solid var(--admin-border)',borderTopColor:'var(--admin-primary)',borderRadius:'50%'}} />
      </div>
    );
  }

  return (
    <div>
      <div className="admin-section-header">
        <h1 className="admin-section-title">Products</h1>
        <button className="admin-btn admin-btn-primary" onClick={openCreateModal}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'6px'}}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Product
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card-body" style={{padding:0}}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--admin-border)' }}>
            <input
              type="text"
              placeholder="Search products..."
              className="admin-form-input"
              style={{ maxWidth: '300px' }}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {products.length === 0 ? (
            <div className="admin-empty" style={{padding:'64px 24px'}}>
              <div className="admin-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:64,height:64}}>
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <p className="admin-empty-title">No products yet</p>
              <p>Create your first product to get started</p>
              <div className="admin-empty-action">
                <button className="admin-btn admin-btn-primary" onClick={openCreateModal}>Add Product</button>
              </div>
            </div>
          ) : (
            <>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{width:'40px'}}>Order</th>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th style={{width:'120px'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => (
                      <tr key={product._id} className="admin-sortable-item" data-id={product._id}>
                        <td>
                          <span className="admin-drag-handle" title="Drag to reorder">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <line x1="3" y1="6" x2="21" y2="6" />
                              <line x1="3" y1="12" x2="21" y2="12" />
                              <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                          </span>
                        </td>
                        <td>
                          {product.images?.[0]?.url ? (
                            <img src={product.images[0].url} alt={product.name} style={{width:50,height:50,objectFit:'cover',borderRadius:'6px'}} />
                          ) : (
                            <div className="admin-image-placeholder" style={{width:50,height:50}}>No image</div>
                          )}
                        </td>
                        <td style={{fontWeight:500,maxWidth:'200px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{product.name}</td>
                        <td>{product.category || '-'}</td>
                        <td>{product.price ? `${product.currency || 'INR'} ${product.price}` : '-'}</td>
                        <td>
                          <span className={`admin-badge ${product.inStock ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-badge ${product.active ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                            {product.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="admin-table-actions">
                            <button className="admin-icon-btn" onClick={() => openEditModal(product)} title="Edit">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button className="admin-icon-btn delete" onClick={() => handleDelete(product._id)} title="Delete">
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

              {hasMore && (
                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--admin-border)' }}>
                  <button
                    className="admin-btn admin-btn-secondary"
                    onClick={() => setPage(p => p + 1)}
                    disabled={loading}
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <ProductModal
          product={editingProduct}
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

function ProductModal({ product, formData, onChange, onSubmit, onClose, loading }) {
  return (
    <form onSubmit={onSubmit} className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{maxWidth:'800px'}} onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">{product ? 'Edit Product' : 'Add Product'}</h3>
          <button type="button" className="admin-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="admin-modal-body" style={{maxHeight:'70vh',overflow:'auto'}}>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="prod-name" className="admin-form-label">Name *</label>
              <input
                type="text"
                id="prod-name"
                className="admin-form-input"
                value={formData.name}
                onChange={(e) => onChange({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="prod-slug" className="admin-form-label">Slug</label>
              <input
                type="text"
                id="prod-slug"
                className="admin-form-input"
                value={formData.slug}
                onChange={(e) => onChange({...formData, slug: e.target.value})}
                placeholder="auto-generated from name"
              />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="prod-category" className="admin-form-label">Category</label>
              <input
                type="text"
                id="prod-category"
                className="admin-form-input"
                value={formData.category}
                onChange={(e) => onChange({...formData, category: e.target.value})}
                placeholder="e.g., Baskets, Planters, Storage"
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="prod-sku" className="admin-form-label">SKU</label>
              <input
                type="text"
                id="prod-sku"
                className="admin-form-input"
                value={formData.sku}
                onChange={(e) => onChange({...formData, sku: e.target.value})}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="prod-short-desc" className="admin-form-label">Short Description</label>
            <textarea
              id="prod-short-desc"
              className="admin-form-textarea"
              value={formData.shortDescription}
              onChange={(e) => onChange({...formData, shortDescription: e.target.value})}
              rows={2}
              placeholder="Brief description for product cards"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="prod-desc" className="admin-form-label">Full Description</label>
            <textarea
              id="prod-desc"
              className="admin-form-textarea"
              value={formData.description}
              onChange={(e) => onChange({...formData, description: e.target.value})}
              rows={4}
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="prod-price" className="admin-form-label">Price</label>
              <input
                type="number"
                id="prod-price"
                className="admin-form-input"
                value={formData.price ?? ''}
                onChange={(e) => onChange({...formData, price: e.target.value ? parseFloat(e.target.value) : null})}
                step="0.01"
                min="0"
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="prod-currency" className="admin-form-label">Currency</label>
              <select
                id="prod-currency"
                className="admin-form-select"
                value={formData.currency}
                onChange={(e) => onChange({...formData, currency: e.target.value})}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Materials (comma separated)</label>
              <input
                type="text"
                className="admin-form-input"
                value={formData.materials.join(', ')}
                onChange={(e) => onChange({...formData, materials: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}
                placeholder="Banana fiber, Cotton, Jute"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Dimensions</label>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label htmlFor="dim-width" className="admin-form-label">Width</label>
                <input
                  type="number"
                  id="dim-width"
                  className="admin-form-input"
                  value={formData.dimensions.width ?? ''}
                  onChange={(e) => onChange({...formData, dimensions: {...formData.dimensions, width: e.target.value ? parseFloat(e.target.value) : null}})}
                  step="0.1"
                  min="0"
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="dim-height" className="admin-form-label">Height</label>
                <input
                  type="number"
                  id="dim-height"
                  className="admin-form-input"
                  value={formData.dimensions.height ?? ''}
                  onChange={(e) => onChange({...formData, dimensions: {...formData.dimensions, height: e.target.value ? parseFloat(e.target.value) : null}})}
                  step="0.1"
                  min="0"
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="dim-depth" className="admin-form-label">Depth</label>
                <input
                  type="number"
                  id="dim-depth"
                  className="admin-form-input"
                  value={formData.dimensions.depth ?? ''}
                  onChange={(e) => onChange({...formData, dimensions: {...formData.dimensions, depth: e.target.value ? parseFloat(e.target.value) : null}})}
                  step="0.1"
                  min="0"
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="dim-unit" className="admin-form-label">Unit</label>
                <select
                  id="dim-unit"
                  className="admin-form-select"
                  value={formData.dimensions.unit}
                  onChange={(e) => onChange({...formData, dimensions: {...formData.dimensions, unit: e.target.value}})}
                >
                  <option value="cm">cm</option>
                  <option value="in">in</option>
                  <option value="mm">mm</option>
                </select>
              </div>
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Images</label>
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
              <label htmlFor="prod-order" className="admin-form-label">Display Order</label>
              <input
                type="number"
                id="prod-order"
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
                  checked={formData.inStock}
                  onChange={(e) => onChange({...formData, inStock: e.target.checked})}
                />
                In Stock
              </label>
            </div>
            <div className="admin-form-group">
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  className="admin-checkbox"
                  checked={formData.featured}
                  onChange={(e) => onChange({...formData, featured: e.target.checked})}
                />
                Featured
              </label>
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
            {loading ? 'Saving...' : (product ? 'Update' : 'Create')}
          </button>
        </div>
      </div>
    </form>
  );
}