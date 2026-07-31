import { createContext, useState } from 'react';

export const FocusModeContext = createContext();

export const FocusModeProvider = ({ children }) => {
  const [isFocusMode, setIsFocusMode] = useState(false);

  const toggleFocusMode = () => setIsFocusMode((prev) => !prev);

  return (
    <FocusModeContext.Provider value={{ isFocusMode, toggleFocusMode }}>
      {children}
    </FocusModeContext.Provider>
  );
};