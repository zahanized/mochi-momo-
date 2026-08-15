import { useState, useEffect, useRef, useContext } from 'react';
import { useTimer } from '../context/TimerContext';
import { useRoom } from '../context/RoomContext';
import { FocusModeContext } from '../context/FocusModeContext';

function formatTime(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function PomodoroTimer() {
  const { currentRoom } = useRoom();
  const { session, loading, error, startTimer, pauseTimer, resumeTimer, resetTimer, completePhase } = useTimer();
  const { isFocusMode } = useContext(FocusModeContext);
  const [remaining, setRemaining] = useState(0);
  const completedRef = useRef(null); // guards against reporting completion more than once per phase run

  useEffect(() => {
    if (!session || !session.hasSession) {
      setRemaining(0);
      return;
    }

    const durationSeconds =
      (session.phase === 'work' ? session.workDuration : session.breakDuration) * 60;

    const tick = () => {
      let secondsLeft;
      if (session.isRunning && session.phaseStartedAt) {
        const elapsed = (Date.now() - new Date(session.phaseStartedAt).getTime()) / 1000;
        secondsLeft = durationSeconds - elapsed;
      } else if (session.remainingOnPause != null) {
        secondsLeft = session.remainingOnPause;
      } else {
        secondsLeft = durationSeconds;
      }
      setRemaining(Math.max(secondsLeft, 0));

      if (
        session.isRunning &&
        secondsLeft <= 0 &&
        completedRef.current !== session.phaseStartedAt
      ) {
        completedRef.current = session.phaseStartedAt;
        completePhase().catch(() => {});
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session, completePhase]);

  if (!currentRoom || !session) return null;

  const hasSession = session.hasSession;
  const isRunning = session.isRunning;
  const isPaused = !isRunning && session.remainingOnPause != null;
  const isFresh = !isRunning && session.remainingOnPause == null;
  const phaseLabel = session.phase === 'work' ? 'Focus' : 'Break';

  return (
    <div
      className={`mb-4 flex flex-col items-center gap-2 rounded-xl bg-white shadow-lg ${
        isFocusMode ? 'p-8' : 'p-3'
      }`}
    >
      <span
        className={`font-semibold uppercase tracking-wide ${
          session.phase === 'work' ? 'text-purple-600' : 'text-green-600'
        } ${isFocusMode ? 'text-sm' : 'text-xs'}`}
      >
        {phaseLabel}
      </span>
      <span className={`font-mono font-bold text-gray-800 ${isFocusMode ? 'text-6xl' : 'text-2xl'}`}>
        {formatTime(remaining)}
      </span>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2">
        {(!hasSession || isFresh) && (
          <button
            onClick={() => startTimer().catch(() => {})}
            disabled={loading}
            className="rounded bg-purple-600 px-3 py-1 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
          >
            Start
          </button>
        )}

        {isRunning && (
          <button
            onClick={() => pauseTimer().catch(() => {})}
            disabled={loading}
            className="rounded bg-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-400 disabled:opacity-50"
          >
            Pause
          </button>
        )}

        {isPaused && (
          <button
            onClick={() => resumeTimer().catch(() => {})}
            disabled={loading}
            className="rounded bg-purple-600 px-3 py-1 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
          >
            Resume
          </button>
        )}

        {hasSession && (
          <button
            onClick={() => resetTimer().catch(() => {})}
            disabled={loading}
            className="rounded border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

export default PomodoroTimer;