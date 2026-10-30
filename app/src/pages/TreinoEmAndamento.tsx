import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import CartaoExercicio from '../components/CartaoExercicio';
import CronometroDescanso from '../components/CronometroDescanso';
import { useAgora } from '../hooks/useAgora';
import { requisitar } from '../services/api';
import type { DadosDaSerie, ExercicioPlanejado, SerieRealizada, SessaoDetalhada } from '../types';
import { formatarCronometro } from '../utils/tempo';

function contarSeriesFeitas(sessao: SessaoDetalhada, planejado: ExercicioPlanejado) {
  return sessao.series_realizadas.filter((serie) => serie.exercicio_id === planejado.exercicio_id).length;
}

function encontrarPrimeiroExercicioPendente(sessao: SessaoDetalhada) {
  const exercicios = sessao.treino?.exercicios_planejados ?? [];
  const posicao = exercicios.findIndex((planejado) => contarSeriesFeitas(sessao, planejado) < planejado.series);

  return posicao === -1 ? Math.max(exercicios.length - 1, 0) : posicao;
}

export default function TreinoEmAndamento() {
  const { sessaoId } = useParams();
  const navigate = useNavigate();
  const agora = useAgora(1000);
  const [sessao, setSessao] = useState<SessaoDetalhada | null>(null);
  const [posicaoAtual, setPosicaoAtual] = useState(0);
  const [descansoTerminaEm, setDescansoTerminaEm] = useState<number | null>(null);
  const [finalizando, setFinalizando] = useState(false);

  useEffect(() => {
    requisitar<SessaoDetalhada>(`/sessoes/${sessaoId}`)
      .then((sessaoRecebida) => {
        if (sessaoRecebida.finalizada_em !== null) {
          navigate('/', { replace: true });
          return;
        }

        setSessao(sessaoRecebida);
        setPosicaoAtual(encontrarPrimeiroExercicioPendente(sessaoRecebida));
      })
      .catch((erro) => {
        console.error('Erro ao carregar sessão:', erro);
        navigate('/', { replace: true });
      });
  }, [sessaoId, navigate]);

  if (!sessao?.treino) {
    return <p className="p-5 text-texto-secundario">Carregando treino…</p>;
  }

  const { treino } = sessao;
  const exercicios = treino.exercicios_planejados;
  const planejadoAtual = exercicios[posicaoAtual];
  const proximoPlanejado = exercicios[posicaoAtual + 1];
  const ehUltimoExercicio = proximoPlanejado === undefined;
  const progresso = Math.round(((posicaoAtual + 1) / exercicios.length) * 100);
  const segundosDeTreino = Math.max(0, Math.floor((agora - new Date(sessao.iniciada_em).getTime()) / 1000));
  const seriesFeitasDoAtual = sessao.series_realizadas.filter(
    (serie) => serie.exercicio_id === planejadoAtual.exercicio_id,
  );

  async function registrarSerie(numeroSerie: number, dados: DadosDaSerie) {
    const serieRegistrada = await requisitar<SerieRealizada>(`/sessoes/${sessaoId}/series`, {
      method: 'POST',
      body: JSON.stringify({
        exercicio_id: planejadoAtual.exercicio_id,
        numero_serie: numeroSerie,
        ...dados,
      }),
    });

    setSessao((anterior) =>
      anterior && { ...anterior, series_realizadas: [...anterior.series_realizadas, serieRegistrada] },
    );
    setDescansoTerminaEm(Date.now() + planejadoAtual.descanso_segundos * 1000);
  }

  function irParaExercicio(posicao: number) {
    setPosicaoAtual(posicao);
    setDescansoTerminaEm(null);
  }

  async function finalizarTreino() {
    const temSeriePendente = exercicios.some(
      (planejado) => contarSeriesFeitas(sessao!, planejado) < planejado.series,
    );

    if (temSeriePendente && !window.confirm('Ainda tem séries sem marcar. Finalizar mesmo assim?')) {
      return;
    }

    setFinalizando(true);

    try {
      await requisitar(`/sessoes/${sessaoId}/finalizar`, { method: 'PATCH' });
      navigate('/', { replace: true });
    } catch (erro) {
      console.error('Erro ao finalizar treino:', erro);
      setFinalizando(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 pt-13 pb-8">
      <header className="flex items-center justify-between gap-3">
        <Link
          to="/"
          aria-label="Voltar pro início"
          className="flex size-11 items-center justify-center rounded-xl bg-superficie shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 6 9 12 15 18" />
          </svg>
        </Link>
        <span className="font-titulo text-[22px] font-bold">
          Treino {treino.letra} — {treino.nome}
        </span>
        <span className="w-11 text-right text-sm text-texto-secundario tabular-nums">
          {formatarCronometro(segundosDeTreino)}
        </span>
      </header>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-sm text-texto-secundario">
          <span>
            Exercício {posicaoAtual + 1} de {exercicios.length}
          </span>
          <span>{progresso}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-superficie-2">
          <div className="h-full rounded-full bg-texto transition-all" style={{ width: `${progresso}%` }} />
        </div>
      </div>

      <CartaoExercicio
        key={planejadoAtual.id}
        planejado={planejadoAtual}
        seriesFeitas={seriesFeitasDoAtual}
        onRegistrarSerie={registrarSerie}
      />

      {descansoTerminaEm !== null && (
        <CronometroDescanso
          terminaEm={descansoTerminaEm}
          onAdicionarSegundos={(segundos) =>
            setDescansoTerminaEm((anterior) => (anterior ?? Date.now()) + segundos * 1000)
          }
          onPular={() => setDescansoTerminaEm(null)}
        />
      )}

      {proximoPlanejado && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-texto-secundario">A seguir</span>
          <div className="flex justify-between rounded-2xl bg-superficie px-3.5 py-3 text-[15px] shadow-sm">
            <span className="font-semibold">{proximoPlanejado.exercicio.nome}</span>
            <span className="text-texto-secundario">
              {proximoPlanejado.series} × {proximoPlanejado.repeticoes ?? formatarCronometro(proximoPlanejado.duracao_segundos ?? 0)}
            </span>
          </div>
        </div>
      )}

      <div className="mt-auto flex gap-2.5 pt-2">
        {posicaoAtual > 0 && (
          <button
            type="button"
            onClick={() => irParaExercicio(posicaoAtual - 1)}
            className="h-14 rounded-2xl bg-superficie px-5 text-base font-bold shadow-sm"
          >
            Anterior
          </button>
        )}
        <button
          type="button"
          disabled={finalizando}
          onClick={ehUltimoExercicio ? finalizarTreino : () => irParaExercicio(posicaoAtual + 1)}
          className="h-14 flex-1 rounded-2xl bg-texto text-base font-bold text-white disabled:opacity-60"
        >
          {ehUltimoExercicio ? (finalizando ? 'Finalizando…' : 'Finalizar treino') : 'Próximo exercício'}
        </button>
      </div>
    </main>
  );
}