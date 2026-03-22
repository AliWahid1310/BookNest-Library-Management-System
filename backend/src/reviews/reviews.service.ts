import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';

@Injectable()
export class ReviewsService {
  constructor(@Inject(DATABASE_CONNECTION) private sql: any) {}

  // Get reviews for a book
  async getBookReviews(bookId: number) {
    const reviews = await this.sql`
      SELECT r.*, u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.book_id = ${bookId}
      ORDER BY r.created_at DESC
    `;
    return reviews;
  }

  // Get user's reviews
  async getUserReviews(userId: number) {
    const reviews = await this.sql`
      SELECT r.*, b.title as book_title, b.cover_image
      FROM reviews r
      JOIN books b ON r.book_id = b.id
      WHERE r.user_id = ${userId}
      ORDER BY r.created_at DESC
    `;
    return reviews;
  }

  // Create review
  async createReview(userId: number, bookId: number, rating: number, comment?: string) {
    // Check if book exists
    const books = await this.sql`SELECT id FROM books WHERE id = ${bookId}`;
    if (books.length === 0) {
      throw new NotFoundException('Book not found');
    }

    // Check if user already reviewed
    const existing = await this.sql`
      SELECT id FROM reviews WHERE user_id = ${userId} AND book_id = ${bookId}
    `;
    if (existing.length > 0) {
      throw new ConflictException('You have already reviewed this book');
    }

    // Create review
    const result = await this.sql`
      INSERT INTO reviews (user_id, book_id, rating, comment)
      VALUES (${userId}, ${bookId}, ${rating}, ${comment || null})
      RETURNING *
    `;

    // Update book average rating
    await this.updateBookRating(bookId);

    return { message: 'Review added', review: result[0] };
  }

  // Update review
  async updateReview(userId: number, reviewId: number, rating: number, comment?: string) {
    const result = await this.sql`
      UPDATE reviews 
      SET rating = ${rating}, comment = ${comment || null}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${reviewId} AND user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      throw new NotFoundException('Review not found');
    }

    // Update book average rating
    await this.updateBookRating(result[0].book_id);

    return { message: 'Review updated', review: result[0] };
  }

  // Delete review
  async deleteReview(userId: number, reviewId: number) {
    // Get review first to get book_id
    const reviews = await this.sql`
      SELECT book_id FROM reviews WHERE id = ${reviewId} AND user_id = ${userId}
    `;

    if (reviews.length === 0) {
      throw new NotFoundException('Review not found');
    }

    const bookId = reviews[0].book_id;

    await this.sql`DELETE FROM reviews WHERE id = ${reviewId}`;

    // Update book average rating
    await this.updateBookRating(bookId);

    return { message: 'Review deleted' };
  }

  // Helper: Update book's average rating
  private async updateBookRating(bookId: number) {
    const result = await this.sql`
      SELECT AVG(rating)::numeric(2,1) as avg_rating, COUNT(*) as count
      FROM reviews WHERE book_id = ${bookId}
    `;

    const avgRating = result[0].avg_rating || 0;

    await this.sql`
      UPDATE books SET rating = ${avgRating} WHERE id = ${bookId}
    `;
  }
}
