import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { useRoom } from './RoomContext';
import socket from '../socket';

const TimerContext = createContext();

const API_BASE = 'http://localhost:5001/api/timer';

export function TimerProvider({ children }) {
  const { user } = useContext(AuthContext);
  const { currentRoom } = useRoom();
  const roomId = currentRoom?.roomId;

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch current state whenever we enter a room — covers joining mid-session.
  useEffect(() => {
    if (!roomId) {
      setSession(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/${roomId}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const data = await res.json();
        if (!cancelled) setSession(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [roomId, user?.token]);

  // Live sync — every start/pause/resume/reset/complete anywhere broadcasts
  // here, so all clients in the room recompute from the same anchor.
  useEffect(() => {
    if (!roomId) return;

    const handleTimerUpdate = (updatedSession) => {
      if (updatedSession.room === roomId) {
        setSession({ hasSession: true, ...updatedSession });
      }
    };

    socket.on('timerUpdate', handleTimerUpdate);
    return () => socket.off('timerUpdate', handleTimerUpdate);
  }, [roomId]);

  const callAction = useCallback(
    async (action) => {
      if (!roomId) throw new Error('Not currently in a room');
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/${roomId}/${action}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `Failed to ${action} timer`);
        setSession({ hasSession: true, ...data });
        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [roomId, user]
  );

  const startTimer = useCallback(() => callAction('start'), [callAction]);
  const pauseTimer = useCallback(() => callAction('pause'), [callAction]);
  const resumeTimer = useCallback(() => callAction('resume'), [callAction]);
  const resetTimer = useCallback(() => callAction('reset'), [callAction]);
  const completePhase = useCallback(() => callAction('complete'), [callAction]);

  const value = {
    session,
    loading,
    error,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    completePhase,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) throw new Error('useTimer must be used within a TimerProvider');
  return context;
}