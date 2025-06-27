import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const CreateProject = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budgetMin: '',
    budgetMax: '',
    deadline: '',
  });

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token) return router.push('/login');
    if (!user) return router.push('/login');

    const parsedUser = JSON.parse(user);

    if (parsedUser.role !== 'BUYER') {
      alert('Only buyers can access this page.');
      return router.push('/');
    }

    setRole('BUYER');
    setLoading(false);
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user?.id) {
      alert('User not authenticated. Please login again.');
      return router.push('/login');
    }

    const payload = {
      ...formData,
      buyerId: user.id
    };

    const response = await axios.post('http://localhost:5000/api/projects', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    alert('✅ Project created successfully!');
  } catch (err) {
    console.error('Creation error:', err);
    alert(`❌ Failed to create project: ${err.response?.data?.message || err.message}`);
  }
};

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-50">
        <div className="text-lg font-medium text-indigo-600 flex items-center gap-2">
          <svg className="animate-spin h-6 w-6 mr-2 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          Checking access...
        </div>
      </div>
    );
  if (role !== 'BUYER') return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-50 px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-md border border-indigo-100 p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-xl space-y-6 animate-fade-in"
        autoComplete="off"
      >
        <h2 className="text-3xl font-extrabold text-indigo-700 mb-2 flex items-center gap-2">
          <span>📝</span> Create New Project
        </h2>
        <p className="text-gray-500 mb-6 text-base">
          Fill out the details below to post your project.
        </p>

        <div className="space-y-2">
          <label className="block font-semibold text-gray-700 mb-1" htmlFor="title">
            Project Title
          </label>
          <input
            id="title"
            name="title"
            placeholder="e.g. Mobile App Development"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 px-4 py-3 rounded-lg transition-all outline-none text-lg bg-indigo-50"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-semibold text-gray-700 mb-1" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe your project requirements..."
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 px-4 py-3 rounded-lg transition-all outline-none text-lg bg-indigo-50"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <label className="block font-semibold text-gray-700 mb-1" htmlFor="budgetMin">
              Minimum Budget
            </label>
            <input
              id="budgetMin"
              name="budgetMin"
              type="number"
              min="0"
              placeholder="e.g. 1000"
              value={formData.budgetMin}
              onChange={handleChange}
              required
              className="w-full border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 px-4 py-3 rounded-lg transition-all outline-none text-lg bg-indigo-50"
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="block font-semibold text-gray-700 mb-1" htmlFor="budgetMax">
              Maximum Budget
            </label>
            <input
              id="budgetMax"
              name="budgetMax"
              type="number"
              min="0"
              placeholder="e.g. 5000"
              value={formData.budgetMax}
              onChange={handleChange}
              required
              className="w-full border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 px-4 py-3 rounded-lg transition-all outline-none text-lg bg-indigo-50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block font-semibold text-gray-700 mb-1" htmlFor="deadline">
            Deadline
          </label>
          <input
            id="deadline"
            name="deadline"
            type="date"
            value={formData.deadline}
            onChange={handleChange}
            required
            className="w-full border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 px-4 py-3 rounded-lg transition-all outline-none text-lg bg-indigo-50"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-lg font-bold px-6 py-3 rounded-lg shadow-lg hover:from-indigo-700 hover:to-blue-600 transition-all duration-150"
        >
          🚀 Create Project
        </button>
      </form>
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(24px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
};

export default CreateProject;
