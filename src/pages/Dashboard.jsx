import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, BookOpen, Heart, History, Clock, Calendar,
  RefreshCw, X, ChevronRight, AlertTriangle, CheckCircle
} from 'lucide-react';
import { useBookNest } from '../context/BookNestContext';
import './Dashboard.css';

const Dashboard = () => {
  const { 
    user, borrowedBooks, reservationHistory, wishlist,
    extendBorrowing, cancelReservation, removeFromWishlist,
    isAuthenticated
  } = useBookNest();

  const [activeTab, setActiveTab] = useState('borrowed');
  const [showConfirm, setShowConfirm] = useState(null);

  // Redirect or show message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="empty-state" style={{ minHeight: '60vh' }}>
            <User size={80} style={{ opacity: 0.3 }} />
            <h2>Please Log In</h2>
            <p>You need to be logged in to view your dashboard</p>
            <Link to="/" className="btn btn-primary">Go to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  const pendingReservations = reservationHistory.filter(r => r.status === 'pending-pickup');
  const pastReservations = reservationHistory.filter(r => r.status !== 'pending-pickup');

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPickupTimeRemaining = (pickupDate) => {
    const now = new Date();
    const pickup = new Date(pickupDate);
    // Add 24 hours to pickup date for the deadline
    const deadline = new Date(pickup.getTime() + 24 * 60 * 60 * 1000);
    const diffTime = deadline - now;
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    return diffHours;
  };

  const canExtend = (item) => {
    if (item.extended) return false;
    // Check if no one else has reserved this book
    const bookReservations = pendingReservations.filter(r => 
      r.items.some(i => i.book.id === item.book.id)
    );
    return bookReservations.length <= 1;
  };

  const handleExtend = (bookId) => {
    extendBorrowing(bookId);
    setShowConfirm({ type: 'extended', id: bookId });
    setTimeout(() => setShowConfirm(null), 3000);
  };

  const handleCancel = (reservationId) => {
    cancelReservation(reservationId);
    setShowConfirm({ type: 'cancelled', id: reservationId });
    setTimeout(() => setShowConfirm(null), 3000);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-container">
          {/* User Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              <User size={32} />
            </div>
            <div className="profile-info">
              <h1>{user.name || 'Library Member'}</h1>
              <p>{user.email || 'Complete a reservation to set up your profile'}</p>
              {user.membershipId && (
                <span className="membership-id">ID: {user.membershipId}</span>
              )}
            </div>
            <div className="profile-stats">
              <div className="stat-card">
                <BookOpen size={20} />
                <div>
                  <span className="stat-value">{user.totalBooksBorrowed || 0}</span>
                  <span className="stat-label">Books Borrowed</span>
                </div>
              </div>
              <div className="stat-card">
                <Heart size={20} />
                <div>
                  <span className="stat-value">{wishlist.length}</span>
                  <span className="stat-label">Wishlist</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="dashboard-container">
        {/* Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab ${activeTab === 'borrowed' ? 'active' : ''}`}
            onClick={() => setActiveTab('borrowed')}
          >
            <BookOpen size={18} />
            Borrowed Books
            {borrowedBooks.length > 0 && (
              <span className="tab-badge">{borrowedBooks.length}</span>
            )}
          </button>
          <button 
            className={`tab ${activeTab === 'reservations' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservations')}
          >
            <Calendar size={18} />
            Reservations
            {pendingReservations.length > 0 && (
              <span className="tab-badge">{pendingReservations.length}</span>
            )}
          </button>
          <button 
            className={`tab ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            <Heart size={18} />
            Wishlist
            {wishlist.length > 0 && (
              <span className="tab-badge">{wishlist.length}</span>
            )}
          </button>
          <button 
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={18} />
            History
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Borrowed Books */}
          {activeTab === 'borrowed' && (
            <div className="borrowed-section">
              {borrowedBooks.length === 0 ? (
                <div className="empty-state">
                  <BookOpen size={60} />
                  <h3>No borrowed books</h3>
                  <p>Reserve some books from our catalog to get started!</p>
                  <Link to="/" className="btn btn-primary">Browse Books</Link>
                </div>
              ) : (
                <div className="borrowed-list">
                  {borrowedBooks.map((item) => {
                    const daysRemaining = getDaysRemaining(item.dueDate);
                    const isOverdue = daysRemaining < 0;
                    const isAlmostDue = daysRemaining >= 0 && daysRemaining <= 3;

                    return (
                      <div key={item.book.id} className="borrowed-card">
                        <img 
                          src={item.book.coverImage} 
                          alt={item.book.title}
                          className="borrowed-cover"
                        />
                        <div className="borrowed-info">
                          <h3>{item.book.title}</h3>
                          <p className="author">{item.book.author}</p>
                          
                          <div className="borrowed-dates">
                            <span className="picked-up-date">
                              <CheckCircle size={14} />
                              Picked up: {new Date(item.pickupDate).toLocaleDateString()}
                            </span>
                            <span className={`due-date ${isOverdue ? 'overdue' : isAlmostDue ? 'warning' : ''}`}>
                              <Calendar size={14} />
                              Due: {new Date(item.dueDate).toLocaleDateString()}
                            </span>
                          </div>

                          <div className={`days-badge ${isOverdue ? 'overdue' : isAlmostDue ? 'warning' : 'ok'}`}>
                            {isOverdue ? (
                              <>
                                <AlertTriangle size={16} />
                                {Math.abs(daysRemaining)} days overdue - Return now!
                              </>
                            ) : (
                              <>
                                <Clock size={16} />
                                {daysRemaining} days left to return
                              </>
                            )}
                          </div>

                          {item.extended && (
                            <span className="extended-badge">
                              <CheckCircle size={14} />
                              Extended +7 days
                            </span>
                          )}
                        </div>

                        <div className="borrowed-actions">
                          {canExtend(item) && (
                            <button 
                              className="btn btn-secondary"
                              onClick={() => handleExtend(item.book.id)}
                            >
                              <RefreshCw size={16} />
                              Extend 7 Days
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Reservations */}
          {activeTab === 'reservations' && (
            <div className="reservations-section">
              {pendingReservations.length === 0 ? (
                <div className="empty-state">
                  <Calendar size={60} />
                  <h3>No pending reservations</h3>
                  <p>Your reservations will appear here</p>
                </div>
              ) : (
                <div className="reservations-list">
                  {pendingReservations.map((reservation) => {
                    const firstItem = reservation.items[0];
                    const hoursRemaining = getPickupTimeRemaining(firstItem?.pickupDate);
                    const isExpiringSoon = hoursRemaining <= 6 && hoursRemaining > 0;
                    const isExpired = hoursRemaining <= 0;

                    return (
                      <div key={reservation.id} className="reservation-card">
                        <div className="reservation-header">
                          <div>
                            <span className="reservation-id">{reservation.id}</span>
                            <span className="reservation-status pending">Pending Pickup</span>
                          </div>
                          <span className="reservation-date">
                            Reserved: {new Date(reservation.confirmedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className={`pickup-timer ${isExpired ? 'expired' : isExpiringSoon ? 'warning' : 'ok'}`}>
                          <Clock size={16} />
                          {isExpired ? (
                            <span>Pickup time expired!</span>
                          ) : hoursRemaining <= 24 ? (
                            <span>{hoursRemaining} hours left to pick up</span>
                          ) : (
                            <span>{Math.ceil(hoursRemaining / 24)} days left to pick up</span>
                          )}
                        </div>
                      
                        <div className="reservation-books">
                          {reservation.items.map((item) => (
                            <div key={item.book.id} className="mini-book">
                              <img src={item.book.coverImage} alt={item.book.title} />
                              <div>
                                <h4>{item.book.title}</h4>
                                <p>Pick up by: {new Date(new Date(item.pickupDate).getTime() + 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                      <button 
                        className="cancel-btn"
                        onClick={() => handleCancel(reservation.id)}
                      >
                        <X size={16} />
                        Cancel Reservation
                      </button>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="wishlist-section">
              {wishlist.length === 0 ? (
                <div className="empty-state">
                  <Heart size={60} />
                  <h3>Your wishlist is empty</h3>
                  <p>Save books you want to read later</p>
                  <Link to="/" className="btn btn-primary">Browse Books</Link>
                </div>
              ) : (
                <div className="wishlist-grid">
                  {wishlist.map((book) => (
                    <div key={book.id} className="wishlist-card">
                      <Link to={`/book/${book.id}`}>
                        <img src={book.coverImage} alt={book.title} />
                      </Link>
                      <div className="wishlist-info">
                        <Link to={`/book/${book.id}`}>
                          <h3>{book.title}</h3>
                        </Link>
                        <p>{book.author}</p>
                        <span className={`status ${book.status.toLowerCase()}`}>
                          {book.status}
                        </span>
                      </div>
                      <div className="wishlist-actions">
                        <Link to={`/book/${book.id}`} className="view-btn">
                          <ChevronRight size={20} />
                        </Link>
                        <button 
                          className="remove-btn"
                          onClick={() => removeFromWishlist(book.id)}
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* History */}
          {activeTab === 'history' && (
            <div className="history-section">
              {pastReservations.length === 0 ? (
                <div className="empty-state">
                  <History size={60} />
                  <h3>No reservation history</h3>
                  <p>Your past reservations will appear here</p>
                </div>
              ) : (
                <div className="history-list">
                  {pastReservations.map((reservation) => (
                    <div key={reservation.id} className="history-card">
                      <div className="history-header">
                        <span className="reservation-id">{reservation.id}</span>
                        <span className={`reservation-status ${reservation.status}`}>
                          {reservation.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                        </span>
                      </div>
                      <p className="history-date">
                        {new Date(reservation.confirmedAt).toLocaleDateString()}
                      </p>
                      <p className="history-books">
                        {reservation.items.length} book(s)
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Success Toast */}
        {showConfirm && (
          <div className="success-toast">
            <CheckCircle size={20} />
            {showConfirm.type === 'extended' 
              ? 'Borrowing period extended by 7 days!'
              : 'Reservation cancelled successfully'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
