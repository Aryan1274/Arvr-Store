import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import CategoryListing from './pages/CategoryListing';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import SearchResults from './pages/SearchResults';
import CollectionDetail from './pages/CollectionDetail';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CouponProvider } from './context/CouponContext';
import WhatsAppButton from './components/WhatsAppButton';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CouponProvider>
          <CartProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col font-sans relative">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/category/:id" element={<CategoryListing />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/collection/:id" element={<CollectionDetail />} />
              <Route path="/collection/:id/card/:cardIndex" element={<CollectionDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsConditions />} />
            </Routes>
          </main>
          <Footer />
          <WhatsAppButton />
        </div>
      </Router>
    </CartProvider>
    </CouponProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
