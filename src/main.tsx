import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { OSProvider } from './context/OSContext';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OSProvider>
      <App />
    </OSProvider>
  </React.StrictMode>,
);
