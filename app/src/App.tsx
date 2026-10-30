import { Navigate, Route, Routes } from 'react-router';
import { useAutenticacao } from './contexts/AutenticacaoContext';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import TreinoEmAndamento from './pages/TreinoEmAndamento';

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
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/sessoes/:sessaoId" element={<TreinoEmAndamento />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}