import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { TaskProvider } from './context/TaskContext.jsx';
import { FocusModeProvider } from './context/FocusModeContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <TaskProvider>
        <FocusModeProvider>
          <App />
        </FocusModeProvider>
      </TaskProvider>
    </AuthProvider>
  </StrictMode>
);