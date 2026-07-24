export function Logo({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex flex-col leading-none">
      <span className="font-montserrat text-sm font-bold tracking-tight text-zinc-50">
        <span className="text-sky-400">Tico</span>Finanza
      </span>
      {subtitle && (
        <span className="font-montserrat text-[11px] font-light text-zinc-500">
          {subtitle}
        </span>
      )}
    </div>
  );
}
