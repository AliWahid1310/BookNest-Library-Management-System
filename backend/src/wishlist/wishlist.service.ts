import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';

@Injectable()
export class WishlistService {
  constructor(@Inject(DATABASE_CONNECTION) private sql: any) {}

  // Get user's wishlist
  async getWishlist(userId: number) {
    const items = await this.sql`
      SELECT w.id, w.created_at,
             b.id as book_id, b.title, b.author, b.price, b.cover_image, b.rating
      FROM wishlist w
      JOIN books b ON w.book_id = b.id
      WHERE w.user_id = ${userId}
      ORDER BY w.created_at DESC
    `;
    return items;
  }

  // Add to wishlist
  async addToWishlist(userId: number, bookId: number) {
    // Check if book exists
    const books = await this.sql`SELECT id FROM books WHERE id = ${bookId}`;
    if (books.length === 0) {
      throw new NotFoundException('Book not found');
    }

    // Check if already in wishlist
    const existing = await this.sql`
      SELECT id FROM wishlist WHERE user_id = ${userId} AND book_id = ${bookId}
    `;
    if (existing.length > 0) {
      throw new ConflictException('Book already in wishlist');
    }

    // Add to wishlist
    const result = await this.sql`
      INSERT INTO wishlist (user_id, book_id)
      VALUES (${userId}, ${bookId})
      RETURNING *
    `;

    return { message: 'Added to wishlist', item: result[0] };
  }

  // Remove from wishlist
  async removeFromWishlist(userId: number, bookId: number) {
    const result = await this.sql`
      DELETE FROM wishlist WHERE user_id = ${userId} AND book_id = ${bookId}
      RETURNING id
    `;

    if (result.length === 0) {
      throw new NotFoundException('Item not found in wishlist');
    }

    return { message: 'Removed from wishlist' };
  }

  // Check if book is in wishlist
  async checkInWishlist(userId: number, bookId: number) {
    const result = await this.sql`
      SELECT id FROM wishlist WHERE user_id = ${userId} AND book_id = ${bookId}
    `;
    return { inWishlist: result.length > 0 };
  }
}
