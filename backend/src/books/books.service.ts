import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';

@Injectable()
export class BooksService {
  constructor(@Inject(DATABASE_CONNECTION) private sql: any) {}

  // Get all books with optional filters
  async findAll(category?: string, search?: string, available?: string) {
    if (search) {
      return this.sql`
        SELECT * FROM books 
        WHERE title ILIKE ${'%' + search + '%'} 
        OR author ILIKE ${'%' + search + '%'}
        ORDER BY title ASC
      `;
    }
    
    if (category) {
      return this.sql`
        SELECT * FROM books WHERE category = ${category} ORDER BY title ASC
      `;
    }
    
    if (available === 'true') {
      return this.sql`
        SELECT * FROM books WHERE available = true ORDER BY title ASC
      `;
    }
    
    return this.sql`SELECT * FROM books ORDER BY title ASC`;
  }

  // Get single book by ID
  async findOne(id: number) {
    const books = await this.sql`SELECT * FROM books WHERE id = ${id}`;
    if (books.length === 0) {
      throw new NotFoundException('Book not found');
    }
    return books[0];
  }

  // Get all categories
  async getCategories() {
    const result = await this.sql`
      SELECT DISTINCT category FROM books WHERE category IS NOT NULL ORDER BY category
    `;
    return result.map((r: any) => r.category);
  }

  // Create new book
  async create(bookData: any) {
    const result = await this.sql`
      INSERT INTO books (title, author, isbn, category, description, cover_image, publication_year, available)
      VALUES (${bookData.title}, ${bookData.author}, ${bookData.isbn}, ${bookData.category}, 
              ${bookData.description}, ${bookData.coverImage}, ${bookData.publicationYear}, true)
      RETURNING *
    `;
    return result[0];
  }

  // Update book
  async update(id: number, bookData: any) {
    const result = await this.sql`
      UPDATE books 
      SET title = ${bookData.title}, author = ${bookData.author}, isbn = ${bookData.isbn},
          category = ${bookData.category}, description = ${bookData.description},
          cover_image = ${bookData.coverImage}, publication_year = ${bookData.publicationYear},
          available = ${bookData.available}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    if (result.length === 0) {
      throw new NotFoundException('Book not found');
    }
    return result[0];
  }

  // Delete book
  async remove(id: number) {
    const result = await this.sql`DELETE FROM books WHERE id = ${id} RETURNING *`;
    if (result.length === 0) {
      throw new NotFoundException('Book not found');
    }
    return { message: 'Book deleted successfully' };
  }
}
