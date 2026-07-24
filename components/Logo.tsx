/* "Tico" lleva el trencito de la bandera (azul-blanco-rojo-blanco-azul,
   proporción 1:1:2:1:1) recortado en las letras — el detalle que le da
   identidad al wordmark sin meter color brillante al resto del sitio. */
const FLAG_CLIP = {
  backgroundImage:
    "linear-gradient(180deg, #4a6fa5 0 16.6%, #e9e7e0 16.6% 33.3%, #b6495a 33.3% 66.6%, #e9e7e0 66.6% 83.3%, #4a6fa5 83.3% 100%)",
};

export function Logo({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex flex-col leading-none">
      <span className="font-montserrat text-sm font-bold tracking-tight text-zinc-50">
        <span className="bg-clip-text text-transparent" style={FLAG_CLIP}>
          Tico
        </span>
        Finanza
      </span>
      {subtitle && (
        <span className="font-montserrat text-[11px] font-light text-zinc-500">
          {subtitle}
        </span>
      )}
    </div>
  );
}
