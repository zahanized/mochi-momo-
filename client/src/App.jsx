import { useContext, useState } from 'react';
import { AuthContext } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import KanbanBoard from './components/KanbanBoard';
import RoomPage from './pages/RoomPage';

function App() {
  const { user } = useContext(AuthContext);
  const [view, setView] = useState('board');

  if (!user) return <LoginPage />;

  return (
    <div>
      <div className="flex gap-2 bg-gray-800 p-3">
        <button
          onClick={() => setView('board')}
          className="rounded px-3 py-1 text-sm text-white hover:bg-gray-700"
        >
          Board
        </button>
        <button
          onClick={() => setView('room')}
          className="rounded px-3 py-1 text-sm text-white hover:bg-gray-700"
        >
          Room
        </button>
      </div>
      {view === 'board' ? <KanbanBoard /> : <RoomPage />}
    </div>
  );
}

export default App;