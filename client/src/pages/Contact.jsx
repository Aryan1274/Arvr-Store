import React, { useState } from 'react';
import { Mail, MessageSquare, Send, Loader2, CheckCircle2, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Instagram = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Contact = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/api/contact', formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const socialButtons = [
    {
      name: 'WhatsApp',
      icon: <Phone className="w-5 h-5" />,
      color: 'bg-[#25D366]',
      link: 'https://wa.me/919876543210', // Replace with real number
      label: 'Chat on WhatsApp'
    },
    {
      name: 'Instagram',
      icon: <Instagram className="w-5 h-5" />,
      color: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]',
      link: 'https://instagram.com/arvrstore', // Replace with real link
      label: 'Follow on Instagram'
    }
  ];

  return (
    <div className="w-full mx-auto px-4 lg:px-6 xl:px-10 2xl:px-16 py-12 lg:py-20 min-h-screen bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter mb-4">Get in Touch</h1>
          <p className="text-gray-500 font-medium max-w-xl mx-auto">Have a question or feedback? We're here to help you 24/7. Choose your preferred way to connect.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
          {/* Left Side: Direct Contact */}
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-gray-800 mb-6">Direct Channels</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {socialButtons.map((btn) => (
                <a 
                  key={btn.name}
                  href={btn.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${btn.color} text-white p-6 rounded-[2rem] shadow-xl shadow-gray-200 transition-all hover:scale-[1.03] active:scale-95 flex flex-col items-center justify-center text-center gap-4 group`}
                >
                  <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                    {btn.icon}
                  </div>
                  <span className="font-black text-sm uppercase tracking-widest">{btn.label}</span>
                </a>
              ))}
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-pink-50 p-3 rounded-2xl">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Email Us</h4>
                  <p className="text-gray-500 text-sm">support@arvrstore.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-2xl">
                  <MessageSquare className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Response Time</h4>
                  <p className="text-gray-500 text-sm">Typically within 2-4 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-gray-200 border border-gray-50">
            {submitted ? (
              <div className="text-center py-10 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Message Sent!</h2>
                <p className="text-gray-500 font-medium mb-8">Thank you for reaching out. We'll get back to you at <strong>{formData.email}</strong> very soon.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="bg-gray-900 text-white font-bold px-10 py-4 rounded-2xl hover:bg-black transition-all"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-2xl font-black text-gray-800 mb-6">Send a Message</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-primary/30 focus:bg-white transition-all font-medium"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-primary/30 focus:bg-white transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Message</label>
                    <textarea 
                      name="message"
                      required
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="How can we help you today?"
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-primary/30 focus:bg-white transition-all font-medium resize-none"
                    ></textarea>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold">
                    {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-pink-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-pink-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Send className="w-5 h-5" /> Send Message</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
