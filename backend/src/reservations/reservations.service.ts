import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';

@Injectable()
export class ReservationsService {
  constructor(@Inject(DATABASE_CONNECTION) private sql: any) {}

  // Generate unique reservation number
  private generateReservationNumber(): string {
    return 'RES-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  }

  // Get user's reservations
  async getUserReservations(userId: number) {
    const reservations = await this.sql`
      SELECT r.*, b.title, b.author, b.cover_image
      FROM reservations r
      JOIN books b ON r.book_id = b.id
      WHERE r.user_id = ${userId}
      ORDER BY r.created_at DESC
    `;
    return reservations;
  }

  // Get all reservations (admin)
  async getAllReservations() {
    const reservations = await this.sql`
      SELECT r.*, b.title, b.author, u.name as user_name, u.email as user_email
      FROM reservations r
      JOIN books b ON r.book_id = b.id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `;
    return reservations;
  }

  // Create reservation
  async createReservation(userId: number, items: { book_id: number; quantity: number }[], pickupDate: string, notes?: string) {
    // Validate items
    if (!items || items.length === 0) {
      throw new BadRequestException('No items provided');
    }

    // Check book availability
    for (const item of items) {
      const books = await this.sql`
        SELECT id, available, title FROM books WHERE id = ${item.book_id}
      `;
      if (books.length === 0) {
        throw new NotFoundException(`Book with id ${item.book_id} not found`);
      }
      if (!books[0].available) {
        throw new BadRequestException(`"${books[0].title}" is not available`);
      }
    }

    // Calculate return date (14 days from pickup)
    const pickup = new Date(pickupDate);
    const returnDate = new Date(pickup);
    returnDate.setDate(returnDate.getDate() + 14);
    const returnDateStr = returnDate.toISOString().split('T')[0];

    // Create reservations
    const createdReservations = [];
    for (const item of items) {
      const reservationNumber = this.generateReservationNumber();
      
      // Create reservation
      const result = await this.sql`
        INSERT INTO reservations (reservation_number, user_id, book_id, status, pickup_date, return_date)
        VALUES (${reservationNumber}, ${userId}, ${item.book_id}, 'pending', ${pickupDate}, ${returnDateStr})
        RETURNING *
      `;
      createdReservations.push(result[0]);

      // Mark book as unavailable
      await this.sql`
        UPDATE books SET available = false WHERE id = ${item.book_id}
      `;
    }

    return {
      message: 'Reservation created successfully',
      reservations: createdReservations,
    };
  }

  // Update reservation status (admin)
  async updateStatus(reservationId: number, status: string) {
    const validStatuses = ['pending', 'confirmed', 'picked_up', 'returned', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    // Get current reservation
    const reservations = await this.sql`
      SELECT * FROM reservations WHERE id = ${reservationId}
    `;
    if (reservations.length === 0) {
      throw new NotFoundException('Reservation not found');
    }

    const oldStatus = reservations[0].status;
    const bookId = reservations[0].book_id;

    // Update status
    const result = await this.sql`
      UPDATE reservations SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${reservationId}
      RETURNING *
    `;

    // If cancelled or returned, make book available again
    if ((status === 'cancelled' || status === 'returned') && oldStatus !== 'cancelled' && oldStatus !== 'returned') {
      await this.sql`
        UPDATE books SET available = true WHERE id = ${bookId}
      `;
    }

    return { message: 'Status updated', reservation: result[0] };
  }

  // Cancel reservation (user)
  async cancelReservation(userId: number, reservationId: number) {
    const reservations = await this.sql`
      SELECT * FROM reservations WHERE id = ${reservationId} AND user_id = ${userId}
    `;
    if (reservations.length === 0) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservations[0].status === 'picked_up') {
      throw new BadRequestException('Cannot cancel a picked up reservation');
    }

    const bookId = reservations[0].book_id;

    // Update status
    await this.sql`
      UPDATE reservations SET status = 'cancelled' WHERE id = ${reservationId}
    `;

    // Make book available again
    await this.sql`
      UPDATE books SET available = true WHERE id = ${bookId}
    `;

    return { message: 'Reservation cancelled' };
  }
}
