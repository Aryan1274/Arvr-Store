import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Search, ChevronLeft, Loader2 } from 'lucide-react';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query || '');

  useEffect(() => {
    if (query) {
      fetchResults();
    }
  }, [query]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/products/search?q=${query}`);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${searchInput}`);
    }
  };

  return (
    <div className="bg-[#fdf2f8] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 pt-6">
        {/* Search Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm hover:bg-pink-50 transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <form onSubmit={handleSearch} className="flex-1">
            <div className="flex items-center bg-white rounded-full px-5 py-3 shadow-md border border-pink-100">
              <Search className="w-5 h-5 text-primary mr-3" />
              <input 
                type="text" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products, categories..." 
                className="bg-transparent border-none outline-none text-sm w-full text-gray-800 font-medium"
              />
            </div>
          </form>
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <h1 className="text-xl font-black text-gray-800">
            {loading ? 'Searching...' : `Results for "${query}"`}
          </h1>
          {!loading && <p className="text-sm text-gray-400 font-bold">{products.length} Items Found</p>}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-gray-400 font-bold">Scanning the warehouse...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-pink-50 flex flex-col items-center">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-pink-200" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Oops! No matches.</h2>
            <p className="text-gray-400 max-w-xs mx-auto mb-8 font-medium">We couldn't find anything for that keyword. Try searching for "Keychain" or "Electronics".</p>
            <button onClick={() => navigate('/')} className="bg-gray-800 text-white font-bold px-8 py-3 rounded-2xl hover:bg-black transition-all">
              Go to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
