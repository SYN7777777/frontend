import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';

export default function SellerDashboard() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) return router.push('/login');

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'SELLER') {
      alert('Only sellers can access this page.');
      return router.push('/');
    }

    setUser(parsedUser);

    const fetchProjects = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/projects/seller', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(res.data);
      } catch (err) {
        console.error('Failed to fetch projects', err);
        alert('Error loading projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [router]);

  const handleUploadClick = (projectId) => {
    setSelectedProjectId(projectId);
    if (fileInputRef.current) fileInputRef.current.value = null; // Reset file input
    fileInputRef.current.click();
  };

 const handleFileChange = async (e) => {
  const file = e.target.files[0];
  const token = localStorage.getItem('token');

  // Debug log
  console.log('Selected project ID:', selectedProjectId, 'File:', file);

  // Robust validation
  if (!file || !selectedProjectId || isNaN(Number(selectedProjectId)) || !token) {
    alert('Missing or invalid project ID.');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('projectId', selectedProjectId);
    formData.append('file', file);

    await axios.post(
      'http://localhost:5000/api/deliverables/upload',
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    alert('✅ Deliverable uploaded!');
    setSelectedProjectId(null);
    window.location.reload();
  } catch (err) {
    console.error('Upload failed:', err);
    alert('❌ Upload failed.');
  }
};


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-indigo-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <p className="text-indigo-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'SELLER') return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept="*"
      />
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-indigo-800 flex items-center gap-2">
            <span>💼</span> Seller Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">Welcome, <span className="font-semibold">{user.name}</span></span>
            <button
              onClick={() => {
                localStorage.clear();
                router.push('/login');
              }}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition font-medium shadow"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="bg-white rounded-2xl shadow-lg p-8 border border-indigo-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-indigo-700 flex items-center gap-2">
              <span>📋</span> Assigned Projects
            </h2>
          </div>

          {projects.length === 0 ? (
            <p className="text-gray-400 text-lg text-center py-12">No assigned projects at the moment.</p>
          ) : (
            <ul className="grid sm:grid-cols-2 gap-6">
              {projects.map((project) => (
                <li key={project.id} className="group border border-gray-100 rounded-xl p-5 bg-gradient-to-tr from-white to-indigo-50 shadow hover:shadow-lg transition hover:-translate-y-1">
                  <Link href={`/projects/${project.id}`}>
                    <h3 className="text-xl font-bold text-indigo-800 group-hover:underline mb-2 truncate">{project.title}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium text-indigo-700">
                        Budget: ₹{project.budgetMin} - ₹{project.budgetMax}
                      </span>
                      <span className="text-gray-500">
                        Deadline: {new Date(project.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`inline-block px-3 py-1 text-xs rounded-full font-semibold tracking-wide 
                      ${project.status === 'OPEN'
                        ? 'bg-green-100 text-green-700'
                        : project.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-700'
                        : project.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                      }`}>
                      {project.status}
                    </span>
                  </Link>

                  {project.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleUploadClick(project.id)}
                      className="mt-4 w-full px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition font-medium"
                    >
                      📤 Upload Deliverable
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
