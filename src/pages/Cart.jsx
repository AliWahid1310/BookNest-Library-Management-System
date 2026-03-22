import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Trash2, Calendar, Clock, ArrowLeft, 
  AlertCircle, CheckCircle 
} from 'lucide-react';
import { useBookNest } from '../context/BookNestContext';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, clearCart, confirmReservation, user, error } = useBookNest();
  
  const [userInfo, setUserInfo] = useState({
    name: user.name || '',
    email: user.email || '',
    membershipId: user.membershipId || ''
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!userInfo.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!userInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!userInfo.membershipId.trim()) {
      newErrors.membershipId = 'Library membership ID is required';
    } else if (!/^[A-Za-z0-9]{6,}$/.test(userInfo.membershipId)) {
      newErrors.membershipId = 'Invalid membership ID format (min 6 alphanumeric characters)';
    }
    
    if (!termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const reservationId = await confirmReservation(userInfo);
      if (reservationId) {
        navigate(`/confirmation/${reservationId}`);
      } else {
        setErrors({ submit: 'Failed to create reservation. Please try again.' });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Reservation error:', error);
      setErrors({ submit: 'An error occurred. Please try again.' });
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <ShoppingCart size={80} className="empty-icon" />
          <h2>Your cart is empty</h2>
          <p>Browse our collection and reserve some books!</p>
          <Link to="/" className="btn btn-primary">
            Browse Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <div className="cart-header-content">
          <h1>
            <ShoppingCart size={24} />
            Reservation Cart
          </h1>
        </div>
      </div>
      <div className="cart-container">
        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items-section">
            <div className="section-header">
              <h1>
                <ShoppingCart size={22} />
                Your Books
              </h1>
              <span className="items-count">{cart.length} / 5 books</span>
            </div>

            {error && (
              <div className="error-banner">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.book.id} className="cart-item">
                  <img 
                    src={item.book.coverImage} 
                    alt={item.book.title}
                    className="item-cover"
                  />
                  <div className="item-details">
                    <h3>{item.book.title}</h3>
                    <p className="item-author">by {item.book.author}</p>
                    <div className="item-dates">
                      <span>
                        <Calendar size={14} />
                        Pickup: {new Date(item.pickupDate).toLocaleDateString()}
                      </span>
                      <span>
                        <Clock size={14} />
                        Duration: {item.duration} days
                      </span>
                    </div>
                    <div className="item-due">
                      Due: {new Date(item.dueDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <button 
                    className="remove-btn"
                    onClick={() => removeFromCart(item.book.id)}
                    aria-label="Remove from cart"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <button className="clear-cart-btn" onClick={clearCart}>
              <Trash2 size={18} />
              Clear All
            </button>
          </div>

          {/* Checkout Form */}
          <div className="checkout-section">
            <h2>Complete Your Reservation</h2>
            
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userInfo.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userInfo.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="membershipId">Library Membership ID *</label>
                <input
                  type="text"
                  id="membershipId"
                  name="membershipId"
                  value={userInfo.membershipId}
                  onChange={handleInputChange}
                  placeholder="e.g., LIB123456"
                  className={errors.membershipId ? 'error' : ''}
                />
                {errors.membershipId && <span className="field-error">{errors.membershipId}</span>}
              </div>

              {/* Summary */}
              <div className="checkout-summary">
                <h3>Reservation Summary</h3>
                <div className="summary-row">
                  <span>Total Books</span>
                  <strong>{cart.length}</strong>
                </div>
                <div className="summary-row">
                  <span>Estimated Pickup</span>
                  <strong>
                    {new Date(Math.min(...cart.map(i => new Date(i.pickupDate)))).toLocaleDateString()}
                  </strong>
                </div>
              </div>

              {/* Late Return Policy */}
              <div className="policy-box">
                <h4>📋 Late Return Policy</h4>
                <p>Books returned after the due date will incur a fine of <strong>$2 per day per book</strong>. 
                Please ensure timely returns to avoid additional charges.</p>
              </div>

              {/* Terms */}
              <div className={`terms-checkbox ${errors.terms ? 'error' : ''}`}>
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (errors.terms) {
                      setErrors(prev => ({ ...prev, terms: '' }));
                    }
                  }}
                />
                <label htmlFor="terms">
                  I agree to the library's terms and conditions, including the late return policy
                </label>
              </div>
              {errors.terms && <span className="field-error">{errors.terms}</span>}

              <button 
                type="submit" 
                className="btn btn-primary submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Confirm Reservation
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
