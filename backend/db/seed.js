import sql, { testConnection } from './connection.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Book data for seeding
const booksData = [
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    genre: "Fiction",
    isbn: "978-0525559474",
    publisher: "Viking",
    publication_year: 2020,
    page_count: 304,
    cover_image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
    description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.",
    rating: 4.5,
    total_copies: 5,
    available_copies: 3,
    status: "Available",
    is_featured: true,
    is_new_arrival: false
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Non-Fiction",
    isbn: "978-0735211292",
    publisher: "Avery",
    publication_year: 2018,
    page_count: 320,
    cover_image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=400&fit=crop",
    description: "No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear reveals practical strategies that will teach you exactly how to form good habits.",
    rating: 4.8,
    total_copies: 4,
    available_copies: 1,
    status: "Available",
    is_featured: true,
    is_new_arrival: false
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    genre: "Science",
    isbn: "978-0553380163",
    publisher: "Bantam",
    publication_year: 1988,
    page_count: 212,
    cover_image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=300&h=400&fit=crop",
    description: "A landmark volume in science writing by one of the great minds of our time, Stephen Hawking explores such profound questions as: How did the universe begin?",
    rating: 4.6,
    total_copies: 3,
    available_copies: 0,
    status: "Borrowed",
    expected_return_date: "2024-12-15",
    is_featured: false,
    is_new_arrival: false
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    genre: "Technology",
    isbn: "978-0132350884",
    publisher: "Prentice Hall",
    publication_year: 2008,
    page_count: 464,
    cover_image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=300&h=400&fit=crop",
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. This book is a must for any developer.",
    rating: 4.7,
    total_copies: 6,
    available_copies: 4,
    status: "Available",
    is_featured: true,
    is_new_arrival: false
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    genre: "History",
    isbn: "978-0062316097",
    publisher: "Harper",
    publication_year: 2015,
    page_count: 443,
    cover_image: "https://images.unsplash.com/photo-1461360370896-922624d12a74?w=300&h=400&fit=crop",
    description: "From a renowned historian comes a groundbreaking narrative of humanity's creation and evolution that explores the ways in which biology and history have defined us.",
    rating: 4.5,
    total_copies: 4,
    available_copies: 2,
    status: "Available",
    is_featured: false,
    is_new_arrival: true
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    genre: "Finance",
    isbn: "978-0857197689",
    publisher: "Harriman House",
    publication_year: 2020,
    page_count: 256,
    cover_image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=400&fit=crop",
    description: "Timeless lessons on wealth, greed, and happiness. Doing well with money isn't necessarily about what you know. It's about how you behave.",
    rating: 4.6,
    total_copies: 5,
    available_copies: 3,
    status: "Available",
    is_featured: true,
    is_new_arrival: true
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    genre: "Fiction",
    isbn: "978-0441172719",
    publisher: "Ace",
    publication_year: 1965,
    page_count: 688,
    cover_image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=400&fit=crop",
    description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world.",
    rating: 4.7,
    total_copies: 4,
    available_copies: 2,
    status: "Available",
    is_featured: false,
    is_new_arrival: false
  },
  {
    title: "The Design of Everyday Things",
    author: "Don Norman",
    genre: "Technology",
    isbn: "978-0465050659",
    publisher: "Basic Books",
    publication_year: 2013,
    page_count: 368,
    cover_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
    description: "A powerful primer on how and why some products satisfy customers while others only frustrate them.",
    rating: 4.4,
    total_copies: 3,
    available_copies: 2,
    status: "Available",
    is_featured: false,
    is_new_arrival: true
  },
  {
    title: "1984",
    author: "George Orwell",
    genre: "Fiction",
    isbn: "978-0451524935",
    publisher: "Signet Classic",
    publication_year: 1949,
    page_count: 328,
    cover_image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=400&fit=crop",
    description: "A dystopian social science fiction novel and cautionary tale, set in Airstrip One, a province of the superstate Oceania in a world of perpetual war.",
    rating: 4.8,
    total_copies: 5,
    available_copies: 3,
    status: "Available",
    is_featured: true,
    is_new_arrival: false
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    genre: "Non-Fiction",
    isbn: "978-0374533557",
    publisher: "Farrar, Straus and Giroux",
    publication_year: 2011,
    page_count: 499,
    cover_image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&h=400&fit=crop",
    description: "A groundbreaking tour of the mind that explains the two systems that drive the way we think.",
    rating: 4.5,
    total_copies: 4,
    available_copies: 1,
    status: "Available",
    is_featured: false,
    is_new_arrival: false
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    genre: "Fiction",
    isbn: "978-0062315007",
    publisher: "HarperOne",
    publication_year: 1988,
    page_count: 208,
    cover_image: "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=300&h=400&fit=crop",
    description: "A mystical story about Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure.",
    rating: 4.6,
    total_copies: 8,
    available_copies: 5,
    status: "Available",
    is_featured: true,
    is_new_arrival: false
  },
  {
    title: "Educated",
    author: "Tara Westover",
    genre: "Biography",
    isbn: "978-0399590504",
    publisher: "Random House",
    publication_year: 2018,
    page_count: 334,
    cover_image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop",
    description: "A memoir of family, education, and the power of self-invention. Tara Westover was seventeen the first time she set foot in a classroom.",
    rating: 4.7,
    total_copies: 6,
    available_copies: 4,
    status: "Available",
    is_featured: true,
    is_new_arrival: true
  },
  {
    title: "The Power of Now",
    author: "Eckhart Tolle",
    genre: "Non-Fiction",
    isbn: "978-1577314806",
    publisher: "New World Library",
    publication_year: 1997,
    page_count: 236,
    cover_image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=300&h=400&fit=crop",
    description: "A guide to spiritual enlightenment that teaches you how to let go of your mind and embrace the present moment.",
    rating: 4.5,
    total_copies: 5,
    available_copies: 3,
    status: "Available",
    is_featured: false,
    is_new_arrival: false
  },
  {
    title: "You Don't Know JS",
    author: "Kyle Simpson",
    genre: "Technology",
    isbn: "978-1491950357",
    publisher: "O'Reilly",
    publication_year: 2014,
    page_count: 278,
    cover_image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=300&h=400&fit=crop",
    description: "A book series on JavaScript that dives deep into the core mechanisms of the JavaScript language.",
    rating: 4.8,
    total_copies: 6,
    available_copies: 4,
    status: "Available",
    is_featured: true,
    is_new_arrival: false
  },
  {
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen Covey",
    genre: "Non-Fiction",
    isbn: "978-1982137274",
    publisher: "Simon & Schuster",
    publication_year: 1989,
    page_count: 381,
    cover_image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop",
    description: "Powerful lessons in personal change. One of the most inspiring and impactful books ever written.",
    rating: 4.6,
    total_copies: 7,
    available_copies: 5,
    status: "Available",
    is_featured: true,
    is_new_arrival: false
  },
  {
    title: "Becoming",
    author: "Michelle Obama",
    genre: "Biography",
    isbn: "978-1524763138",
    publisher: "Crown",
    publication_year: 2018,
    page_count: 448,
    cover_image: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=300&h=400&fit=crop",
    description: "An intimate, powerful, and inspiring memoir by the former First Lady of the United States.",
    rating: 4.8,
    total_copies: 5,
    available_copies: 3,
    status: "Available",
    is_featured: true,
    is_new_arrival: true
  },
  {
    title: "The Lean Startup",
    author: "Eric Ries",
    genre: "Business",
    isbn: "978-0307887894",
    publisher: "Crown Business",
    publication_year: 2011,
    page_count: 336,
    cover_image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=300&h=400&fit=crop",
    description: "How today's entrepreneurs use continuous innovation to create radically successful businesses.",
    rating: 4.5,
    total_copies: 4,
    available_copies: 2,
    status: "Available",
    is_featured: false,
    is_new_arrival: false
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Fiction",
    isbn: "978-0061120084",
    publisher: "Harper Perennial",
    publication_year: 1960,
    page_count: 324,
    cover_image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&h=400&fit=crop",
    description: "A gripping, heart-wrenching tale of racial injustice and childhood innocence in the American South.",
    rating: 4.8,
    total_copies: 8,
    available_copies: 5,
    status: "Available",
    is_featured: true,
    is_new_arrival: false
  },
  {
    title: "Man's Search for Meaning",
    author: "Viktor Frankl",
    genre: "Non-Fiction",
    isbn: "978-0807014295",
    publisher: "Beacon Press",
    publication_year: 1946,
    page_count: 165,
    cover_image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&h=400&fit=crop",
    description: "A psychiatrist's experiences in Nazi death camps and lessons about spiritual survival.",
    rating: 4.7,
    total_copies: 5,
    available_copies: 3,
    status: "Available",
    is_featured: true,
    is_new_arrival: false
  },
  {
    title: "The Art of War",
    author: "Sun Tzu",
    genre: "Philosophy",
    isbn: "978-1599869773",
    publisher: "Pax Librorum",
    publication_year: -500,
    page_count: 273,
    cover_image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=400&fit=crop",
    description: "Ancient Chinese military treatise on strategy and tactics, applicable to business and life.",
    rating: 4.4,
    total_copies: 6,
    available_copies: 4,
    status: "Available",
    is_featured: false,
    is_new_arrival: false
  },
  {
    title: "Born a Crime",
    author: "Trevor Noah",
    genre: "Biography",
    isbn: "978-0399588174",
    publisher: "Spiegel & Grau",
    publication_year: 2016,
    page_count: 304,
    cover_image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=400&fit=crop",
    description: "Stories from a South African childhood during and after apartheid.",
    rating: 4.7,
    total_copies: 5,
    available_copies: 3,
    status: "Available",
    is_featured: true,
    is_new_arrival: true
  },
  {
    title: "The Subtle Art of Not Giving a F*ck",
    author: "Mark Manson",
    genre: "Non-Fiction",
    isbn: "978-0062457714",
    publisher: "HarperOne",
    publication_year: 2016,
    page_count: 224,
    cover_image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
    description: "A counterintuitive approach to living a good life.",
    rating: 4.3,
    total_copies: 7,
    available_copies: 5,
    status: "Available",
    is_featured: false,
    is_new_arrival: false
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    genre: "Science Fiction",
    isbn: "978-0593135204",
    publisher: "Ballantine Books",
    publication_year: 2021,
    page_count: 496,
    cover_image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=400&fit=crop",
    description: "A lone astronaut must save the earth in this gripping science fiction thriller.",
    rating: 4.7,
    total_copies: 6,
    available_copies: 4,
    status: "Available",
    is_featured: true,
    is_new_arrival: true
  },
  {
    title: "Start With Why",
    author: "Simon Sinek",
    genre: "Business",
    isbn: "978-1591846444",
    publisher: "Portfolio",
    publication_year: 2009,
    page_count: 256,
    cover_image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=300&h=400&fit=crop",
    description: "How great leaders inspire everyone to take action.",
    rating: 4.5,
    total_copies: 4,
    available_copies: 2,
    status: "Available",
    is_featured: false,
    is_new_arrival: false
  },
  {
    title: "The Four Agreements",
    author: "Don Miguel Ruiz",
    genre: "Non-Fiction",
    isbn: "978-1878424310",
    publisher: "Amber-Allen",
    publication_year: 1997,
    page_count: 138,
    cover_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
    description: "A practical guide to personal freedom based on ancient Toltec wisdom.",
    rating: 4.6,
    total_copies: 6,
    available_copies: 4,
    status: "Available",
    is_featured: false,
    is_new_arrival: false
  },
  {
    title: "Grit",
    author: "Angela Duckworth",
    genre: "Non-Fiction",
    isbn: "978-1501111105",
    publisher: "Scribner",
    publication_year: 2016,
    page_count: 352,
    cover_image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=300&h=400&fit=crop",
    description: "The power of passion and perseverance.",
    rating: 4.4,
    total_copies: 7,
    available_copies: 5,
    status: "Available",
    is_featured: false,
    is_new_arrival: false
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    isbn: "978-0547928227",
    publisher: "Mariner Books",
    publication_year: 1937,
    page_count: 366,
    cover_image: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=300&h=400&fit=crop",
    description: "A journey there and back again. The prelude to The Lord of the Rings.",
    rating: 4.8,
    total_copies: 5,
    available_copies: 3,
    status: "Available",
    is_featured: true,
    is_new_arrival: false
  },
  {
    title: "Shoe Dog",
    author: "Phil Knight",
    genre: "Biography",
    isbn: "978-1501135910",
    publisher: "Scribner",
    publication_year: 2016,
    page_count: 400,
    cover_image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=400&fit=crop",
    description: "A memoir by the creator of Nike.",
    rating: 4.6,
    total_copies: 4,
    available_copies: 2,
    status: "Available",
    is_featured: false,
    is_new_arrival: false
  },
  {
    title: "Deep Work",
    author: "Cal Newport",
    genre: "Non-Fiction",
    isbn: "978-1455586691",
    publisher: "Grand Central",
    publication_year: 2016,
    page_count: 296,
    cover_image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=300&h=400&fit=crop",
    description: "Rules for focused success in a distracted world.",
    rating: 4.5,
    total_copies: 5,
    available_copies: 3,
    status: "Available",
    is_featured: false,
    is_new_arrival: true
  },
  {
    title: "The Immortal Life of Henrietta Lacks",
    author: "Rebecca Skloot",
    genre: "Science",
    isbn: "978-1400052189",
    publisher: "Crown",
    publication_year: 2010,
    page_count: 381,
    cover_image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop",
    description: "The story of Henrietta Lacks and the immortal cell line that revolutionized medicine.",
    rating: 4.7,
    total_copies: 6,
    available_copies: 4,
    status: "Available",
    is_featured: true,
    is_new_arrival: false
  }
];

// Sample reviews data
const reviewsData = [
  { book_title: "The Midnight Library", user_name: "BookLover23", rating: 5, comment: "Life-changing read!" },
  { book_title: "The Midnight Library", user_name: "ReadingQueen", rating: 4, comment: "Beautiful and thought-provoking" },
  { book_title: "Atomic Habits", user_name: "ProductivityNerd", rating: 5, comment: "Changed my daily routine completely!" },
  { book_title: "Atomic Habits", user_name: "SelfImprover", rating: 5, comment: "Must read for everyone" },
  { book_title: "Clean Code", user_name: "DevMaster", rating: 5, comment: "Essential for every programmer" },
  { book_title: "Clean Code", user_name: "CodeNewbie", rating: 4, comment: "Great principles to follow" },
  { book_title: "1984", user_name: "ClassicReader", rating: 5, comment: "Hauntingly relevant today" },
  { book_title: "Dune", user_name: "SciFiFan", rating: 5, comment: "Epic worldbuilding!" }
];

// Sample user for testing
const sampleUser = {
  name: "Test User",
  email: "test@booknest.com",
  password_hash: "$2a$10$example", // In real app, use bcrypt
  membership_id: "MEM001",
  role: "member"
};

const seedDatabase = async () => {
  console.log('🌱 Seeding BookNest database...\n');

  try {
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Could not connect to database');
    }

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await sql`DELETE FROM contact_messages`;
    await sql`DELETE FROM wishlist`;
    await sql`DELETE FROM reviews`;
    await sql`DELETE FROM reservations`;
    await sql`DELETE FROM cart`;
    await sql`DELETE FROM books`;
    await sql`DELETE FROM users`;
    console.log('✅ Existing data cleared\n');

    // Create test users
    console.log('👤 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await sql`
      INSERT INTO users (name, email, password, phone, is_admin)
      VALUES 
        ('Ali Wahid', 'ali@example.com', ${hashedPassword}, '555-0101', false),
        ('Sarah', 'sarah@example.com', ${hashedPassword}, '555-0102', false),
        ('Umer Wahid', 'umer@booknest.com', ${hashedPassword}, '555-0100', true)
      RETURNING id, name, email
    `;
    console.log(`✅ Created ${users.length} users`);

    // Insert books with new schema
    console.log('📚 Inserting books...');
    const booksList = [];
    for (const book of booksData) {
      const result = await sql`
        INSERT INTO books (
          title, author, isbn, category, description, cover_image, 
          publication_year, available
        ) VALUES (
          ${book.title}, ${book.author}, ${book.isbn}, ${book.genre},
          ${book.description}, ${book.cover_image}, ${book.publication_year},
          ${book.status === 'Available'}
        )
        RETURNING id
      `;
      booksList.push(result[0].id);
    }
    console.log(`✅ Inserted ${booksData.length} books`);

    // Insert reviews with new schema
    console.log('⭐ Inserting reviews...');
    let reviewCount = 0;
    for (let i = 0; i < reviewsData.length; i++) {
      const review = reviewsData[i];
      const book = await sql`SELECT id FROM books WHERE title = ${review.book_title}`;
      if (book.length > 0) {
        // Alternate between user 1 and user 2 to avoid duplicates
        const userId = (i % 2 === 0) ? users[0].id : users[1].id;
        await sql`
          INSERT INTO reviews (user_id, book_id, rating, comment)
          VALUES (${userId}, ${book[0].id}, ${review.rating}, ${review.comment})
        `;
        reviewCount++;
      }
    }
    console.log(`✅ Inserted ${reviewCount} reviews`);

    // Add some wishlist items
    console.log('💖 Creating wishlist items...');
    await sql`
      INSERT INTO wishlist (user_id, book_id)
      VALUES (${users[0].id}, ${booksList[0]}), (${users[1].id}, ${booksList[1]})
    `;
    console.log('✅ Created 2 wishlist items');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Books: ${booksData.length}`);
    console.log(`   - Reviews: ${reviewCount}`);
    console.log('   - Wishlist items: 2');
    console.log('\n📝 Test Credentials:');
    console.log('   Email: ali@example.com or sarah@example.com or umer@booknest.com');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
