import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { useAutenticacao } from './contexts/AutenticacaoContext';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import TreinoEmAndamento from './pages/TreinoEmAndamento';

const Evolucao = lazy(() => import('./pages/Evolucao'));

export default function App() {
  const { usuario, carregando } = useAutenticacao();

  if (carregando) {
    return null;
  }

  if (!usuario) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Suspense fallback={<p className="p-5 text-texto-secundario">Carregando…</p>}>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/evolucao" element={<Evolucao />} />
        <Route path="/sessoes/:sessaoId" element={<TreinoEmAndamento />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}