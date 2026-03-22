import sql, { testConnection } from './connection.js';
import dotenv from 'dotenv';

dotenv.config();

const setupDatabase = async () => {
  console.log('🔧 Setting up BookNest database schema...\n');

  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Could not connect to database');
    }

    // Create Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Users table created');

    // Create Books table
    await sql`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        isbn VARCHAR(20) UNIQUE NOT NULL,
        category VARCHAR(100),
        description TEXT,
        cover_image TEXT,
        publication_year INTEGER,
        available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Books table created');

    // Create Cart table

    // Create Cart table
    await sql`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        quantity INTEGER DEFAULT 1,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_id)
      )
    `;
    console.log('✅ Cart table created');

    // Create Reservations table
    await sql`
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        reservation_number VARCHAR(100) UNIQUE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending',
        reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        pickup_date DATE NOT NULL,
        return_date DATE NOT NULL,
        actual_return_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Reservations table created');

    // Create Reviews table
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_id)
      )
    `;
    console.log('✅ Reviews table created');

    // Create Wishlist table
    await sql`
      CREATE TABLE IF NOT EXISTS wishlist (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_id)
      )
    `;
    console.log('✅ Wishlist table created');

    // Create Contact Messages table
    await sql`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Contact messages table created');

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_books_category ON books(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_books_author ON books(author)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_books_available ON books(available)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reviews_book_id ON reviews(book_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id)`;
    console.log('✅ Indexes created');

    console.log('\n🎉 Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
};

setupDatabase();
