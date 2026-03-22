import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BookNestProvider } from './context/BookNestContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BookDetails from './pages/BookDetails';
import Cart from './pages/Cart';
import Confirmation from './pages/Confirmation';
import Dashboard from './pages/Dashboard';
import Contact from './pages/Contact';
import './App.css';

function App() {
  return (
    <BookNestProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/book/:id" element={<BookDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/confirmation/:reservationId" element={<Confirmation />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </main>
        </div>
      </Router>
    </BookNestProvider>
  );
}

export default App
