import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { PontoDeEvolucao } from '../types';

type Props = {
  pontos: PontoDeEvolucao[];
};

type DicaProps = {
  active?: boolean;
  payload?: { payload: PontoDeEvolucao }[];
};

const estiloDosEixos = { fontSize: 11, fill: 'var(--color-texto-secundario)' };

export function formatarDiaDoGrafico(diaIso: string) {
  const [, mes, dia] = diaIso.split('-');
  return `${Number(dia)}/${Number(mes)}`;
}

export function formatarCarga(carga: number) {
  return carga.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

function DicaDoGrafico({ active, payload }: DicaProps) {
  const ponto = payload?.[0]?.payload;

  if (!active || !ponto) {
    return null;
  }

  return (
    <div className="flex flex-col rounded-xl bg-texto px-3 py-2 text-white shadow-lg">
      <span className="text-xs text-white/70">{formatarDiaDoGrafico(ponto.dia)}</span>
      <span className="font-titulo text-xl leading-none font-bold">{formatarCarga(ponto.carga_maxima)} kg</span>
    </div>
  );
}

export default function GraficoEvolucao({ pontos }: Props) {
  return (
    <div className="h-52 w-full" aria-label="Gráfico de carga máxima por dia">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={pontos} margin={{ top: 12, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="preenchimentoDaCarga" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-destaque)" stopOpacity={0.55} />
              <stop offset="100%" stopColor="var(--color-destaque)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--color-borda)" strokeDasharray="4 4" />
          <XAxis
            dataKey="dia"
            tickFormatter={formatarDiaDoGrafico}
            tick={estiloDosEixos}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            domain={[
              (menor: number) => Math.max(0, Math.floor((menor - 5) / 5) * 5),
              (maior: number) => Math.ceil((maior + 5) / 5) * 5,
            ]}
            tickCount={3}
            allowDecimals={false}
            tick={estiloDosEixos}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip content={<DicaDoGrafico />} cursor={{ stroke: 'var(--color-texto-secundario)', strokeDasharray: '4 4' }} />
          <Area
            type="monotone"
            dataKey="carga_maxima"
            stroke="var(--color-texto)"
            strokeWidth={2.5}
            fill="url(#preenchimentoDaCarga)"
            dot={{ r: 4, fill: 'var(--color-superficie)', stroke: 'var(--color-texto)', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: 'var(--color-destaque)', stroke: 'var(--color-texto)', strokeWidth: 2 }}
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}