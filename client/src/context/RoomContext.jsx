import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthContext } from './AuthContext';

const RoomContext = createContext();

const API_BASE = 'http://localhost:5001/api/rooms';
const STORAGE_KEY = 'currentRoom';

export function RoomProvider({ children }) {
  const { user } = useContext(AuthContext);

  // Restore the room synchronously on load, before first render,
  // so a refresh doesn't flash the selection screen first.
  const [currentRoom, setCurrentRoom] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [publicRooms, setPublicRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Keep sessionStorage mirrored to currentRoom automatically —
  // covers create, join, and leave without repeating this logic three times.
  useEffect(() => {
    try {
      if (currentRoom) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(currentRoom));
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // sessionStorage unavailable (e.g. private browsing) — fail silently
    }
  }, [currentRoom]);

  const createRoom = useCallback(async (name, isPublic, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ name, isPublic, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create room');
      setCurrentRoom(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const joinRoom = useCallback(async (name, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ name, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to join room');
      setCurrentRoom(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchPublicRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/public`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch public rooms');
      setPublicRooms(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const leaveRoom = useCallback(() => {
    setCurrentRoom(null);
  }, []);

  const value = {
    currentRoom,
    publicRooms,
    loading,
    error,
    createRoom,
    joinRoom,
    fetchPublicRooms,
    leaveRoom,
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) throw new Error('useRoom must be used within a RoomProvider');
  return context;
}