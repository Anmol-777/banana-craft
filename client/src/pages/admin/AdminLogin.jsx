import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/adminApi';
import toast from 'react-hot-toast';
import './AdminLogin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem('adminToken', res.data.data.token);
      toast.success('Welcome back!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <h1 className="admin-login-title">Om Banana Crafts</h1>
            <p className="admin-login-subtitle">CMS Administration</p>
          </div>
          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="admin-form-group">
              <label htmlFor="email" className="admin-form-label">Email</label>
              <input
                type="email"
                id="email"
                className="admin-form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ombanana.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="password" className="admin-form-label">Password</label>
              <input
                type="password"
                id="password"
                className="admin-form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}