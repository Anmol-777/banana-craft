import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useToast } from '../hooks/useToast';

const statCards = [
  { key: 'products', label: 'Products', icon: ProductsIcon, color: 'var(--admin-primary)' },
  { key: 'innovations', label: 'Innovations', icon: InnovationsIcon, color: '#8e44ad' },
  { key: 'storySections', label: 'Story Sections', icon: StoryIcon, color: '#27ae60' },
  { key: 'galleryItems', label: 'Gallery Items', icon: GalleryIcon, color: '#e67e22' },
  { key: 'media', label: 'Media Files', icon: MediaIcon, color: '#3498db' },
  { key: 'pageContent', label: 'Page Content', icon: ContentIcon, color: '#e74c3c' },
];

function ProductsIcon({ className, color }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={{width:24,height:24}} aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
}
function InnovationsIcon({ className, color }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={{width:24,height:24}} aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /></svg>;
}
function StoryIcon({ className, color }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={{width:24,height:24}} aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 17H20" /><path d="M4 14.5A2.5 2.5 0 0 1 6.5 12H20" /><path d="M6.5 12H20" /></svg>;
}
function GalleryIcon({ className, color }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={{width:24,height:24}} aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /><circle cx="12" cy="10" r="2" /></svg>;
}
function MediaIcon({ className, color }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={{width:24,height:24}} aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /><circle cx="12" cy="10" r="2" /></svg>;
}
function ContentIcon({ className, color }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={{width:24,height:24}} aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 17H20" /><path d="M4 14.5A2.5 2.5 0 0 1 6.5 12H20" /><path d="M6.5 12H20" /></svg>;
}

export default function DashboardPage() {
  const { success, error } = useToast();
  const [stats, setStats] = useState({});
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        api.dashboard.stats(),
        api.dashboard.recentActivity(),
      ]);
      setStats(statsRes.data);
      setActivity(activityRes.data);
    } catch (err) {
      error('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
        <h1 className="admin-section-title">Dashboard</h1>
        <div style={{display:'flex',gap:'12px'}}>
          <Link to="/admin/products" className="admin-btn admin-btn-primary">Manage Products</Link>
          <Link to="/admin/home" className="admin-btn admin-btn-secondary">Edit Homepage</Link>
        </div>
      </div>

      <div className="admin-grid admin-grid-4" style={{marginBottom:'32px'}}>
        {statCards.map((stat) => (
          <div key={stat.key} className="admin-card admin-stat-card">
            <div className="admin-stat-icon" style={{background:`${stat.color}15`,color:stat.color}}>
              <stat.icon color={stat.color} />
            </div>
            <div className="admin-stat-info">
              <div className="admin-stat-value">{stats[stat.key] ?? 0}</div>
              <div className="admin-stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Recent Activity</h2>
        </div>
        <div className="admin-card-body">
          {activity.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:64,height:64}}>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <p className="admin-empty-title">No recent activity</p>
              <p>Changes will appear here as you edit content</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Name</th>
                    <th>Updated</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {activity.slice(0, 10).map((item, i) => (
                    <tr key={`${item.type}-${item.id}-${i}`}>
                      <td>
                        <span className="admin-badge" style={{
                          background: getTypeColor(item.type).bg,
                          color: getTypeColor(item.type).fg
                        }}>
                          {item.type}
                        </span>
                      </td>
                      <td style={{fontWeight:500}}>{item.name}</td>
                      <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-'}</td>
                      <td>
                        {item.active !== undefined ? (
                          <span className={`admin-badge ${item.active ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                            {item.active ? 'Active' : 'Inactive'}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <Link to={`/admin/${getEditPath(item.type)}/${item.id || item.slug}`} className="admin-icon-btn" title="Edit">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getTypeColor(type) {
  const colors = {
    product: { bg: '#fef3e2', fg: '#e67e22' },
    innovation: { bg: '#f5eefc', fg: '#8e44ad' },
    story: { bg: '#e8f8ef', fg: '#27ae60' },
    gallery: { bg: '#fdf0f0', fg: '#c0392b' },
    media: { bg: '#e8f4fd', fg: '#2980b9' },
    pageContent: { bg: '#fef9e7', fg: '#f39c12' },
  };
  return colors[type] || { bg: '#f5f3ef', fg: '#6b6b6b' };
}

function getEditPath(type) {
  const paths = {
    product: 'products',
    innovation: 'innovations',
    story: 'story',
    gallery: 'gallery',
    media: 'media',
    pageContent: 'settings',
  };
  return paths[type] || 'dashboard';
}