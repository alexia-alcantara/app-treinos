import { useState, type FormEvent } from 'react';
import { useAutenticacao } from '../contexts/AutenticacaoContext';
import { ErroApi } from '../services/api';

export default function Login() {
  const { entrar } = useAutenticacao();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviarLogin(evento: FormEvent) {
    evento.preventDefault();
    setMensagemErro('');
    setEnviando(true);

    try {
      await entrar(email, senha);
    } catch (erro) {
      console.error('Erro ao fazer login:', erro);
      setMensagemErro(erro instanceof ErroApi ? erro.message : 'Sem conexão com o servidor');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-8 px-5">
      <div className="flex flex-col gap-1">
        <span className="font-titulo text-5xl font-bold">Bora treinar</span>
        <span className="text-texto-secundario">Entre pra ver seus treinos</span>
      </div>

      <form onSubmit={enviarLogin} className="flex flex-col gap-4 rounded-3xl bg-superficie p-5 shadow-sm">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-texto-secundario">
          E-mail
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            className="h-12 rounded-xl border border-borda bg-fundo px-3.5 text-base font-medium text-texto outline-none focus:border-texto"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-texto-secundario">
          Senha
          <input
            type="password"
            autoComplete="current-password"
            required
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            className="h-12 rounded-xl border border-borda bg-fundo px-3.5 text-base font-medium text-texto outline-none focus:border-texto"
          />
        </label>

        {mensagemErro && (
          <p role="alert" className="text-sm font-semibold text-erro">
            {mensagemErro}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="h-13 rounded-2xl bg-destaque text-base font-bold text-texto disabled:opacity-60"
        >
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}