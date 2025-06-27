import { useState } from 'react';
import { useRouter } from 'next/router';
import API from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await API.post('/auth/login', formData);
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      login(user);
      
      if (user.role === 'BUYER') {
  router.push('/buyer/dashboard');
} else if (user.role === 'SELLER') {
  router.push('/seller/dashboard');
} else {
  router.push('/');
}


    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-2">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-100 p-6 sm:p-8 rounded-xl shadow-xl max-w-md w-full"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="text-indigo-600 font-extrabold text-3xl mb-1">Bidzilla</div>
          <h2 className="text-xl font-semibold text-gray-800">Sign in to your account</h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-1 font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@email.com"
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 mb-1 font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition shadow"
        >
          Login
        </button>

        <div className="text-center mt-5 text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-indigo-600 hover:underline font-medium">
            Register
          </a>
        </div>
      </form>
    </div>
  );
}
