import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  EVENTO_SESSAO_EXPIRADA,
  obterToken,
  removerToken,
  requisitar,
  salvarToken,
} from '../services/api';
import type { Usuario } from '../types';

type ValorAutenticacao = {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
};

type RespostaLogin = {
  token: string;
  usuario: Usuario;
};

const AutenticacaoContext = createContext<ValorAutenticacao | null>(null);

export function AutenticacaoProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(() => obterToken() !== null);

  useEffect(() => {
    if (!obterToken()) return;

    requisitar<Usuario>('/user')
      .then(setUsuario)
      .catch((erro) => console.error('Erro ao buscar usuário logado:', erro))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    const limparUsuario = () => setUsuario(null);
    window.addEventListener(EVENTO_SESSAO_EXPIRADA, limparUsuario);
    return () => window.removeEventListener(EVENTO_SESSAO_EXPIRADA, limparUsuario);
  }, []);

  async function entrar(email: string, senha: string) {
    const resposta = await requisitar<RespostaLogin>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: senha }),
    });

    salvarToken(resposta.token);
    setUsuario(resposta.usuario);
  }

  async function sair() {
    try {
      await requisitar('/logout', { method: 'POST' });
    } catch (erro) {
      console.error('Erro ao fazer logout:', erro);
    } finally {
      removerToken();
      setUsuario(null);
    }
  }

  return (
    <AutenticacaoContext.Provider value={{ usuario, carregando, entrar, sair }}>
      {children}
    </AutenticacaoContext.Provider>
  );
}

export function useAutenticacao() {
  const contexto = useContext(AutenticacaoContext);

  if (!contexto) {
    throw new Error('useAutenticacao precisa estar dentro de AutenticacaoProvider');
  }

  return contexto;
}