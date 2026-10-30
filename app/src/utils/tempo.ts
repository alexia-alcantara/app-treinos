export function formatarCronometro(totalDeSegundos: number) {
  const horas = Math.floor(totalDeSegundos / 3600);
  const minutos = Math.floor((totalDeSegundos % 3600) / 60);
  const segundos = totalDeSegundos % 60;
  const minutosESegundos = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

  return horas > 0 ? `${horas}:${minutosESegundos}` : minutosESegundos;
}