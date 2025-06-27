import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!token || !user.role) {
        window.location.href = '/login';
        return;
      }

      setRole(user.role);

      try {
        const res = await axios.get(
          user.role === 'BUYER'
            ? 'http://localhost:5000/api/projects/my'
            : 'http://localhost:5000/api/projects', // for SELLER
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProjects(res.data);
      } catch (err) {
        console.error('Error fetching projects:', err);
        alert('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Loading projects...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{role === 'BUYER' ? 'Your Projects' : 'All Open Projects'}</h2>

      {role === 'BUYER' && (
        <Link href="/projects/create">
          <button style={{ marginBottom: 20 }}>➕ Create New Project</button>
        </Link>
      )}

      {projects.length === 0 ? (
        <p>No projects available.</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project.id} style={{ marginBottom: 16 }}>
              <strong>{project.title}</strong> - {project.description}
              <br />
              💰 Budget: ₹{project.budgetMin} - ₹{project.budgetMax}
              <br />
              📅 Deadline: {new Date(project.deadline).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProjectsPage;
