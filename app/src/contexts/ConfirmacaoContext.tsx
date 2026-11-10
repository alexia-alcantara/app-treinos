import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

type OpcoesConfirmacao = {
  titulo: string;
  mensagem?: string;
  textoConfirmar: string;
  textoCancelar?: string;
  perigoso?: boolean;
};

type PedidoDeConfirmacao = OpcoesConfirmacao & {
  responder: (confirmou: boolean) => void;
};

type ValorConfirmacao = {
  confirmar: (opcoes: OpcoesConfirmacao) => Promise<boolean>;
};

const ConfirmacaoContext = createContext<ValorConfirmacao | null>(null);

export function ConfirmacaoProvider({ children }: { children: ReactNode }) {
  const [pedido, setPedido] = useState<PedidoDeConfirmacao | null>(null);

  const confirmar = useCallback(
    (opcoes: OpcoesConfirmacao) =>
      new Promise<boolean>((resolve) => setPedido({ ...opcoes, responder: resolve })),
    [],
  );

  const responder = useCallback(
    (confirmou: boolean) => {
      pedido?.responder(confirmou);
      setPedido(null);
    },
    [pedido],
  );

  useEffect(() => {
    if (!pedido) return;

    const fecharComEsc = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') responder(false);
    };

    window.addEventListener('keydown', fecharComEsc);
    return () => window.removeEventListener('keydown', fecharComEsc);
  }, [pedido, responder]);

  return (
    <ConfirmacaoContext.Provider value={{ confirmar }}>
      {children}
      {pedido && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-texto/40"
          onClick={() => responder(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="titulo-confirmacao"
            onClick={(evento) => evento.stopPropagation()}
            className="flex w-full max-w-md flex-col gap-5 rounded-t-3xl bg-superficie px-5 pt-6 pb-8"
          >
            <div className="flex flex-col gap-1.5">
              <h2 id="titulo-confirmacao" className="font-titulo text-3xl leading-none font-bold">
                {pedido.titulo}
              </h2>
              {pedido.mensagem && <p className="text-texto-secundario">{pedido.mensagem}</p>}
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                autoFocus
                onClick={() => responder(true)}
                className={`h-13 rounded-2xl text-base font-bold text-white ${
                  pedido.perigoso ? 'bg-erro' : 'bg-texto'
                }`}
              >
                {pedido.textoConfirmar}
              </button>
              <button
                type="button"
                onClick={() => responder(false)}
                className="h-13 rounded-2xl bg-superficie-2 text-base font-bold"
              >
                {pedido.textoCancelar ?? 'Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmacaoContext.Provider>
  );
}

export function useConfirmacao() {
  const contexto = useContext(ConfirmacaoContext);

  if (!contexto) {
    throw new Error('useConfirmacao precisa estar dentro de ConfirmacaoProvider');
  }

  return contexto;
}