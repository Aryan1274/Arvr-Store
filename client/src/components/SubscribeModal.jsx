import React, { useState } from 'react';
import { X, Mail, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import api from '../api';

const SubscribeModal = ({ isOpen, onClose, onSubscribeSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/api/newsletter/subscribe', { email });
      setMessage({ type: 'success', text: 'You have been subscribed successfully!' });
      setTimeout(() => {
        onClose();
        if (onSubscribeSuccess) onSubscribeSuccess();
      }, 2000);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Something went wrong. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-10 pt-12 text-center">
          <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-primary" />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 tracking-tight">
            Join the Club!
          </h2>
          <p className="text-gray-500 font-medium mb-8">
            Get early access to exclusive drops, deals, and special offers.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input 
                type="email" 
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-primary/30 transition-all font-medium text-gray-800"
              />
            </div>

            {message.text && (
              <div className={`p-3 rounded-xl text-xs font-bold animate-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {message.text}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-pink-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-pink-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Subscribe Now <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-center gap-4 text-gray-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Safe & Secure</span>
            </div>
            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
            <span className="text-[10px] font-black uppercase tracking-widest">No Spam</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscribeModal;
