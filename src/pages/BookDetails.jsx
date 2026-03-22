import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Star, Calendar, BookOpen, Hash, Building, 
  Clock, Heart, ShoppingCart, CheckCircle 
} from 'lucide-react';
import { useBookNest } from '../context/BookNestContext';
import './BookDetails.css';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { books, addToCart, addToWishlist, wishlist, cart, error, clearError } = useBookNest();
  
  const [pickupDate, setPickupDate] = useState('');
  const [duration, setDuration] = useState('14');
  const [showSuccess, setShowSuccess] = useState('');

  const book = books.find(b => b.id === parseInt(id));

  if (!book) {
    return (
      <div className="not-found">
        <h2>Book not found</h2>
        <Link to="/" className="back-link">
          <ArrowLeft /> Back to catalog
        </Link>
      </div>
    );
  }

  const isInWishlist = wishlist.some(b => b.id === book.id);
  const isInCart = cart.some(item => item.book.id === book.id);

  const getMinPickupDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const calculateDueDate = () => {
    if (!pickupDate) return null;
    const due = new Date(pickupDate);
    due.setDate(due.getDate() + parseInt(duration));
    return due.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleReserve = () => {
    if (!pickupDate) {
      alert('Please select a pickup date');
      return;
    }
    clearError();
    addToCart(book, pickupDate, duration);
    if (!error) {
      setShowSuccess('reserve');
      setTimeout(() => setShowSuccess(''), 3000);
    }
  };

  const handleAddToWishlist = () => {
    addToWishlist(book);
    setShowSuccess('wishlist');
    setTimeout(() => setShowSuccess(''), 3000);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`star ${i < Math.floor(rating) ? 'filled' : ''}`} 
          size={20} 
        />
      );
    }
    return stars;
  };

  return (
    <div className="book-details-page">
      <div className="book-details-container">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="book-details-content">
          {/* Book Cover */}
          <div className="book-cover-section">
            <div className="book-cover-wrapper">
              <img src={book.coverImage} alt={book.title} className="book-cover-large" />
              <span className={`status-badge status-${book.status.toLowerCase()}`}>
                {book.status}
              </span>
            </div>
          </div>

          {/* Book Info */}
          <div className="book-info-section">
            <span className="book-genre-tag">{book.genre}</span>
            <h1 className="book-title-large">{book.title}</h1>
            <p className="book-author-large">by {book.author}</p>

            <div className="book-rating-section">
              <div className="stars">{renderStars(book.rating)}</div>
              <span className="rating-text">{book.rating} out of 5</span>
              <span className="reviews-count">({book.reviews.length} reviews)</span>
            </div>

            <div className="book-meta-grid">
              <div className="meta-item">
                <Hash size={18} />
                <span>ISBN: {book.isbn}</span>
              </div>
              <div className="meta-item">
                <Building size={18} />
                <span>Publisher: {book.publisher}</span>
              </div>
              <div className="meta-item">
                <Calendar size={18} />
                <span>Published: {book.publicationYear}</span>
              </div>
              <div className="meta-item">
                <BookOpen size={18} />
                <span>Pages: {book.pageCount}</span>
              </div>
            </div>

            <div className="availability-info">
              <span className="copies-available">
                <strong>{book.availableCopies}</strong> of {book.totalCopies} copies available
              </span>
              {book.expectedReturnDate && (
                <span className="expected-return">
                  <Clock size={16} />
                  Expected return: {new Date(book.expectedReturnDate).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="book-description">
              <h3>Description</h3>
              <p>{book.description}</p>
            </div>

            {/* Reservation Form */}
            {book.status === 'Available' && (
              <div className="reservation-form">
                <h3>Reserve This Book</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Pickup Date</label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      min={getMinPickupDate()}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Borrowing Duration</label>
                    <select 
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="form-input"
                    >
                      <option value="7">7 days</option>
                      <option value="14">14 days</option>
                      <option value="21">21 days</option>
                    </select>
                  </div>
                </div>
                
                {pickupDate && (
                  <div className="due-date-preview">
                    <Calendar size={16} />
                    <span>Due Date: <strong>{calculateDueDate()}</strong></span>
                  </div>
                )}
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <div className="action-buttons">
              {book.status === 'Available' && (
                <button 
                  className={`btn btn-primary ${isInCart ? 'btn-disabled' : ''}`}
                  onClick={handleReserve}
                  disabled={isInCart}
                >
                  {isInCart ? (
                    <>
                      <CheckCircle size={20} />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      Reserve Book
                    </>
                  )}
                </button>
              )}
              
              <button 
                className={`btn btn-secondary ${isInWishlist ? 'btn-wishlisted' : ''}`}
                onClick={handleAddToWishlist}
                disabled={isInWishlist}
              >
                <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
                {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {showSuccess && (
              <div className="success-toast">
                <CheckCircle size={20} />
                {showSuccess === 'reserve' 
                  ? 'Book added to cart!' 
                  : 'Added to wishlist!'}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h2>Reviews</h2>
          <div className="reviews-list">
            {book.reviews.map((review, index) => (
              <div key={index} className="review-card">
                <div className="review-header">
                  <span className="review-user">{review.user}</span>
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
                <span className="review-date">{review.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
