import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { useRoom } from './RoomContext';
import socket from '../socket';

const ScratchpadContext = createContext();

const API_BASE = 'http://localhost:5001/api/scratchpad';

export function ScratchpadProvider({ children }) {
  const { user } = useContext(AuthContext);
  const { currentRoom } = useRoom();
  const roomId = currentRoom?.roomId;

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load existing entries whenever we enter a room
  useEffect(() => {
    if (!roomId) {
      setEntries([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/${roomId}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const data = await res.json();
        if (!cancelled) setEntries(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [roomId, user?.token]);

  // Live updates — anyone adding an entry broadcasts here
  useEffect(() => {
    if (!roomId) return;

    const handleUpdate = (entry) => {
      if (entry.room === roomId) {
        setEntries((prev) => [...prev, entry]);
      }
    };

    socket.on('scratchpadUpdate', handleUpdate);
    return () => socket.off('scratchpadUpdate', handleUpdate);
  }, [roomId]);

  const addEntry = useCallback(
    async (content) => {
      if (!roomId) throw new Error('Not currently in a room');
      if (!content || !content.trim()) throw new Error('Content is required');

      setError(null);
      try {
        const res = await fetch(`${API_BASE}/${roomId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ content: content.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to add entry');
        // Own entry arrives via the socket broadcast too, so we don't
        // manually append here — avoids showing it twice.
        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [roomId, user]
  );

  const value = { entries, loading, error, addEntry };

  return <ScratchpadContext.Provider value={value}>{children}</ScratchpadContext.Provider>;
}

export function useScratchpad() {
  const context = useContext(ScratchpadContext);
  if (!context) throw new Error('useScratchpad must be used within a ScratchpadProvider');
  return context;
}