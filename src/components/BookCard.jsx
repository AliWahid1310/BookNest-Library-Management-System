import { Link } from 'react-router-dom';
import { Star, BookOpen, Users } from 'lucide-react';
import './BookCard.css';

const BookCard = ({ book }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'Available': return 'status-available';
      case 'Reserved': return 'status-reserved';
      case 'Borrowed': return 'status-borrowed';
      default: return '';
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="star filled" size={14} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="star half" size={14} />);
      } else {
        stars.push(<Star key={i} className="star empty" size={14} />);
      }
    }
    return stars;
  };

  return (
    <Link to={`/book/${book.id}`} className="book-card">
      <div className="book-cover-container">
        <img 
          src={book.coverImage} 
          alt={book.title}
          className="book-cover"
          loading="lazy"
        />
        <span className={`book-status ${getStatusClass(book.status)}`}>
          {book.status}
        </span>
        {book.isFeatured && <span className="featured-badge">Featured</span>}
        {book.isNewArrival && <span className="new-badge">New</span>}
      </div>
      
      <div className="book-info">
        <span className="book-genre">{book.genre}</span>
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">by {book.author}</p>
        
        <div className="book-meta">
          <div className="book-rating">
            {renderStars(book.rating)}
            <span className="rating-value">{book.rating}</span>
          </div>
          
          <div className="book-copies">
            <BookOpen size={14} />
            <span>{book.availableCopies}/{book.totalCopies}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
