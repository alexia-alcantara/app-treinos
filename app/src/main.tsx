import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import { AutenticacaoProvider } from './contexts/AutenticacaoContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AutenticacaoProvider>
        <App />
      </AutenticacaoProvider>
    </BrowserRouter>
  </StrictMode>,
);