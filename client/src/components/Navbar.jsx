import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar navbar-expand-lg ef-navbar">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand" to="/">
          <i className="bi bi-lightning-charge-fill me-1"></i>EventFlow
        </Link>

        {/* Toggler */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          style={{ color: 'var(--text-muted)' }}
        >
          <i className="bi bi-list fs-4"></i>
        </button>

        <div className="collapse navbar-collapse" id="navbarMain">
          {/* Center Links */}
          <ul className="navbar-nav mx-auto gap-1">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/">
                <i className="bi bi-compass me-1"></i>Explore
              </Link>
            </li>
            {isLoggedIn && (
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/create')}`} to="/create">
                  <i className="bi bi-plus-circle me-1"></i>Create Event
                </Link>
              </li>
            )}
          </ul>

          {/* Right side */}
          <ul className="navbar-nav gap-2 align-items-center">
            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <span
                    className="nav-link"
                    style={{ color: 'var(--primary-light)', cursor: 'default' }}
                  >
                    <i className="bi bi-person-circle me-1"></i>
                    {user?.name}
                  </span>
                </li>
                <li className="nav-item">
                  <button className="btn-outline-ef" onClick={handleLogout} id="btn-logout">
                    <i className="bi bi-box-arrow-right me-1"></i>Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="btn-primary-ef" to="/auth" id="btn-login-nav">
                  <i className="bi bi-person me-1"></i>Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
