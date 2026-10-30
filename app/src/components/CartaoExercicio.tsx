import { useEffect, useState } from 'react';
import { ErroApi, requisitar } from '../services/api';
import type { DadosDaSerie, ExercicioPlanejado, SerieRealizada, UltimaVez } from '../types';
import { formatarCronometro } from '../utils/tempo';

type ValoresDaSerie = {
  carga: string;
  quantidade: string;
};

type Props = {
  planejado: ExercicioPlanejado;
  seriesFeitas: SerieRealizada[];
  onRegistrarSerie: (numeroSerie: number, dados: DadosDaSerie) => Promise<void>;
};

const ehPorTempo = (planejado: ExercicioPlanejado) => planejado.duracao_segundos !== null;

function descreverPlano(planejado: ExercicioPlanejado) {
  const quantidade = ehPorTempo(planejado)
    ? formatarCronometro(planejado.duracao_segundos ?? 0)
    : `${planejado.repeticoes} reps`;

  return `${planejado.series} séries · ${quantidade} · descanso ${planejado.descanso_segundos}s`;
}

function descreverUltimaVez(ultimaVez: UltimaVez) {
  if (ultimaVez.series.length === 0) {
    return 'Primeira vez fazendo esse exercício';
  }

  const primeiraSerie = ultimaVez.series[0];
  const quantidade = primeiraSerie.duracao_segundos
    ? formatarCronometro(primeiraSerie.duracao_segundos)
    : primeiraSerie.repeticoes;
  const cargas = ultimaVez.series.map((serie) => serie.carga_kg ?? 0);
  const maiorCarga = Math.max(...cargas);
  const comCarga = maiorCarga > 0 ? ` com ${maiorCarga} kg` : '';

  return `Última vez: ${ultimaVez.series.length} × ${quantidade}${comCarga}`;
}

function montarValoresIniciais(planejado: ExercicioPlanejado, ultimaVez: UltimaVez) {
  const valores: Record<number, ValoresDaSerie> = {};

  for (let numeroSerie = 1; numeroSerie <= planejado.series; numeroSerie++) {
    const serieAnterior =
      ultimaVez.series.find((serie) => serie.numero_serie === numeroSerie) ?? ultimaVez.series.at(-1);
    const carga = serieAnterior?.carga_kg ?? planejado.carga_kg;
    const quantidade = ehPorTempo(planejado) ? planejado.duracao_segundos : planejado.repeticoes;

    valores[numeroSerie] = {
      carga: carga?.toString() ?? '',
      quantidade: quantidade?.toString() ?? '',
    };
  }

  return valores;
}

export default function CartaoExercicio({ planejado, seriesFeitas, onRegistrarSerie }: Props) {
  const [ultimaVez, setUltimaVez] = useState<UltimaVez | null>(null);
  const [valores, setValores] = useState<Record<number, ValoresDaSerie>>({});
  const [serieSalvando, setSerieSalvando] = useState<number | null>(null);
  const [mensagemErro, setMensagemErro] = useState('');

  useEffect(() => {
    requisitar<UltimaVez>(`/exercicios/${planejado.exercicio_id}/ultima-vez`)
      .catch((erro) => {
        console.error('Erro ao buscar última vez do exercício:', erro);
        return { data: null, series: [] };
      })
      .then((ultimaVezRecebida) => {
        setUltimaVez(ultimaVezRecebida);
        setValores(montarValoresIniciais(planejado, ultimaVezRecebida));
      });
  }, [planejado]);

  const totalDeLinhas = Math.max(planejado.series, seriesFeitas.length);
  const numerosDasSeries = Array.from({ length: totalDeLinhas }, (_, posicao) => posicao + 1);

  function alterarValor(numeroSerie: number, campo: keyof ValoresDaSerie, valor: string) {
    setValores((anteriores) => ({
      ...anteriores,
      [numeroSerie]: { ...anteriores[numeroSerie], [campo]: valor },
    }));
  }

  async function concluirSerie(numeroSerie: number) {
    const { carga, quantidade } = valores[numeroSerie] ?? { carga: '', quantidade: '' };
    const quantidadeInformada = Number(quantidade);

    if (!Number.isInteger(quantidadeInformada) || quantidadeInformada <= 0) {
      setMensagemErro(ehPorTempo(planejado) ? 'Informe os segundos da série' : 'Informe as repetições da série');
      return;
    }

    const dados: DadosDaSerie = {
      carga_kg: carga.trim() === '' ? null : Number(carga.replace(',', '.')),
      ...(ehPorTempo(planejado)
        ? { duracao_segundos: quantidadeInformada }
        : { repeticoes: quantidadeInformada }),
    };

    setMensagemErro('');
    setSerieSalvando(numeroSerie);

    try {
      await onRegistrarSerie(numeroSerie, dados);
    } catch (erro) {
      console.error('Erro ao registrar série:', erro);
      setMensagemErro(erro instanceof ErroApi ? erro.message : 'Sem conexão com o servidor');
    } finally {
      setSerieSalvando(null);
    }
  }

  const classeDoCampo =
    'h-11 w-full rounded-xl border border-borda bg-fundo text-center text-[17px] font-semibold text-texto outline-none focus:border-texto disabled:border-transparent disabled:bg-superficie-2';

  return (
    <section className="flex flex-col gap-3.5 rounded-3xl bg-superficie p-4.5 shadow-sm">
      <div className="flex flex-col gap-1">
        <h1 className="font-titulo text-[32px] leading-none font-bold">{planejado.exercicio.nome}</h1>
        <p className="text-sm text-texto-secundario">{descreverPlano(planejado)}</p>
        <p className="text-sm text-texto-secundario">
          {ultimaVez ? descreverUltimaVez(ultimaVez) : 'Buscando a última vez…'}
        </p>
      </div>

      <div className="grid grid-cols-[44px_1fr_1fr_44px] gap-2 text-xs font-semibold tracking-wide text-texto-secundario uppercase">
        <span>Série</span>
        <span className="text-center">Carga (kg)</span>
        <span className="text-center">{ehPorTempo(planejado) ? 'Segundos' : 'Reps'}</span>
        <span className="text-center">Feito</span>
      </div>

      {numerosDasSeries.map((numeroSerie) => {
        const serieFeita = seriesFeitas.find((serie) => serie.numero_serie === numeroSerie);
        const valoresDaLinha = valores[numeroSerie] ?? { carga: '', quantidade: '' };

        return (
          <div key={numeroSerie} className="grid grid-cols-[44px_1fr_1fr_44px] items-center gap-2">
            <span
              className={`font-titulo text-2xl font-bold ${serieFeita ? 'text-texto' : 'text-texto-secundario'}`}
            >
              {numeroSerie}
            </span>
            <input
              aria-label={`Carga da série ${numeroSerie}`}
              inputMode="decimal"
              disabled={serieFeita !== undefined}
              value={serieFeita ? (serieFeita.carga_kg?.toString() ?? '—') : valoresDaLinha.carga}
              onChange={(evento) => alterarValor(numeroSerie, 'carga', evento.target.value)}
              className={classeDoCampo}
            />
            <input
              aria-label={`${ehPorTempo(planejado) ? 'Segundos' : 'Repetições'} da série ${numeroSerie}`}
              inputMode="numeric"
              disabled={serieFeita !== undefined}
              value={
                serieFeita
                  ? String(serieFeita.repeticoes ?? serieFeita.duracao_segundos)
                  : valoresDaLinha.quantidade
              }
              onChange={(evento) => alterarValor(numeroSerie, 'quantidade', evento.target.value)}
              className={classeDoCampo}
            />
            <button
              type="button"
              aria-label={`Marcar série ${numeroSerie} como feita`}
              disabled={serieFeita !== undefined || serieSalvando !== null}
              onClick={() => concluirSerie(numeroSerie)}
              className={`flex size-11 items-center justify-center rounded-xl ${
                serieFeita ? 'bg-destaque text-texto' : 'bg-superficie-2 text-texto-secundario'
              }`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={serieSalvando === numeroSerie ? 'animate-pulse' : ''}
              >
                <polyline points="5 12 10 17 19 7" />
              </svg>
            </button>
          </div>
        );
      })}

      {mensagemErro && (
        <p role="alert" className="text-sm font-semibold text-erro">
          {mensagemErro}
        </p>
      )}
    </section>
  );
}