import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function HomePage() {

   const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role === 'BUYER') router.push('/buyer/dashboard');
    else if (token && role === 'SELLER') router.push('/seller/dashboard');
  }, []);
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-2 sm:px-4">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 py-3 sm:py-4 bg-white shadow z-10">
        <div className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-2 sm:mb-0">
          Bidzilla
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <Link href="/register" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
              Register
            </button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto border border-indigo-600 text-indigo-600 px-4 py-2 rounded hover:bg-indigo-100 transition">
              Login
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="text-center mt-32 sm:mt-40 max-w-md sm:max-w-2xl w-full">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
          Get Projects. Place Bids. Deliver Work Professionally.
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
          A seamless platform for buyers and sellers to connect and collaborate on projects with secure bidding and delivery.
        </p>
        <Link href="/register" className="block">
          <button className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 text-base sm:text-lg rounded shadow hover:bg-indigo-700 transition">
            Get Started
          </button>
        </Link>
      </main>
    </div>
  );
}
