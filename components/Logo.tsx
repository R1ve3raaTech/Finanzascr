export function Logo({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex min-w-0 flex-col leading-none">
      <span className="font-montserrat text-sm font-bold tracking-tight text-ink">
        TicoFinanza
      </span>
      {/* El subtítulo se esconde en pantallas chicas: ahí partía en dos líneas
          y desalineaba el header contra el botón. */}
      {subtitle && (
        <span className="hidden whitespace-nowrap font-montserrat text-[11px] font-light text-ink-3 sm:inline">
          {subtitle}
        </span>
      )}
    </div>
  );
}
