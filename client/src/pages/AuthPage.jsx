import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (tab === 'register') {
        if (!form.name || !form.email || !form.password) {
          setError('All fields are required.');
          return;
        }
        const res = await registerUser({ name: form.name, email: form.email, password: form.password });
        login(res.data.user, res.data.token);
        setSuccess('Registered successfully! Redirecting...');
        setTimeout(() => navigate('/'), 1000);
      } else {
        if (!form.email || !form.password) {
          setError('Email and password are required.');
          return;
        }
        const res = await loginUser({ email: form.email, password: form.password });
        login(res.data.user, res.data.token);
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ef-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-7 col-lg-5">

            {/* Logo */}
            <div className="text-center mb-4">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                <span style={{ background: 'linear-gradient(135deg,#6C63FF,#FF6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  ⚡
                </span>
              </div>
              <h1 className="section-title mb-1">Welcome to EventFlow</h1>
              <p className="section-sub">Your event hub — discover, create, RSVP.</p>
            </div>

            <div className="ef-form-card">
              {/* Tabs */}
              <div className="ef-tabs">
                <button
                  id="tab-login"
                  className={`ef-tab ${tab === 'login' ? 'active' : ''}`}
                  onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
                >
                  <i className="bi bi-box-arrow-in-right me-1"></i>Login
                </button>
                <button
                  id="tab-register"
                  className={`ef-tab ${tab === 'register' ? 'active' : ''}`}
                  onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
                >
                  <i className="bi bi-person-plus me-1"></i>Register
                </button>
              </div>

              {/* Alerts */}
              {error   && <div className="ef-alert ef-alert-error   mb-3"><i className="bi bi-exclamation-circle"></i>{error}</div>}
              {success && <div className="ef-alert ef-alert-success mb-3"><i className="bi bi-check-circle"></i>{success}</div>}

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate>
                {tab === 'register' && (
                  <div className="mb-3">
                    <label className="ef-label">Full Name</label>
                    <input
                      id="input-name"
                      type="text"
                      name="name"
                      className="form-control ef-form-control"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={handleChange}
                      autoComplete="name"
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="ef-label">Email Address</label>
                  <input
                    id="input-email"
                    type="email"
                    name="email"
                    className="form-control ef-form-control"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>

                <div className="mb-4">
                  <label className="ef-label">Password</label>
                  <input
                    id="input-password"
                    type="password"
                    name="password"
                    className="form-control ef-form-control"
                    placeholder={tab === 'register' ? 'Min. 6 characters' : '••••••••'}
                    value={form.password}
                    onChange={handleChange}
                    autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
                  />
                </div>

                <button
                  id="btn-auth-submit"
                  type="submit"
                  className="btn-primary-ef w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Please wait...</>
                  ) : (
                    tab === 'login' ? 'Login to EventFlow' : 'Create Account'
                  )}
                </button>
              </form>

              <p className="text-center mt-3" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {tab === 'login'
                  ? <>Don't have an account? <button className="ef-tab" style={{ padding:'0', background:'none', color:'var(--primary-light)' }} onClick={() => setTab('register')}>Sign up</button></>
                  : <>Already have an account? <button className="ef-tab" style={{ padding:'0', background:'none', color:'var(--primary-light)' }} onClick={() => setTab('login')}>Login</button></>
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
