import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';

@Injectable()
export class CartService {
  constructor(@Inject(DATABASE_CONNECTION) private sql: any) {}

  // Get user's cart
  async getCart(userId: number) {
    const items = await this.sql`
      SELECT c.id, c.quantity, c.created_at,
             b.id as book_id, b.title, b.author, b.price, b.cover_image, b.available_copies
      FROM cart c
      JOIN books b ON c.book_id = b.id
      WHERE c.user_id = ${userId}
      ORDER BY c.created_at DESC
    `;
    return items;
  }

  // Add item to cart
  async addToCart(userId: number, bookId: number, quantity: number = 1) {
    // Check if book exists
    const books = await this.sql`SELECT id, available_copies FROM books WHERE id = ${bookId}`;
    if (books.length === 0) {
      throw new NotFoundException('Book not found');
    }

    if (books[0].available_copies < quantity) {
      throw new BadRequestException('Not enough copies available');
    }

    // Check if already in cart
    const existing = await this.sql`
      SELECT id, quantity FROM cart WHERE user_id = ${userId} AND book_id = ${bookId}
    `;

    if (existing.length > 0) {
      // Update quantity
      const newQty = existing[0].quantity + quantity;
      const result = await this.sql`
        UPDATE cart SET quantity = ${newQty} WHERE id = ${existing[0].id}
        RETURNING *
      `;
      return { message: 'Cart updated', item: result[0] };
    } else {
      // Add new item
      const result = await this.sql`
        INSERT INTO cart (user_id, book_id, quantity)
        VALUES (${userId}, ${bookId}, ${quantity})
        RETURNING *
      `;
      return { message: 'Added to cart', item: result[0] };
    }
  }

  // Update cart item quantity
  async updateQuantity(userId: number, cartId: number, quantity: number) {
    if (quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    const result = await this.sql`
      UPDATE cart SET quantity = ${quantity}
      WHERE id = ${cartId} AND user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      throw new NotFoundException('Cart item not found');
    }

    return { message: 'Quantity updated', item: result[0] };
  }

  // Remove item from cart
  async removeFromCart(userId: number, cartId: number) {
    const result = await this.sql`
      DELETE FROM cart WHERE id = ${cartId} AND user_id = ${userId}
      RETURNING id
    `;

    if (result.length === 0) {
      throw new NotFoundException('Cart item not found');
    }

    return { message: 'Item removed from cart' };
  }

  // Clear entire cart
  async clearCart(userId: number) {
    await this.sql`DELETE FROM cart WHERE user_id = ${userId}`;
    return { message: 'Cart cleared' };
  }
}
