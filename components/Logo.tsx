export function Logo({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex flex-col leading-none">
      <span className="font-montserrat text-sm font-bold tracking-tight text-zinc-50">
        Ro<span className="text-emerald-400">KK</span>bo
      </span>
      {subtitle && (
        <span className="font-montserrat text-[11px] font-light text-zinc-500">
          {subtitle}
        </span>
      )}
    </div>
  );
}
