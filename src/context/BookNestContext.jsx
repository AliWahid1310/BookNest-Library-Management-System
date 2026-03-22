import { createContext, useContext, useReducer, useEffect } from 'react';
import { booksData } from '../data/books';

// Initial state
const getInitialState = () => {
  const savedState = localStorage.getItem('bookNestState');
  const savedUser = localStorage.getItem('user');
  const savedToken = localStorage.getItem('token');
  
  if (savedState) {
    const parsed = JSON.parse(savedState);
    return {
      ...parsed,
      books: booksData.map(book => {
        const savedBook = parsed.books?.find(b => b.id === book.id);
        return savedBook ? { ...book, ...savedBook } : book;
      }),
      user: savedUser ? JSON.parse(savedUser) : null,
      token: savedToken || null,
      isAuthenticated: !!savedToken
    };
  }
  return {
    books: booksData,
    cart: [],
    wishlist: [],
    borrowedBooks: [],
    reservationHistory: [],
    user: savedUser ? JSON.parse(savedUser) : null,
    token: savedToken || null,
    isAuthenticated: !!savedToken,
    darkMode: false,
    isLoading: false,
    error: null
  };
};

// Action types
const ACTIONS = {
  SET_BOOKS: 'SET_BOOKS',
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  CLEAR_CART: 'CLEAR_CART',
  ADD_TO_WISHLIST: 'ADD_TO_WISHLIST',
  REMOVE_FROM_WISHLIST: 'REMOVE_FROM_WISHLIST',
  CONFIRM_RESERVATION: 'CONFIRM_RESERVATION',
  CANCEL_RESERVATION: 'CANCEL_RESERVATION',
  EXTEND_BORROWING: 'EXTEND_BORROWING',
  SET_USER: 'SET_USER',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  TOGGLE_DARK_MODE: 'TOGGLE_DARK_MODE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  UPDATE_BOOK_STATUS: 'UPDATE_BOOK_STATUS'
};

// Reducer
const bookNestReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_BOOKS:
      return { ...state, books: action.payload, isLoading: false };
    case ACTIONS.ADD_TO_CART: {
      if (state.cart.length >= 5) {
        return { ...state, error: 'Cannot reserve more than 5 books at a time' };
      }
      if (state.cart.find(item => item.book.id === action.payload.book.id)) {
        return { ...state, error: 'Book already in cart' };
      }
      return {
        ...state,
        cart: [...state.cart, action.payload],
        error: null
      };
    }
    case ACTIONS.REMOVE_FROM_CART:
      return {
        ...state,
        cart: state.cart.filter(item => item.book.id !== action.payload)
      };
    case ACTIONS.CLEAR_CART:
      return { ...state, cart: [] };
    case ACTIONS.ADD_TO_WISHLIST: {
      if (state.wishlist.find(book => book.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        wishlist: [...state.wishlist, action.payload]
      };
    }
    case ACTIONS.REMOVE_FROM_WISHLIST:
      return {
        ...state,
        wishlist: state.wishlist.filter(book => book.id !== action.payload)
      };
    case ACTIONS.CONFIRM_RESERVATION: {
      const { reservationId, items, userInfo } = action.payload;
      const newReservation = {
        id: reservationId,
        items,
        userInfo,
        confirmedAt: new Date().toISOString(),
        status: 'pending-pickup'
      };
      
      // Update book statuses
      const updatedBooks = state.books.map(book => {
        const reservedItem = items.find(item => item.book.id === book.id);
        if (reservedItem) {
          return {
            ...book,
            availableCopies: Math.max(0, book.availableCopies - 1),
            status: book.availableCopies <= 1 ? 'Reserved' : book.status
          };
        }
        return book;
      });

      return {
        ...state,
        books: updatedBooks,
        cart: [],
        reservationHistory: [...state.reservationHistory, newReservation],
        borrowedBooks: [...state.borrowedBooks, ...items.map(item => ({
          ...item,
          reservationId,
          pickedUp: false,
          extended: false
        }))],
        user: {
          ...state.user,
          ...userInfo,
          totalBooksBorrowed: state.user.totalBooksBorrowed + items.length
        }
      };
    }
    case ACTIONS.CANCEL_RESERVATION: {
      const reservation = state.reservationHistory.find(r => r.id === action.payload);
      if (!reservation) return state;

      const updatedBooks = state.books.map(book => {
        const canceledItem = reservation.items.find(item => item.book.id === book.id);
        if (canceledItem) {
          return {
            ...book,
            availableCopies: book.availableCopies + 1,
            status: 'Available'
          };
        }
        return book;
      });

      return {
        ...state,
        books: updatedBooks,
        reservationHistory: state.reservationHistory.map(r =>
          r.id === action.payload ? { ...r, status: 'cancelled' } : r
        ),
        borrowedBooks: state.borrowedBooks.filter(b => b.reservationId !== action.payload)
      };
    }
    case ACTIONS.EXTEND_BORROWING: {
      return {
        ...state,
        borrowedBooks: state.borrowedBooks.map(item =>
          item.book.id === action.payload
            ? {
                ...item,
                dueDate: new Date(new Date(item.dueDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                extended: true
              }
            : item
        )
      };
    }
    case ACTIONS.SET_USER:
      return { ...state, user: { ...state.user, ...action.payload } };
    case ACTIONS.LOGIN:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null
      };
    case ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        cart: [],
        wishlist: [],
        borrowedBooks: []
      };
    case ACTIONS.TOGGLE_DARK_MODE:
      return { ...state, darkMode: !state.darkMode };
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTIONS.UPDATE_BOOK_STATUS:
      return {
        ...state,
        books: state.books.map(book =>
          book.id === action.payload.id ? { ...book, ...action.payload.updates } : book
        )
      };
    default:
      return state;
  }
};

// Context
const BookNestContext = createContext();

// Provider
export const BookNestProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookNestReducer, null, getInitialState);

  // Fetch books from API on mount
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('/api/books');
        if (response.ok) {
          const dbBooks = await response.json();
          // Map database books to frontend format
          const formattedBooks = dbBooks.map(book => ({
            id: book.id,
            title: book.title,
            author: book.author,
            genre: book.category,
            isbn: book.isbn,
            description: book.description,
            coverImage: book.cover_image,
            publicationYear: book.publication_year,
            rating: 4.5,
            totalCopies: 5,
            availableCopies: book.available ? 3 : 0,
            status: book.available ? 'Available' : 'Reserved',
            reviews: [],
            isFeatured: book.id % 3 === 0,
            isNewArrival: book.id % 5 === 0
          }));
          dispatch({ type: ACTIONS.SET_BOOKS, payload: formattedBooks });
        }
      } catch (error) {
        console.error('Failed to fetch books from API:', error);
        // Keep using local books data as fallback
      }
    };
    fetchBooks();
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('bookNestState', JSON.stringify(state));
  }, [state]);

  // Apply dark mode to body
  useEffect(() => {
    document.body.classList.toggle('dark-mode', state.darkMode);
  }, [state.darkMode]);

  // Actions
  const addToCart = (book, pickupDate, duration) => {
    const dueDate = new Date(pickupDate);
    dueDate.setDate(dueDate.getDate() + parseInt(duration));
    dispatch({
      type: ACTIONS.ADD_TO_CART,
      payload: { book, pickupDate, duration: parseInt(duration), dueDate: dueDate.toISOString() }
    });
  };

  const removeFromCart = (bookId) => {
    dispatch({ type: ACTIONS.REMOVE_FROM_CART, payload: bookId });
  };

  const clearCart = () => {
    dispatch({ type: ACTIONS.CLEAR_CART });
  };

  const addToWishlist = (book) => {
    dispatch({ type: ACTIONS.ADD_TO_WISHLIST, payload: book });
  };

  const removeFromWishlist = (bookId) => {
    dispatch({ type: ACTIONS.REMOVE_FROM_WISHLIST, payload: bookId });
  };

  const confirmReservation = async (userInfo) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
      console.error('User not authenticated');
      // Fallback to local-only reservation
      const reservationId = 'RES-' + Date.now().toString(36).toUpperCase();
      dispatch({
        type: ACTIONS.CONFIRM_RESERVATION,
        payload: { reservationId, items: state.cart, userInfo }
      });
      return reservationId;
    }

    try {
      // Format items for the API
      const items = state.cart.map(item => ({
        bookId: item.book.id,
        pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));

      // Create reservation via API
      const response = await fetch('/api/reservations/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          items: items
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Reservation failed:', data.error);
        // Fallback to local-only
        const reservationId = 'RES-' + Date.now().toString(36).toUpperCase();
        dispatch({
          type: ACTIONS.CONFIRM_RESERVATION,
          payload: { reservationId, items: state.cart, userInfo }
        });
        return reservationId;
      }

      // Get the first reservation ID for navigation
      const reservationId = data.reservations?.[0]?.reservation_number || 'RES-' + Date.now().toString(36).toUpperCase();
      
      dispatch({
        type: ACTIONS.CONFIRM_RESERVATION,
        payload: { reservationId, items: state.cart, userInfo }
      });
      
      return reservationId;
    } catch (error) {
      console.error('Error creating reservation:', error);
      // Fallback to local-only reservation
      const reservationId = 'RES-' + Date.now().toString(36).toUpperCase();
      dispatch({
        type: ACTIONS.CONFIRM_RESERVATION,
        payload: { reservationId, items: state.cart, userInfo }
      });
      return reservationId;
    }
  };

  const cancelReservation = (reservationId) => {
    dispatch({ type: ACTIONS.CANCEL_RESERVATION, payload: reservationId });
  };

  const extendBorrowing = (bookId) => {
    dispatch({ type: ACTIONS.EXTEND_BORROWING, payload: bookId });
  };

  const setUser = (userData) => {
    dispatch({ type: ACTIONS.SET_USER, payload: userData });
  };

  const login = (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    dispatch({ type: ACTIONS.LOGIN, payload: { user, token } });
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    dispatch({ type: ACTIONS.LOGOUT });
  };

  const toggleDarkMode = () => {
    dispatch({ type: ACTIONS.TOGGLE_DARK_MODE });
  };

  const clearError = () => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: null });
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    confirmReservation,
    cancelReservation,
    extendBorrowing,
    setUser,
    login,
    logout,
    toggleDarkMode,
    clearError
  };

  return (
    <BookNestContext.Provider value={value}>
      {children}
    </BookNestContext.Provider>
  );
};

// Custom hook
export const useBookNest = () => {
  const context = useContext(BookNestContext);
  if (!context) {
    throw new Error('useBookNest must be used within a BookNestProvider');
  }
  return context;
};
