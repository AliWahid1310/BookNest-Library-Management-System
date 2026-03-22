import { useState } from 'react';
import { Search, Filter, Sparkles, TrendingUp, Library, X } from 'lucide-react';
import { genres } from '../data/books';
import BookCard from '../components/BookCard';
import { useBookNest } from '../context/BookNestContext';
import './Home.css';

const Home = () => {
  const { books } = useBookNest();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const featuredBooks = books.filter(book => book.isFeatured);
  const newArrivals = books.filter(book => book.isNewArrival);

  // Filter all books based on search and genre
  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  // Check if user is searching
  const isSearching = searchQuery.trim() !== '' || selectedGenre !== 'All';

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedGenre('All');
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-blob blob-1"></div>
          <div className="hero-blob blob-2"></div>
          <div className="hero-blob blob-3"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Your Digital Library</span>
          </div>
          <h1>Welcome to <span className="gradient-text">BookNest</span></h1>
          <p>Discover your next favorite book from our curated collection of thousands of titles</p>
          
          <div className="search-wrapper">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => setSearchQuery('')}>
                  <X size={18} />
                </button>
              )}
            </div>
            <div className="quick-filters">
              {genres.slice(1).map(genre => (
                <button
                  key={genre}
                  className={`quick-filter ${selectedGenre === genre ? 'active' : ''}`}
                  onClick={() => setSelectedGenre(selectedGenre === genre ? 'All' : genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">{books.length}+</span>
              <span className="stat-label">Books</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">{new Set(books.map(b => b.author)).size}+</span>
              <span className="stat-label">Authors</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-number">{genres.length - 1}</span>
              <span className="stat-label">Categories</span>
            </div>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="floating-book book-1">📚</div>
          <div className="floating-book book-2">📖</div>
          <div className="floating-book book-3">📕</div>
        </div>
      </section>

      {/* Show search results or regular sections */}
      {isSearching ? (
        <section className="section search-results-section">
          <div className="search-results-header">
            <h2 className="section-title">
              <Search size={24} />
              Search Results
              <span className="results-count">{filteredBooks.length} books found</span>
            </h2>
            <button className="clear-all-btn" onClick={clearSearch}>
              <X size={18} />
              Clear filters
            </button>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No books found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <button className="btn btn-primary" onClick={clearSearch}>
                Clear Search
              </button>
            </div>
          ) : (
            <div className="books-grid">
              {filteredBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Featured Books */}
          {featuredBooks.length > 0 && (
            <section className="section featured-section">
              <div className="section-header">
                <h2 className="section-title">
                  <Sparkles className="section-icon" />
                  Featured Books
                </h2>
                <p className="section-subtitle">Handpicked favorites from our librarians</p>
              </div>
              <div className="books-grid featured-grid">
                {featuredBooks.slice(0, 4).map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </section>
          )}

          {/* New Arrivals */}
          {newArrivals.length > 0 && (
            <section className="section new-arrivals-section">
              <div className="section-header">
                <h2 className="section-title">
                  <TrendingUp className="section-icon" />
                  New Arrivals
                </h2>
                <p className="section-subtitle">Fresh additions to our collection</p>
              </div>
              <div className="books-grid">
                {newArrivals.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </section>
          )}

          {/* All Books Catalog */}
          <section className="section catalog-section">
            <div className="section-header catalog-header">
              <div>
                <h2 className="section-title">
                  <Library className="section-icon" />
                  Complete Catalog
                </h2>
                <p className="section-subtitle">Browse our entire collection</p>
              </div>
              
              <div className="filter-container">
                <Filter size={18} />
                <select 
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="genre-filter"
                >
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="books-grid">
              {books.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
