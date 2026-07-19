import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import KanbanBoard from './components/KanbanBoard';

function App() {
  const { user } = useContext(AuthContext);

  return user ? <KanbanBoard /> : <LoginPage />;
}

export default App;