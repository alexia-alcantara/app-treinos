const URL_API = import.meta.env.VITE_API_URL;
const CHAVE_TOKEN = 'treino:token';
export const EVENTO_SESSAO_EXPIRADA = 'treino:sessao-expirada';

export class ErroApi extends Error {
  status: number;

  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.status = status;
  }
}

export const obterToken = () => localStorage.getItem(CHAVE_TOKEN);
export const salvarToken = (token: string) => localStorage.setItem(CHAVE_TOKEN, token);
export const removerToken = () => localStorage.removeItem(CHAVE_TOKEN);

export async function requisitar<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const token = obterToken();

  const resposta = await fetch(`${URL_API}${caminho}`, {
    ...opcoes,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opcoes.headers,
    },
  });

  if (resposta.status === 401 && token) {
    removerToken();
    window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA));
  }

  if (resposta.status === 204) {
    return undefined as T;
  }

  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw new ErroApi(resposta.status, corpo?.erro ?? corpo?.message ?? 'Erro inesperado');
  }

  return corpo as T;
}