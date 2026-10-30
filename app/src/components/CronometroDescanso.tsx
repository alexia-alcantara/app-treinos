import { useAgora } from '../hooks/useAgora';
import { formatarCronometro } from '../utils/tempo';

type Props = {
  terminaEm: number;
  onAdicionarSegundos: (segundos: number) => void;
  onPular: () => void;
};

export default function CronometroDescanso({ terminaEm, onAdicionarSegundos, onPular }: Props) {
  const agora = useAgora(250);
  const segundosRestantes = Math.max(0, Math.ceil((terminaEm - agora) / 1000));

  if (segundosRestantes === 0) {
    return null;
  }

  return (
    <section className="flex items-center justify-between rounded-2xl bg-destaque px-4 py-3.5 text-texto">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold">Descanso</span>
        <span className="font-titulo text-4xl leading-none font-bold" aria-live="polite">
          {formatarCronometro(segundosRestantes)}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onAdicionarSegundos(15)}
          className="h-11 rounded-xl bg-texto/10 px-3.5 text-[15px] font-bold"
        >
          +15s
        </button>
        <button
          type="button"
          onClick={onPular}
          className="h-11 rounded-xl bg-texto px-3.5 text-[15px] font-bold text-white"
        >
          Pular
        </button>
      </div>
    </section>
  );
}