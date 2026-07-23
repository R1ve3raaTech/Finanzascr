import {
  EnvelopeSimple,
  ForkKnife,
  Lightning,
  ShoppingCart,
} from "@phosphor-icons/react/dist/ssr";

const incoming = [
  {
    id: "sinpe",
    from: "SINPE Móvil",
    subject: "Transferencia recibida",
    body: "Recibiste ₡25.000 de María Solano",
    result: {
      icon: Lightning,
      description: "María Solano",
      bank: "SINPE",
      amount: "+₡25.000",
      income: true,
    },
    emailClass: "mockup-email-0",
    resultClass: "mockup-result-0",
  },
  {
    id: "bac",
    from: "BAC Credomatic",
    subject: "Notificación de compra",
    body: "Compra por ₡8.450 en AutoMercado",
    result: {
      icon: ShoppingCart,
      description: "AutoMercado",
      bank: "BAC",
      amount: "-₡8.450",
      income: false,
    },
    emailClass: "mockup-email-1",
    resultClass: "mockup-result-1",
  },
  {
    id: "bcr",
    from: "BCR",
    subject: "Compra con tarjeta",
    body: "Pago de $12.90 en Uber Eats",
    result: {
      icon: ForkKnife,
      description: "Uber Eats",
      bank: "BCR",
      amount: "-$12,90",
      income: false,
    },
    emailClass: "mockup-email-2",
    resultClass: "mockup-result-2",
  },
];

export function MockupPreview() {
  return (
    <div
      aria-hidden="true"
      className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur"
    >
      {/* Correo entrante */}
      <div className="relative h-24">
        {incoming.map((entry) => (
          <div
            key={entry.id}
            className={`absolute inset-x-0 top-0 flex items-start gap-3 rounded-xl border border-white/10 bg-zinc-800/80 p-3.5 ${entry.emailClass}`}
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700">
              <EnvelopeSimple size={16} weight="bold" className="text-zinc-300" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-zinc-300">{entry.from}</p>
              <p className="truncate text-sm text-zinc-100">{entry.subject}</p>
              <p className="truncate text-xs text-zinc-500">{entry.body}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mb-3 mt-4 text-xs font-medium text-zinc-500">
        Tus movimientos
      </p>

      {/* Lista de transacciones generadas */}
      <div className="relative h-44">
        <p className="mockup-placeholder absolute inset-x-0 top-0 rounded-xl border border-dashed border-white/10 p-3 text-center text-xs text-zinc-600">
          Esperando correos bancarios
        </p>
        {incoming.map((entry, i) => {
          const t = entry.result;
          const Icon = t.icon;
          return (
            <div
              key={entry.id}
              className={`absolute inset-x-0 flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900 p-3 ${entry.resultClass}`}
              style={{ top: `${i * 56}px` }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800">
                <Icon size={16} weight="bold" className="text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-zinc-100">{t.description}</p>
                <p className="text-xs text-zinc-500">{t.bank}</p>
              </div>
              <span
                className={`font-mono text-sm ${
                  t.income ? "text-emerald-400" : "text-zinc-300"
                }`}
              >
                {t.amount}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
