import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

function AdminDashboardPage() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [usersError, setUsersError] = useState('');
  const [loading, setLoading] = useState(true);
  const [promotingId, setPromotingId] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/admin/stats', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to load stats');
      } else {
        setStats(data);
      }
    } catch (err) {
      setError('Could not reach the server');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/admin/users', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setUsersError(data.message || 'Failed to load users');
      } else {
        setUsers(data);
      }
    } catch (err) {
      setUsersError('Could not reach the server');
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers()]);
      setLoading(false);
    })();
  }, [user]);

  const handlePromote = async (userId) => {
    setPromotingId(userId);
    try {
      const res = await fetch(`http://localhost:5001/api/admin/promote/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setUsersError(data.message || 'Failed to promote user');
      } else {
        setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: data.role } : u)));
      }
    } catch (err) {
      setUsersError('Could not reach the server');
    } finally {
      setPromotingId(null);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading admin stats...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Admin Overview</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Active Users (connected now)</p>
          <p className="text-3xl font-bold text-purple-600">{stats.activeUsers}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Open Rooms (live)</p>
          <p className="text-3xl font-bold text-purple-600">{stats.openRooms}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Total Registered Users</p>
          <p className="text-3xl font-bold text-purple-600">{stats.totalUsers}</p>
        </div>
      </div>

      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">User Growth (by day)</h2>
        {stats.growth.length === 0 ? (
          <p className="text-sm text-gray-400">No data yet.</p>
        ) : (
          <ul className="max-h-48 overflow-y-auto text-sm text-gray-700">
            {stats.growth.map((g) => (
              <li key={g._id} className="flex justify-between border-b py-1">
                <span>{g._id}</span>
                <span className="font-semibold">
                  {g.count} new user{g.count === 1 ? '' : 's'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Soundscape Popularity</h2>
        {stats.soundscapePopularity.length === 0 ? (
          <p className="text-sm text-gray-400">No plays logged yet.</p>
        ) : (
          <ul className="text-sm text-gray-700">
            {stats.soundscapePopularity.map((s) => (
              <li key={s._id} className="flex justify-between border-b py-1">
                <span>{s.label}</span>
                <span className="font-semibold">
                  {s.count} play{s.count === 1 ? '' : 's'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Manage Admin Access</h2>
        <p className="mb-3 text-xs text-gray-400">
          Only name, email, and role are shown here — no task, chat, or profile data.
        </p>
        {usersError && <p className="mb-2 text-sm text-red-500">{usersError}</p>}
        <ul className="max-h-64 overflow-y-auto text-sm text-gray-700">
          {users.map((u) => (
            <li key={u._id} className="flex items-center justify-between border-b py-2">
              <div>
                <span className="font-semibold">{u.name}</span>{' '}
                <span className="text-gray-400">({u.email})</span>
              </div>
              {u.role === 'manager' ? (
                <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                  Admin
                </span>
              ) : (
                <button
                  onClick={() => handlePromote(u._id)}
                  disabled={promotingId === u._id}
                  className="rounded bg-purple-600 px-3 py-1 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {promotingId === u._id ? 'Promoting…' : 'Promote to Admin'}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminDashboardPage;