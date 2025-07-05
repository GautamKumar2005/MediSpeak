import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>🏥 Medical History</h1>
        </Link>

        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          {user && (
            <>
              <Link to="/upload" className="nav-link">Upload</Link>
              <Link to="/history" className="nav-link">History</Link>
            </>
          )}
        </nav>

        <div className="auth-section">
          {user ? (
            <div className="user-menu">
              <span className="user-name">Welcome, {user.name}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-btn">Login</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
