import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function ProfilePage() {
  const { user, login } = useContext(AuthContext);
  const [name, setName] = useState(user.name);
  const [preview, setPreview] = useState(user.profilePicture || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError('Image must be smaller than 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://localhost:5001/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ name, profilePicture: preview }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Update failed');
        return;
      }

      login(data);
      setSuccess('Profile updated!');
    } catch (err) {
      setError('Could not reach the server');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md"
      >
        <h1 className="mb-2 text-2xl font-bold text-gray-800">My Profile</h1>

        <div className="mb-6 flex items-center gap-1 text-sm font-medium text-orange-600">
          <span>🔥</span>
          <span>
            {user.streakCount ?? 0} day{(user.streakCount ?? 0) === 1 ? '' : 's'} streak
          </span>
        </div>

        {error && (
          <p className="mb-4 rounded bg-red-100 p-2 text-sm text-red-600">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-4 rounded bg-green-100 p-2 text-sm text-green-600">
            {success}
          </p>
        )}

        <div className="mb-6 flex flex-col items-center">
          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="mb-3 h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-purple-100 text-2xl font-bold text-purple-600">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <label className="cursor-pointer text-sm text-purple-600 hover:underline">
            Change picture
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        <label className="mb-1 block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 w-full rounded border border-gray-300 p-2"
          required
        />

        <label className="mb-1 block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          value={user.email}
          disabled
          className="mb-6 w-full rounded border border-gray-300 bg-gray-100 p-2 text-gray-500"
        />

        <button
          type="submit"
          className="w-full rounded bg-purple-600 py-2 font-semibold text-white hover:bg-purple-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;