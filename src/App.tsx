import React from 'react';
import { useOS } from './context/OSContext';
import { Desktop } from './components/Desktop';

function App() {
  useOS(); // Ensure usage
  return (
    <div className="w-full h-screen overflow-hidden">
       <Desktop />
    </div>
  );
}

export default App;
