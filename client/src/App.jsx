import { useContext, useState } from 'react';
import { AuthContext } from './context/AuthContext';
import { FocusModeContext } from './context/FocusModeContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import KanbanBoard from './components/KanbanBoard';
import RoomPage from './pages/RoomPage';
import ProfilePage from './pages/ProfilePage';
import SoundscapePlayer from './components/SoundscapePlayer';

function App() {
  const { user, logout } = useContext(AuthContext);
  const { isFocusMode, toggleFocusMode } = useContext(FocusModeContext);
  const [authView, setAuthView] = useState('home');
  const [view, setView] = useState(
    () => localStorage.getItem('currentView') || 'board'
  );

  const changeView = (newView) => {
    localStorage.setItem('currentView', newView);
    setView(newView);
  };

  if (!user) {
    if (authView === 'login') return <LoginPage onNavigate={setAuthView} />;
    if (authView === 'register')
      return <RegisterPage onNavigate={setAuthView} />;
    return <HomePage onNavigate={setAuthView} />;
  }

  return (
    <div>
      {!isFocusMode && (
        <div className="flex items-center justify-between bg-gray-800 p-3">
          <div className="flex gap-2">
            <button
              onClick={() => changeView('board')}
              className={`rounded px-3 py-1 text-sm text-white hover:bg-gray-700 ${
                view === 'board' ? 'bg-gray-700' : ''
              }`}
            >
              Board
            </button>
            <button
              onClick={() => changeView('room')}
              className={`rounded px-3 py-1 text-sm text-white hover:bg-gray-700 ${
                view === 'room' ? 'bg-gray-700' : ''
              }`}
            >
              Room
            </button>
            <button
              onClick={() => changeView('profile')}
              className={`rounded px-3 py-1 text-sm text-white hover:bg-gray-700 ${
                view === 'profile' ? 'bg-gray-700' : ''
              }`}
            >
              Profile
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleFocusMode}
              className="rounded bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700"
            >
              Focus Mode
            </button>
            <span className="text-sm text-gray-300">
              Logged in as <span className="font-semibold">{user.name}</span>
            </span>
            <button
              onClick={logout}
              className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
            >
              Log Out
            </button>
          </div>
        </div>
      )}

      {isFocusMode && (
        <button
          onClick={toggleFocusMode}
          className="fixed top-4 right-4 z-50 rounded-full bg-gray-800 px-4 py-2 text-sm text-white shadow-lg hover:bg-gray-700"
        >
          Exit Focus Mode
        </button>
      )}

      {view === 'board' && <KanbanBoard />}
      {view === 'room' && <RoomPage />}
      {view === 'profile' && <ProfilePage />}

      <SoundscapePlayer />
    </div>
  );
}

export default App;