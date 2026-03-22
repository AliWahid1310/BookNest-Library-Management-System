import { Link } from 'react-router-dom';
import { useBookNest } from '../context/BookNestContext';
import { BookOpen, ShoppingCart, User, Sun, Moon, Menu, X, LogIn, LogOut, Heart, Clock } from 'lucide-react';
import { useState } from 'react';
import AuthModal from './AuthModal';
import './Navbar.css';

const Navbar = () => {
  const { darkMode, toggleDarkMode, cart, user, isAuthenticated, login, logout } = useBookNest();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <BookOpen className="brand-icon" />
            <span>BookNest</span>
          </Link>

          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>

          <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          </div>

          <div className="navbar-actions">
            <button className="theme-toggle" onClick={toggleDarkMode} aria-label="Toggle theme">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <Link to="/cart" className="cart-link">
              <ShoppingCart size={20} />
              {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
            </Link>
            
            {isAuthenticated ? (
              <div className="user-menu-wrapper">
                <button 
                  className="user-menu-trigger"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="user-avatar">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="user-name">{user?.name || 'User'}</span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="user-menu-backdrop" onClick={() => setUserMenuOpen(false)} />
                    <div className="user-menu-dropdown">
                      <div className="user-menu-header">
                        <div className="user-avatar-large">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="user-info">
                          <p className="user-display-name">{user?.name}</p>
                          <p className="user-email">{user?.email}</p>
                        </div>
                      </div>
                      
                      <div className="user-menu-divider" />
                      
                      <Link to="/dashboard" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                        <Clock size={18} />
                        <span>My Reservations</span>
                      </Link>
                      
                      <Link to="/dashboard" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                        <Heart size={18} />
                        <span>Wishlist</span>
                      </Link>
                      
                      <div className="user-menu-divider" />
                      
                      <button className="user-menu-item logout-btn" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button className="login-btn" onClick={() => setAuthModalOpen(true)}>
                <LogIn size={18} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={login}
      />
    </>
  );
};

export default Navbar;
