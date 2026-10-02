import { useEffect, useState } from 'react';
import { productsApi, mediaApi } from '../../api/adminApi';
import toast from 'react-hot-toast';
import './AdminProducts.css';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(initialFormState());

  useEffect(() => {
    loadProducts();
    loadMedia();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await productsApi.list({ includeInactive: 'true', limit: 200 });
      setProducts(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load products');
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
      name: '',
      slug: '',
      shortDescription: '',
      description: '',
      sku: '',
      category: '',
      materials: '',
      dimensions: { width: '', height: '', depth: '', unit: 'cm' },
      price: '',
      currency: 'INR',
      inStock: true,
      featured: false,
      images: [],
      order: 0,
      active: true,
    };
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDimensionChange = (dim, value) => {
    setFormData(prev => ({ ...prev, dimensions: { ...prev.dimensions, [dim]: value } }));
  };

  const handleImageChange = (index, url) => {
    const newImages = [...formData.images];
    newImages[index] = { ...newImages[index], url };
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addImage = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, { url: '', alt: '', caption: '' }] }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: formData.price ? Number(formData.price) : null,
        materials: formData.materials.split(',').map(m => m.trim()).filter(Boolean),
        dimensions: {
          width: formData.dimensions.width ? Number(formData.dimensions.width) : null,
          height: formData.dimensions.height ? Number(formData.dimensions.height) : null,
          depth: formData.dimensions.depth ? Number(formData.dimensions.depth) : null,
          unit: formData.dimensions.unit,
        },
        images: formData.images.filter(img => img.url).map(img => ({ url: img.url, alt: img.alt, caption: img.caption })),
        order: Number(formData.order) || 0,
      };

      if (editingProduct) {
        await productsApi.update(editingProduct.id, payload);
        toast.success('Product updated');
      } else {
        await productsApi.create(payload);
        toast.success('Product created');
      }
      closeForm();
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug || '',
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      sku: product.sku || '',
      category: product.category || '',
      materials: (product.materials || []).join(', '),
      dimensions: product.dimensions || { width: '', height: '', depth: '', unit: 'cm' },
      price: product.price || '',
      currency: product.currency || 'INR',
      inStock: product.inStock !== false,
      featured: product.featured || false,
      images: (product.images || []).map(img => ({ url: img.url, alt: img.alt || '', caption: img.caption || '' })),
      order: product.order || 0,
      active: product.active !== false,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsApi.delete(id);
      toast.success('Product deleted');
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Delete failed');
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await productsApi.update(product.id, { active: !product.active });
      toast.success(`Product ${product.active ? 'deactivated' : 'activated'}`);
      loadProducts();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData(initialFormState());
  };

  const handleAddNew = () => {
    closeForm();
    setFormData(initialFormState());
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <div className="admin-loading">Loading products...</div>;
  }

  return (
    <div className="admin-products">
      <header className="admin-page-header">
        <h1 className="admin-page-title">Products</h1>
        <p className="admin-page-subtitle">Manage all products on the website</p>
      </header>

      <div className="admin-toolbar">
        <button className="admin-btn admin-btn-primary" onClick={handleAddNew}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Product
        </button>
      </div>

      {showForm && (
        <section className="admin-form-section">
          <div className="admin-form-header">
            <h2 className="admin-form-title">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <button type="button" className="admin-btn-icon" onClick={closeForm}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="admin-form">
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
              <label className="admin-form-label">Short Description</label>
              <textarea className="admin-form-textarea" value={formData.shortDescription} onChange={(e) => handleChange('shortDescription', e.target.value)} rows={2} placeholder="Brief description for cards" />
            </div>

            <div className="admin-form-field">
              <label className="admin-form-label">Full Description</label>
              <textarea className="admin-form-textarea" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} rows={4} />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-field">
                <label className="admin-form-label">SKU</label>
                <input className="admin-form-input" value={formData.sku} onChange={(e) => handleChange('sku', e.target.value)} />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Category</label>
                <input className="admin-form-input" value={formData.category} onChange={(e) => handleChange('category', e.target.value)} placeholder="e.g., Planters, Baskets, Storage" />
              </div>
            </div>

            <div className="admin-form-field">
              <label className="admin-form-label">Materials (comma separated)</label>
              <input className="admin-form-input" value={formData.materials} onChange={(e) => handleChange('materials', e.target.value)} placeholder="Banana fiber, Natural dyes" />
            </div>

            <fieldset className="admin-form-field">
              <legend className="admin-form-label">Dimensions</legend>
              <div className="admin-dimensions-grid">
                <div>
                  <label className="admin-form-label">Width</label>
                  <input type="number" className="admin-form-input" step="0.1" min="0" value={formData.dimensions.width} onChange={(e) => handleDimensionChange('width', e.target.value)} />
                </div>
                <div>
                  <label className="admin-form-label">Height</label>
                  <input type="number" className="admin-form-input" step="0.1" min="0" value={formData.dimensions.height} onChange={(e) => handleDimensionChange('height', e.target.value)} />
                </div>
                <div>
                  <label className="admin-form-label">Depth</label>
                  <input type="number" className="admin-form-input" step="0.1" min="0" value={formData.dimensions.depth} onChange={(e) => handleDimensionChange('depth', e.target.value)} />
                </div>
                <div>
                  <label className="admin-form-label">Unit</label>
                  <select className="admin-form-input" value={formData.dimensions.unit} onChange={(e) => handleDimensionChange('unit', e.target.value)}>
                    <option value="cm">cm</option>
                    <option value="in">in</option>
                    <option value="mm">mm</option>
                  </select>
                </div>
              </div>
            </fieldset>

            <div className="admin-form-row">
              <div className="admin-form-field">
                <label className="admin-form-label">Price</label>
                <input type="number" className="admin-form-input" step="0.01" min="0" value={formData.price} onChange={(e) => handleChange('price', e.target.value)} />
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">Currency</label>
                <select className="admin-form-input" value={formData.currency} onChange={(e) => handleChange('currency', e.target.value)}>
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-field">
                <label className="admin-form-label">Order</label>
                <input type="number" className="admin-form-input" min="0" value={formData.order} onChange={(e) => handleChange('order', e.target.value)} />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-field">
                <label className="admin-form-label admin-checkbox-label">
                  <input type="checkbox" checked={formData.inStock} onChange={(e) => handleChange('inStock', e.target.checked)} />
                  In Stock
                </label>
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label admin-checkbox-label">
                  <input type="checkbox" checked={formData.featured} onChange={(e) => handleChange('featured', e.target.checked)} />
                  Featured
                </label>
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label admin-checkbox-label">
                  <input type="checkbox" checked={formData.active} onChange={(e) => handleChange('active', e.target.checked)} />
                  Active
                </label>
              </div>
            </div>

            <fieldset className="admin-form-field">
              <legend className="admin-form-label">Images</legend>
              <div className="admin-images-list">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="admin-image-row">
                    <ImageSelector
                      value={img.url}
                      onChange={(url) => handleImageChange(idx, url)}
                      mediaFiles={mediaFiles}
                      mediaLoading={mediaLoading}
                    />
                    <div className="admin-image-meta">
                      <input className="admin-form-input" placeholder="Alt text" value={img.alt} onChange={(e) => { const n=[...formData.images]; n[idx]={...n[idx],alt:e.target.value}; setFormData({...formData,images:n}); }} />
                      <input className="admin-form-input" placeholder="Caption" value={img.caption} onChange={(e) => { const n=[...formData.images]; n[idx]={...n[idx],caption:e.target.value}; setFormData({...formData,images:n}); }} />
                    </div>
                    <button type="button" className="admin-btn-icon admin-btn-danger" onClick={() => removeImage(idx)} disabled={formData.images.length <= 1}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="admin-btn admin-btn-secondary" onClick={addImage}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:16,height:16}}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Add Image
              </button>
            </fieldset>

            <div className="admin-form-actions">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={closeForm}>Cancel</button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                {saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-table-section">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>
                    <img src={product.images?.[0]?.url || '/images/sphere.png'} alt={product.name} className="admin-table-image" />
                  </td>
                  <td className="admin-table-name">{product.name}</td>
                  <td>{product.category || '-'}</td>
                  <td>{product.price ? `₹${Number(product.price).toLocaleString()}` : '-'}</td>
                  <td>
                    <span className={`admin-status-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-status-badge ${product.featured ? 'featured' : ''}`}>
                      {product.featured ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>{product.order || 0}</td>
                  <td>
                    <span className={`admin-status-badge ${product.active ? 'active' : 'inactive'}`}>
                      {product.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="admin-btn-icon" onClick={() => handleEdit(product)} title="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button className="admin-btn-icon" onClick={() => handleToggleActive(product)} title={product.active ? 'Deactivate' : 'Activate'}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{product.active ? <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" /> : <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />} /></svg>
                      </button>
                      <button className="admin-btn-icon admin-btn-danger" onClick={() => handleDelete(product.id)} title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="admin-empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
            <h3>No products yet</h3>
            <p>Create your first product to get started</p>
            <button className="admin-btn admin-btn-primary" onClick={handleAddNew}>Add Product</button>
          </div>
        )}
      </section>
    </div>
  );
}

function ImageSelector({ value, onChange, mediaFiles, mediaLoading }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="admin-image-selector-compact" onClick={() => setShowModal(true)}>
      {value ? (
        <img src={value} alt="Preview" />
      ) : (
        <span className="admin-image-placeholder">Add image</span>
      )}
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