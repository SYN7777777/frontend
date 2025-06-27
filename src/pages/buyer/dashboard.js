import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

export default function BuyerDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.role !== 'BUYER') {
      alert('Only buyers can access this page.');
      router.push('/');
      return;
    }

    const fetchProjects = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ownProjects = res.data.filter((p) => p.buyerId === parsedUser.id);
        setProjects(ownProjects);
      } catch (err) {
        console.error('[BuyerDashboard] Failed to fetch projects', err);
        alert('Failed to load projects.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [router]);

  if (!user || user.role !== 'BUYER') return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-indigo-900 flex items-center gap-3">
              <span>👤</span> Buyer Dashboard
            </h1>
            <span className="text-gray-600 text-sm mt-1 block">
              Welcome, <span className="font-semibold">{user.name}</span>
            </span>
          </div>
          <div className="flex gap-3">
            <Link href="/projects/create">
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-indigo-700 transition">
                ➕ Create New Project
              </button>
            </Link>
            <button
              onClick={() => {
                localStorage.clear();
                router.push('/login');
              }}
              className="bg-white border border-indigo-200 text-indigo-700 px-6 py-3 rounded-lg font-semibold shadow hover:bg-indigo-50 transition"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Projects Section */}
        <section className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-8">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-6 flex items-center gap-2">
            <span>🗂</span> Your Projects
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <svg
                className="animate-spin h-10 w-10 text-indigo-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              <span className="ml-4 text-indigo-600 font-medium text-lg">
                Loading projects...
              </span>
            </div>
          ) : projects.length === 0 ? (
            <p className="text-center text-gray-400 text-lg py-20">
              You have not created any projects yet.
            </p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2">
              {projects.map((proj) => (
                <li
                  key={proj.id}
                  className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition bg-gradient-to-tr from-white to-indigo-50"
                >
                  <Link href={`/projects/${proj.id}`}>
                    <h3 className="text-xl font-bold text-indigo-800 mb-2 truncate hover:underline">
                      {proj.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {proj.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-3 py-1 text-xs rounded-full font-semibold tracking-wide
                        ${proj.status === 'OPEN'
                          ? 'bg-green-100 text-green-700'
                          : proj.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                        }`}>
                        {proj.status}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
