import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    const success = await loginWithGoogle(credentialResponse.credential);
    if (success) {
      navigate('/profile');
    } else {
      alert('Login failed. Please try again.');
    }
  };

  const handleError = () => {
    console.error('Google Login Failed');
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-sm border max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
        <p className="text-gray-500 mb-8">Sign in to access your cart, track orders, and checkout faster.</p>
        
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap
            shape="pill"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
