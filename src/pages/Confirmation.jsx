import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle, Calendar, Clock, Mail, Home, User } from 'lucide-react';
import { useBookNest } from '../context/BookNestContext';
import './Confirmation.css';

const Confirmation = () => {
  const { reservationId } = useParams();
  const { reservationHistory, user } = useBookNest();

  const reservation = reservationHistory.find(r => r.id === reservationId);

  if (!reservation) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-container">
          <div className="error-state">
            <h2>Reservation not found</h2>
            <p>We couldn't find a reservation with ID: {reservationId}</p>
            <Link to="/" className="btn btn-primary">
              <Home size={20} />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // QR code data with all book details
  const qrData = {
    reservationId: reservationId,
    memberName: reservation.userInfo.name,
    memberEmail: reservation.userInfo.email,
    membershipId: reservation.userInfo.membershipId,
    reservedDate: reservation.confirmedAt,
    totalBooks: reservation.items.length,
    books: reservation.items.map(item => ({
      title: item.book.title,
      author: item.book.author,
      isbn: item.book.isbn,
      pickupDate: item.pickupDate,
      dueDate: item.dueDate,
      genre: item.book.genre
    }))
  };

  const qrCodeValue = JSON.stringify(qrData);

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon-wrapper">
            <CheckCircle size={60} />
          </div>
          <h1>Reservation Confirmed!</h1>
          <p>Your books are ready to be picked up</p>
        </div>

        {/* Reservation Details */}
        <div className="confirmation-content">
          <div className="confirmation-main">
            {/* QR Code Section */}
            <div className="qr-section">
              <div className="qr-wrapper">
                <QRCodeSVG 
                  value={qrCodeValue}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="qr-instruction">Show this QR code at the library pickup desk</p>
              
              {/* QR Code Data Display */}
              <div className="qr-data-text">
                <h4>QR Code Contains:</h4>
                <div className="qr-data-item">
                  <strong>Reservation ID:</strong> {qrData.reservationId}
                </div>
                <div className="qr-data-item">
                  <strong>Member:</strong> {qrData.memberName}
                </div>
                <div className="qr-data-item">
                  <strong>Membership ID:</strong> {qrData.membershipId}
                </div>
                <div className="qr-data-item">
                  <strong>Email:</strong> {qrData.memberEmail}
                </div>
                <div className="qr-data-item">
                  <strong>Reserved:</strong> {new Date(qrData.reservedDate).toLocaleString()}
                </div>
                <div className="qr-data-item">
                  <strong>Total Books:</strong> {qrData.totalBooks}
                </div>
                <div className="qr-books-list">
                  <strong>Books:</strong>
                  <ul>
                    {qrData.books.map((book, idx) => (
                      <li key={idx}>
                        <div><strong>{book.title}</strong> by {book.author}</div>
                        <div className="book-meta-text">
                          ISBN: {book.isbn} | Genre: {book.genre}
                        </div>
                        <div className="book-dates-text">
                          Pickup: {new Date(book.pickupDate).toLocaleDateString()} | 
                          Due: {new Date(book.dueDate).toLocaleDateString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Reservation Info */}
            <div className="reservation-info">
              <div className="info-card">
                <span className="info-label">Reservation ID</span>
                <span className="info-value reservation-id">{reservationId}</span>
              </div>
              
              <div className="info-card">
                <span className="info-label">
                  <User size={16} />
                  Reserved By
                </span>
                <span className="info-value">{reservation.userInfo.name}</span>
              </div>

              <div className="info-card">
                <span className="info-label">
                  <Mail size={16} />
                  Email
                </span>
                <span className="info-value">{reservation.userInfo.email}</span>
              </div>

              <div className="info-card">
                <span className="info-label">Total Books</span>
                <span className="info-value">{reservation.items.length} book(s)</span>
              </div>
            </div>
          </div>

          {/* Books List */}
          <div className="reserved-books">
            <h2>Reserved Books</h2>
            <div className="books-list">
              {reservation.items.map((item, index) => (
                <div key={item.book.id} className="book-item">
                  <span className="book-number">{index + 1}</span>
                  <img 
                    src={item.book.coverImage} 
                    alt={item.book.title}
                    className="book-thumb"
                  />
                  <div className="book-details">
                    <h3>{item.book.title}</h3>
                    <p>{item.book.author}</p>
                    <div className="book-dates">
                      <span>
                        <Calendar size={14} />
                        Pickup: {new Date(item.pickupDate).toLocaleDateString()}
                      </span>
                      <span>
                        <Clock size={14} />
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Confirmation Message */}
          <div className="email-notice">
            <Mail size={24} />
            <div>
              <h3>Confirmation Email Sent</h3>
              <p>We've sent a confirmation email to <strong>{reservation.userInfo.email}</strong> with all the reservation details.</p>
            </div>
          </div>

          {/* Important Notes */}
          <div className="important-notes">
            <h3>📋 Important Information</h3>
            <ul>
              <li>Please pick up your books on the scheduled pickup date</li>
              <li>Bring a valid ID and your library membership card</li>
              <li>Late returns incur a fine of $2 per day per book</li>
              <li>You can extend your borrowing period once (7 days) through your dashboard</li>
              <li>Reservations not picked up within 3 days will be cancelled</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <Link to="/dashboard" className="btn btn-secondary">
              <User size={20} />
              Go to Dashboard
            </Link>
            <Link to="/" className="btn btn-primary">
              <Home size={20} />
              Continue Browsing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
