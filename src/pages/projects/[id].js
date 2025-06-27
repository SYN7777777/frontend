import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const fileInputRef = useRef(null);

  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [bids, setBids] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [bidForm, setBidForm] = useState({
    amount: '',
    message: '',
    etaDays: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) return router.push('/login');

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProject(res.data);

        if (parsedUser.role === 'BUYER' && parsedUser.id === res.data.buyerId) {
          const bidsRes = await axios.get(`http://localhost:5000/api/bids/project/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setBids(bidsRes.data);
        }

        const deliverableRes = await axios.get(`http://localhost:5000/api/deliverables/project/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDeliverables(deliverableRes.data);
      } catch (err) {
        console.error('Failed to load project or deliverables', err);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, router]);

  const handleBidChange = (e) => {
    setBidForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/bids',
        { ...bidForm, projectId: parseInt(id) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('✅ Bid submitted!');
      router.push('/seller/dashboard');
    } catch (err) {
      console.error('Failed to submit bid', err);
      alert('❌ Could not submit bid.');
    }
  };

  const handleAcceptBid = async (bidId) => {
    if (!window.confirm('Are you sure you want to accept this bid?')) return;

    try {
      const token = localStorage.getItem('token');
      const selectedBid = bids.find((b) => b.id === bidId);
      if (!selectedBid) return alert('❌ Invalid bid selected');

      await axios.post(
        'http://localhost:5000/api/projects/accept-bid',
        {
          projectId: project.id,
          sellerId: selectedBid.seller.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('✅ Bid accepted & seller notified!');
      router.reload();
    } catch (err) {
      console.error('Failed to accept bid', err);
      alert('❌ Could not accept the bid.');
    }
  };

  const canDeliver =
    user?.role === 'SELLER' &&
    project?.sellerId === user.id &&
    project?.status === 'IN_PROGRESS';

  const handleDeliverableUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('projectId', project.id);
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
      router.reload();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('❌ Upload failed.');
    }
    setUploading(false);
  };

  const handleMarkComplete = async () => {
    const confirm = window.confirm('Mark this project as completed?');
    if (!confirm) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/projects/${project.id}/mark-complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('✅ Project marked as completed');
      router.reload();
    } catch (err) {
      console.error('Mark complete failed:', err);
      alert('❌ Could not complete the project.');
    }
  };

  if (loading || !project)
    return <div className="p-10 text-indigo-700 font-medium">Loading...</div>;

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    OPEN: 'bg-green-100 text-green-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-indigo-100 text-indigo-700',
  };

  const statusClass = statusColors[project.status?.toUpperCase()] || 'bg-gray-100 text-gray-700';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-10">
        {/* Project Card */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h1 className="text-3xl font-bold text-indigo-800 mb-2">{project.title}</h1>
          <p className="text-gray-700 mb-3">{project.description}</p>
          <div className="flex flex-wrap gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusClass}`}>
              📌 {project.status}
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
              ⏰ {new Date(project.deadline).toLocaleDateString()}
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
              💸 ₹{project.budgetMin} – ₹{project.budgetMax}
            </span>
          </div>
        </div>

        {/* Deliverables Section */}
        {deliverables.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold text-indigo-700 mb-3">📦 Submitted Deliverables</h2>
            <ul className="space-y-2">
              {deliverables.map((d) => (
                <li key={d.id}>
                  <a
                    href={d.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    📎 {d.fileUrl.split('/').pop()}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload Section for Seller */}
        {canDeliver && (
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold text-blue-700 mb-4">📤 Upload Deliverable</h2>
            <input
              ref={fileInputRef}
              type="file"
              className="mb-4"
              onChange={handleDeliverableUpload}
              disabled={uploading}
            />
            <button
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              disabled={uploading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold shadow"
            >
              {uploading ? 'Uploading...' : 'Select File & Upload'}
            </button>
          </div>
        )}

        {/* Mark as Complete for Buyer */}
        {user?.role === 'BUYER' &&
          user.id === project.buyerId &&
          project.status === 'IN_PROGRESS' && (
            <div className="bg-white p-6 rounded-xl shadow">
              <button
                onClick={handleMarkComplete}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow"
              >
                ✅ Mark Project as Completed
              </button>
            </div>
          )}

        {/* Bid Form for Seller */}
        {user?.role === 'SELLER' && !canDeliver && (
          <form
            onSubmit={handleBidSubmit}
            className="bg-white p-6 rounded-xl shadow space-y-4"
          >
            <h2 className="text-xl font-bold text-green-700">📩 Submit a Bid</h2>
            <input
              type="number"
              name="amount"
              placeholder="Amount ₹"
              value={bidForm.amount}
              onChange={handleBidChange}
              required
              className="w-full border px-4 py-2 rounded"
            />
            <textarea
              name="message"
              placeholder="Your message"
              value={bidForm.message}
              onChange={handleBidChange}
              required
              className="w-full border px-4 py-2 rounded"
            />
            <input
              type="number"
              name="etaDays"
              placeholder="Estimated days"
              value={bidForm.etaDays}
              onChange={handleBidChange}
              required
              className="w-full border px-4 py-2 rounded"
            />
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
            >
              🚀 Submit Bid
            </button>
          </form>
        )}

        {/* Bids for Buyer */}
        {user?.role === 'BUYER' && user.id === project.buyerId && (
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold text-blue-700 mb-4">📨 Bids Received</h2>
            {bids.length === 0 ? (
              <p className="text-gray-600">No bids yet.</p>
            ) : (
              <ul className="space-y-4">
                {bids.map((b) => (
                  <li
                    key={b.id}
                    className="border p-4 rounded-lg bg-blue-50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-green-700 font-bold">₹{b.amount}</span>
                      <span className="text-blue-700">ETA: {b.etaDays} days</span>
                    </div>
                    <p className="text-gray-700 mb-2">{b.message}</p>
                    {project.status === 'OPEN' && (
                      <button
                        onClick={() => handleAcceptBid(b.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                      >
                        ✅ Accept Bid
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
