import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { TaskProvider } from './context/TaskContext.jsx';
import { FocusModeProvider } from './context/FocusModeContext.jsx';
import { RoomProvider } from './context/RoomContext.jsx';
import { TimerProvider } from './context/TimerContext.jsx';
import { ScratchpadProvider } from './context/ScratchpadContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RoomProvider>
        <TimerProvider>
          <ScratchpadProvider>
            <TaskProvider>
              <FocusModeProvider>
                <App />
              </FocusModeProvider>
            </TaskProvider>
          </ScratchpadProvider>
        </TimerProvider>
      </RoomProvider>
    </AuthProvider>
  </StrictMode>
);