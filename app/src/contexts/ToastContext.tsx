import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type TipoToast = 'sucesso' | 'erro';

type Toast = {
  id: number;
  mensagem: string;
  tipo: TipoToast;
};

type ValorToast = {
  mostrarToast: (mensagem: string, tipo?: TipoToast) => void;
};

const DURACAO_DO_TOAST_EM_MS = 3000;

const ToastContext = createContext<ValorToast | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const mostrarToast = useCallback((mensagem: string, tipo: TipoToast = 'sucesso') => {
    const id = Date.now() + Math.random();
    setToasts((anteriores) => [...anteriores, { id, mensagem, tipo }]);

    setTimeout(() => {
      setToasts((anteriores) => anteriores.filter((toast) => toast.id !== id));
    }, DURACAO_DO_TOAST_EM_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-28 z-50 flex flex-col items-center gap-2 px-5">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`flex max-w-sm items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${
              toast.tipo === 'erro' ? 'bg-erro' : 'bg-texto'
            }`}
          >
            <span
              aria-hidden="true"
              className={`size-2 shrink-0 rounded-full ${toast.tipo === 'erro' ? 'bg-white' : 'bg-destaque'}`}
            />
            {toast.mensagem}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const contexto = useContext(ToastContext);

  if (!contexto) {
    throw new Error('useToast precisa estar dentro de ToastProvider');
  }

  return contexto;
}