import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';

export default function SettingsEditor() {
  const { success, error } = useToast();
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'admin', label: 'Admin Users' },
    { id: 'password', label: 'Change Password' },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.settings.get();
      setSettings(res.data || {});
    } catch (err) {
      error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => {
      if (!prev) return prev;
      const keys = field.split('.');
      if (keys.length === 1) return { ...prev, [field]: value };
      if (keys.length === 2) return { ...prev, [keys[0]]: { ...prev[keys[0]], [keys[1]]: value } };
      if (keys.length === 3) return { ...prev, [keys[0]]: { ...prev[keys[0]], [keys[1]]: { ...prev[keys[0]][keys[1]], [keys[2]]: value } } };
      return prev;
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await api.settings.update(settings);
      success('Settings saved');
    } catch (err) {
      error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (newPassword !== confirmPassword) {
      error('Passwords do not match');
      return;
    }

    try {
      await api.auth.changePassword(currentPassword, newPassword);
      success('Password changed successfully');
      e.target.reset();
    } catch (err) {
      error(err.message || 'Failed to change password');
    }
  };

  if (loading) {
    return <div style={{padding:'48px',textAlign:'center'}}><div className="animate-spin" style={{width:40,height:40,border:'3px solid var(--admin-border)',borderTopColor:'var(--admin-primary)',borderRadius:'50%',margin:'0 auto'}} /></div>;
  }

  return (
    <div>
      <div className="admin-section-header">
        <h1 className="admin-section-title">Settings</h1>
        {activeTab === 'general' && (
          <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
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

      {activeTab === 'general' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Site Settings</h2>
          </div>
          <div className="admin-card-body">
            <div className="admin-form-group">
              <label htmlFor="site-brand" className="admin-form-label">Brand Name</label>
              <input
                type="text"
                id="site-brand"
                className="admin-form-input"
                value={settings?.brandName || 'Om Banana Crafts'}
                onChange={(e) => handleChange('brandName', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="site-logo" className="admin-form-label">Logo URL</label>
              <input
                type="text"
                id="site-logo"
                className="admin-form-input"
                value={settings?.logo || '/images/logo.jpg'}
                onChange={(e) => handleChange('logo', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="site-logo-alt" className="admin-form-label">Logo Alt Text</label>
              <input
                type="text"
                id="site-logo-alt"
                className="admin-form-input"
                value={settings?.logoAlt || 'Om Banana Crafts'}
                onChange={(e) => handleChange('logoAlt', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="site-tagline" className="admin-form-label">Tagline</label>
              <input
                type="text"
                id="site-tagline"
                className="admin-form-input"
                value={settings?.tagline || ''}
                onChange={(e) => handleChange('tagline', e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Contact Email</label>
              <input
                type="email"
                className="admin-form-input"
                value={settings?.contact?.email || ''}
                onChange={(e) => handleChange('contact.email', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'admin' && (
        <AdminUsersTab />
      )}

      {activeTab === 'password' && (
        <div className="admin-card" style={{maxWidth:'500px'}}>
          <div className="admin-card-header">
            <h2 className="admin-card-title">Change Password</h2>
          </div>
          <div className="admin-card-body">
            <form onSubmit={changePassword}>
              <div className="admin-form-group">
                <label htmlFor="current-password" className="admin-form-label">Current Password</label>
                <input
                  type="password"
                  id="current-password"
                  name="currentPassword"
                  className="admin-form-input"
                  required
                  autoComplete="current-password"
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="new-password" className="admin-form-label">New Password</label>
                <input
                  type="password"
                  id="new-password"
                  name="newPassword"
                  className="admin-form-input"
                  required
                  autoComplete="new-password"
                  minLength={8}
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="confirm-password" className="admin-form-label">Confirm New Password</label>
                <input
                  type="password"
                  id="confirm-password"
                  name="confirmPassword"
                  className="admin-form-input"
                  required
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" className="admin-btn admin-btn-primary">Change Password</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminUsersTab() {
  const { success, error } = useToast();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ email: '', username: '', name: '', password: '', role: 'admin' });

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.auth.me();
      setAdmins([res.data]);
    } catch (err) {
      // Fallback - we can't list admins without a dedicated endpoint
      // Just show current user
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // This would need a create admin endpoint - for now just show info
      success('Admin creation requires backend endpoint');
      setShowModal(false);
    } catch (err) {
      error('Failed to create admin');
    }
  };

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Admin Users</h2>
          <button className="admin-btn admin-btn-secondary" onClick={() => { setFormData({email:'',username:'',name:'',password:'',role:'admin'}); setShowModal(true); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'6px'}}>
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
            </svg>
            Add Admin
          </button>
        </div>
        <div className="admin-card-body">
          {loading ? (
            <div style={{textAlign:'center',padding:'48px'}}><div className="animate-spin" style={{width:32,height:32,border:'3px solid var(--admin-border)',borderTopColor:'var(--admin-primary)',borderRadius:'50%',margin:'0 auto'}} /></div>
          ) : admins.length === 0 ? (
            <div className="admin-empty">
              <p className="admin-empty-title">No admin users loaded</p>
              <p>Admin user listing requires a dedicated API endpoint</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(admin => (
                    <tr key={admin.id}>
                      <td>{admin.name}</td>
                      <td>{admin.email}</td>
                      <td>{admin.username}</td>
                      <td><span className="admin-badge admin-badge-active">{admin.role}</span></td>
                      <td><span className={`admin-badge ${admin.isActive ? 'admin-badge-active' : 'admin-badge-inactive'}`}>{admin.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>{admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : 'Never'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Add Admin User</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="admin-modal-body">
              <div className="admin-form-group">
                <label htmlFor="admin-email" className="admin-form-label">Email</label>
                <input type="email" id="admin-email" className="admin-form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="admin-form-group">
                <label htmlFor="admin-username" className="admin-form-label">Username</label>
                <input type="text" id="admin-username" className="admin-form-input" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
              </div>
              <div className="admin-form-group">
                <label htmlFor="admin-name" className="admin-form-label">Name</label>
                <input type="text" id="admin-name" className="admin-form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="admin-form-group">
                <label htmlFor="admin-password" className="admin-form-label">Password</label>
                <input type="password" id="admin-password" className="admin-form-input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required minLength={8} />
              </div>
              <div className="admin-form-group">
                <label htmlFor="admin-role" className="admin-form-label">Role</label>
                <select id="admin-role" className="admin-form-select" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                </select>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">Create Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}