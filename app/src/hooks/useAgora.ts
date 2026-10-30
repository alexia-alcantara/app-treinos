import { useEffect, useState } from 'react';

export function useAgora(intervaloEmMs: number) {
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const intervalo = setInterval(() => setAgora(Date.now()), intervaloEmMs);
    return () => clearInterval(intervalo);
  }, [intervaloEmMs]);

  return agora;
}