import { useEffect, useRef, useState } from 'react';
import { useTimer } from '../context/TimerContext';

function BreakAlertModal() {
  const { session } = useTimer();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const prevPhaseRef = useRef(null);

  useEffect(() => {
    if (!session || !session.hasSession) {
      prevPhaseRef.current = null;
      return;
    }

    const prevPhase = prevPhaseRef.current;

    if (prevPhase === 'work' && session.phase === 'break') {
      setMessage("Time's up! Take a break — you've earned it.");
      setVisible(true);
    } else if (prevPhase === 'break' && session.phase === 'work') {
      setMessage("Break's over — back to focus.");
      setVisible(true);
    }

    prevPhaseRef.current = session.phase;
  }, [session]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-xl">
        <h2 className="mb-3 text-xl font-bold text-gray-800">
          {session.phase === 'break' ? '☕ Break Time' : '📚 Back to Focus'}
        </h2>
        <p className="mb-6 text-gray-600">{message}</p>
        <button
          onClick={() => setVisible(false)}
          className="w-full rounded bg-purple-600 py-2 font-semibold text-white hover:bg-purple-700"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

export default BreakAlertModal;