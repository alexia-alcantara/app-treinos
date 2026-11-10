import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import { AutenticacaoProvider } from './contexts/AutenticacaoContext';
import { ConfirmacaoProvider } from './contexts/ConfirmacaoContext';
import { ToastProvider } from './contexts/ToastContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <ConfirmacaoProvider>
          <AutenticacaoProvider>
            <App />
          </AutenticacaoProvider>
        </ConfirmacaoProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);