import type { EmailParser } from "./types";

/**
 * Comprobante de "Transferencia Banca Móvil" de Banco Popular
 * (bancamovil@bpdc.fi.cr): mover plata entre sobres/cuentas propias, ej. a
 * "Ahorro". BP manda un solo correo con origen y destino. Cuando el nombre
 * es el mismo en ambos lados, el dinero no salió del usuario y no debe
 * registrarse como ingreso ni gasto — se ignora a propósito, en vez de que
 * funcione "por accidente" al no matchear ningún otro parser.
 */
export const parseInternalTransfer: EmailParser = (bodyText) => {
  if (!/Comprobante de Transferencia Banca M[oó]vil/i.test(bodyText)) return null;

  const nombreOrigen = bodyText
    .match(/Origen[\s\S]*?A nombre de:\s*([^\n]+)/i)?.[1]
    ?.trim()
    .toLowerCase();
  const nombreDestino = bodyText
    .match(/Destino[\s\S]*?A nombre de:\s*([^\n]+)/i)?.[1]
    ?.trim()
    .toLowerCase();

  if (nombreOrigen && nombreDestino && nombreOrigen === nombreDestino) {
    return null;
  }

  // Mismo formato pero a nombre de otra persona: no tenemos un correo real
  // de ejemplo para este caso, se deja sin manejar en vez de adivinar.
  return null;
};
