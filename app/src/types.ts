export type Usuario = {
  id: number;
  name: string;
  email: string;
};

export type TreinoResumo = {
  id: number;
  letra: string;
  nome: string;
  total_exercicios: number;
};

export type SessaoResumo = {
  id: number;
  iniciada_em: string;
  finalizada_em: string | null;
  duracao_minutos: number | null;
  total_series: number;
  treino: Pick<TreinoResumo, 'id' | 'letra' | 'nome'> | null;
};

export type ExercicioPlanejado = {
  id: number;
  exercicio_id: number;
  ordem: number;
  series: number;
  repeticoes: number | null;
  duracao_segundos: number | null;
  carga_kg: number | null;
  descanso_segundos: number;
  exercicio: {
    id: number;
    nome: string;
    grupo_muscular: string | null;
  };
};

export type SerieRealizada = {
  id: number;
  exercicio_id: number;
  numero_serie: number;
  carga_kg: number | null;
  repeticoes: number | null;
  duracao_segundos: number | null;
};

export type SessaoDetalhada = {
  id: number;
  iniciada_em: string;
  finalizada_em: string | null;
  treino: {
    id: number;
    letra: string;
    nome: string;
    exercicios_planejados: ExercicioPlanejado[];
  } | null;
  series_realizadas: SerieRealizada[];
};

export type UltimaVez = {
  data: string | null;
  series: Pick<SerieRealizada, 'numero_serie' | 'carga_kg' | 'repeticoes' | 'duracao_segundos'>[];
};

export type DadosDaSerie = {
  carga_kg: number | null;
  repeticoes?: number;
  duracao_segundos?: number;
};

export type ExercicioResumo = {
  id: number;
  nome: string;
  grupo_muscular: string | null;
  tem_historico: boolean;
};

export type PontoDeEvolucao = {
  dia: string;
  carga_maxima: number;
};