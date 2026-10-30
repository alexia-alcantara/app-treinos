import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAutenticacao } from '../contexts/AutenticacaoContext';
import { requisitar } from '../services/api';
import type { SessaoDetalhada, SessaoResumo, TreinoResumo } from '../types';

const formatadorDataDeHoje = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

function encontrarProximoTreino(treinos: TreinoResumo[], sessoes: SessaoResumo[]) {
  const letraDoUltimoTreino = sessoes[0]?.treino?.letra;
  const posicaoDoUltimo = treinos.findIndex((treino) => treino.letra === letraDoUltimoTreino);

  if (posicaoDoUltimo === -1) {
    return treinos[0];
  }

  return treinos[(posicaoDoUltimo + 1) % treinos.length];
}

function contarTreinosDaSemana(sessoes: SessaoResumo[]) {
  const inicioDaSemana = new Date();
  const diasDesdeSegunda = (inicioDaSemana.getDay() + 6) % 7;
  inicioDaSemana.setDate(inicioDaSemana.getDate() - diasDesdeSegunda);
  inicioDaSemana.setHours(0, 0, 0, 0);

  return sessoes.filter((sessao) => new Date(sessao.iniciada_em) >= inicioDaSemana).length;
}

function descreverDiasAtras(dataIso: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dia = new Date(dataIso);
  dia.setHours(0, 0, 0, 0);

  const diasAtras = Math.round((hoje.getTime() - dia.getTime()) / 86_400_000);

  if (diasAtras === 0) return 'Hoje';
  if (diasAtras === 1) return 'Ontem';
  return `Há ${diasAtras} dias`;
}

function descreverUltimaVezDoTreino(treino: TreinoResumo, sessoes: SessaoResumo[]) {
  const ultimaSessao = sessoes.find((sessao) => sessao.treino?.letra === treino.letra);
  const quandoFoi = ultimaSessao
    ? `feito ${descreverDiasAtras(ultimaSessao.iniciada_em).toLowerCase()}`
    : 'ainda não feito';

  return `${treino.total_exercicios} exercícios · ${quandoFoi}`;
}

export default function Inicio() {
  const { usuario, sair } = useAutenticacao();
  const navigate = useNavigate();
  const [treinos, setTreinos] = useState<TreinoResumo[]>([]);
  const [sessoes, setSessoes] = useState<SessaoResumo[]>([]);
  const [sessaoEmAndamento, setSessaoEmAndamento] = useState<SessaoDetalhada | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [iniciando, setIniciando] = useState(false);

  useEffect(() => {
    Promise.all([
      requisitar<TreinoResumo[]>('/treinos'),
      requisitar<SessaoResumo[]>('/sessoes'),
      requisitar<{ sessao: SessaoDetalhada | null }>('/sessoes/em-andamento'),
    ])
      .then(([treinosRecebidos, sessoesRecebidas, emAndamento]) => {
        setTreinos(treinosRecebidos);
        setSessoes(sessoesRecebidas);
        setSessaoEmAndamento(emAndamento.sessao);
      })
      .catch((erro) => console.error('Erro ao carregar tela inicial:', erro))
      .finally(() => setCarregando(false));
  }, []);

  async function iniciarTreino(letra: string) {
    setIniciando(true);

    try {
      const sessaoCriada = await requisitar<{ id: number }>('/sessoes', {
        method: 'POST',
        body: JSON.stringify({ letra }),
      });
      navigate(`/sessoes/${sessaoCriada.id}`);
    } catch (erro) {
      console.error('Erro ao iniciar treino:', erro);
      setIniciando(false);
    }
  }

  const dataDeHoje = formatadorDataDeHoje.format(new Date());
  const proximoTreino = treinos.length > 0 ? encontrarProximoTreino(treinos, sessoes) : null;
  const ultimaSessao = sessoes[0];

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 pt-14 pb-8">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-texto-secundario first-letter:uppercase">{dataDeHoje}</p>
          <h1 className="font-titulo text-4xl font-bold">Bora treinar, {usuario?.name}</h1>
        </div>
        <button
          type="button"
          onClick={sair}
          className="min-h-11 rounded-xl bg-superficie px-3 text-sm font-semibold text-texto-secundario shadow-sm"
        >
          Sair
        </button>
      </header>

      {carregando && <p className="text-texto-secundario">Carregando…</p>}

      {sessaoEmAndamento?.treino && (
        <section className="flex flex-col gap-3.5 rounded-3xl bg-destaque p-5 text-texto">
          <span className="text-sm font-bold tracking-wide uppercase">Treino em andamento</span>
          <span className="font-titulo text-4xl leading-none font-bold">
            Treino {sessaoEmAndamento.treino.letra} — {sessaoEmAndamento.treino.nome}
          </span>
          <button
            type="button"
            onClick={() => navigate(`/sessoes/${sessaoEmAndamento.id}`)}
            className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-texto text-base font-bold text-white"
          >
            Continuar treino
          </button>
        </section>
      )}

      {proximoTreino && !sessaoEmAndamento && (
        <section className="flex flex-col gap-3.5 rounded-3xl bg-destaque p-5 text-texto">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold tracking-wide uppercase">Próximo treino</span>
            <span className="font-semibold">{proximoTreino.total_exercicios} exercícios</span>
          </div>
          <span className="font-titulo text-4xl leading-none font-bold">
            Treino {proximoTreino.letra} — {proximoTreino.nome}
          </span>
          <button
            type="button"
            disabled={iniciando}
            onClick={() => iniciarTreino(proximoTreino.letra)}
            className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-texto text-base font-bold text-white disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
            Começar treino
          </button>
        </section>
      )}

      {!carregando && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">Meus treinos</h2>
          {treinos.map((treino) => (
            <button
              type="button"
              key={treino.id}
              disabled={iniciando || sessaoEmAndamento !== null}
              onClick={() => iniciarTreino(treino.letra)}
              className="flex min-h-11 items-center gap-3.5 rounded-2xl bg-superficie p-3.5 text-left shadow-sm"
            >
              <span
                className={`flex size-12 items-center justify-center rounded-xl font-titulo text-2xl font-bold ${
                  treino.id === proximoTreino?.id ? 'bg-destaque' : 'bg-superficie-2'
                }`}
              >
                {treino.letra}
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="font-bold">{treino.nome}</span>
                <span className="text-sm text-texto-secundario">
                  {descreverUltimaVezDoTreino(treino, sessoes)}
                </span>
              </div>
            </button>
          ))}
        </section>
      )}

      {!carregando && (
        <section className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 rounded-2xl bg-superficie p-3.5 shadow-sm">
            <span className="text-sm text-texto-secundario">Treinos na semana</span>
            <span className="font-titulo text-3xl font-bold">{contarTreinosDaSemana(sessoes)}</span>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl bg-superficie p-3.5 shadow-sm">
            <span className="text-sm text-texto-secundario">Último treino</span>
            <span className="font-titulo text-3xl font-bold">
              {ultimaSessao ? descreverDiasAtras(ultimaSessao.iniciada_em) : '—'}
            </span>
          </div>
        </section>
      )}
    </main>
  );
}