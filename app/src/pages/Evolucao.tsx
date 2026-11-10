import { useEffect, useState } from 'react';
import GraficoEvolucao, { formatarCarga } from '../components/GraficoEvolucao';
import MenuInferior from '../components/MenuInferior';
import { useToast } from '../contexts/ToastContext';
import { requisitar } from '../services/api';
import type { ExercicioResumo, PontoDeEvolucao, SessaoResumo } from '../types';
import { formatarDuracaoEmMinutos } from '../utils/tempo';

const QUANTIDADE_DE_PONTOS_NO_GRAFICO = 12;

const formatadorDiaEMes = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' });

export default function Evolucao() {
  const { mostrarToast } = useToast();
  const [exercicios, setExercicios] = useState<ExercicioResumo[]>([]);
  const [sessoes, setSessoes] = useState<SessaoResumo[]>([]);
  const [exercicioSelecionadoId, setExercicioSelecionadoId] = useState<number | null>(null);
  const [evolucao, setEvolucao] = useState<PontoDeEvolucao[]>([]);
  const [carregandoEvolucao, setCarregandoEvolucao] = useState(false);

  useEffect(() => {
    Promise.all([
      requisitar<ExercicioResumo[]>('/exercicios'),
      requisitar<SessaoResumo[]>('/sessoes'),
    ])
      .then(([exerciciosRecebidos, sessoesRecebidas]) => {
        setExercicios(exerciciosRecebidos);
        setSessoes(sessoesRecebidas);

        const primeiroComHistorico =
          exerciciosRecebidos.find((exercicio) => exercicio.tem_historico) ?? exerciciosRecebidos[0];
        setExercicioSelecionadoId(primeiroComHistorico?.id ?? null);
      })
      .catch((erro) => {
        console.error('Erro ao carregar tela de evolução:', erro);
        mostrarToast('Erro ao carregar evolução', 'erro');
      });
  }, [mostrarToast]);

  useEffect(() => {
    if (exercicioSelecionadoId === null) return;

    setCarregandoEvolucao(true);

    requisitar<PontoDeEvolucao[]>(`/exercicios/${exercicioSelecionadoId}/evolucao`)
      .then(setEvolucao)
      .catch((erro) => {
        console.error('Erro ao buscar evolução do exercício:', erro);
        mostrarToast('Erro ao buscar evolução do exercício', 'erro');
      })
      .finally(() => setCarregandoEvolucao(false));
  }, [exercicioSelecionadoId, mostrarToast]);

  const exercicioSelecionado = exercicios.find((exercicio) => exercicio.id === exercicioSelecionadoId);
  const pontosDoGrafico = evolucao.slice(-QUANTIDADE_DE_PONTOS_NO_GRAFICO);
  const cargaAtual = evolucao.at(-1)?.carga_maxima;
  const diferencaDesdeOInicio =
    evolucao.length > 1 ? evolucao[evolucao.length - 1].carga_maxima - evolucao[0].carga_maxima : null;

  const exerciciosComHistorico = exercicios.filter((exercicio) => exercicio.tem_historico);
  const exerciciosSemHistorico = exercicios.filter((exercicio) => !exercicio.tem_historico);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-5 pt-14 pb-32">
      <h1 className="font-titulo text-4xl font-bold">Evolução</h1>

      <label className="flex flex-col gap-1.5 text-sm font-semibold text-texto-secundario">
        Exercício
        <select
          value={exercicioSelecionadoId ?? ''}
          onChange={(evento) => setExercicioSelecionadoId(Number(evento.target.value))}
          className="h-12 rounded-xl border border-borda bg-superficie px-3 text-base font-semibold text-texto outline-none focus:border-texto"
        >
          {exerciciosComHistorico.length > 0 && (
            <optgroup label="Com registros">
              {exerciciosComHistorico.map((exercicio) => (
                <option key={exercicio.id} value={exercicio.id}>
                  {exercicio.nome}
                </option>
              ))}
            </optgroup>
          )}
          <optgroup label="Sem registros ainda">
            {exerciciosSemHistorico.map((exercicio) => (
              <option key={exercicio.id} value={exercicio.id}>
                {exercicio.nome}
              </option>
            ))}
          </optgroup>
        </select>
      </label>

      <section className="flex flex-col gap-4 rounded-3xl bg-superficie p-5 shadow-sm">
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-texto-secundario">
              Carga máxima{exercicioSelecionado ? ` — ${exercicioSelecionado.nome}` : ''}
            </span>
            <span className="font-titulo text-4xl leading-none font-bold">
              {cargaAtual !== undefined ? `${formatarCarga(cargaAtual)} kg` : '—'}
            </span>
          </div>
          {diferencaDesdeOInicio !== null && diferencaDesdeOInicio !== 0 && (
            <span className="rounded-xl bg-destaque px-2.5 py-1.5 text-sm font-bold">
              {diferencaDesdeOInicio > 0 ? '+' : ''}
              {formatarCarga(diferencaDesdeOInicio)} kg
            </span>
          )}
        </div>

        {!carregandoEvolucao && pontosDoGrafico.length === 0 && (
          <p className="py-10 text-center text-sm text-texto-secundario">
            Nenhuma carga registrada nesse exercício ainda
          </p>
        )}

        {pontosDoGrafico.length > 0 && <GraficoEvolucao pontos={pontosDoGrafico} />}
      </section>

      <section className="flex flex-col gap-2.5">
        <h2 className="text-lg font-bold">Treinos recentes</h2>

        {sessoes.length === 0 && (
          <p className="text-sm text-texto-secundario">Nenhum treino finalizado ainda</p>
        )}

        {sessoes.slice(0, 10).map((sessao) => {
          const dataDoTreino = new Date(sessao.iniciada_em);

          return (
            <article
              key={sessao.id}
              className="flex items-center gap-3.5 rounded-2xl bg-superficie px-3.5 py-3 shadow-sm"
            >
              <div className="flex size-11 flex-col items-center justify-center rounded-xl bg-superficie-2 leading-none">
                <span className="font-titulo text-xl font-bold">{dataDoTreino.getDate()}</span>
                <span className="text-[10px] text-texto-secundario uppercase">
                  {formatadorDiaEMes.formatToParts(dataDoTreino).find((parte) => parte.type === 'month')?.value}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-bold">
                  {sessao.treino ? `Treino ${sessao.treino.letra} — ${sessao.treino.nome}` : 'Treino removido'}
                </span>
                <span className="text-sm text-texto-secundario">
                  {sessao.total_series} séries · {formatarDuracaoEmMinutos(sessao.duracao_minutos ?? 0)}
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <MenuInferior />
    </main>
  );
}