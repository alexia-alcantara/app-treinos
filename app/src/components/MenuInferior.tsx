import { NavLink } from 'react-router';

const ITENS_DO_MENU = [
  {
    caminho: '/',
    rotulo: 'Início',
    icone: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  },
  {
    caminho: '/evolucao',
    rotulo: 'Evolução',
    icone: (
      <>
        <polyline points="3 17 9 11 13 15 21 7" />
        <polyline points="15 7 21 7 21 13" />
      </>
    ),
  },
];

export default function MenuInferior() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-borda bg-superficie pb-[max(env(safe-area-inset-bottom),12px)]">
      <div className="mx-auto grid max-w-md grid-cols-2 px-3 pt-2.5">
        {ITENS_DO_MENU.map((item) => (
          <NavLink
            key={item.caminho}
            to={item.caminho}
            end
            className={({ isActive }) =>
              `flex min-h-11 flex-col items-center justify-center gap-1 text-xs ${
                isActive ? 'font-bold text-texto' : 'font-semibold text-texto-secundario'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`flex rounded-xl px-4 py-1 ${isActive ? 'bg-destaque' : ''}`}>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {item.icone}
                  </svg>
                </span>
                {item.rotulo}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}