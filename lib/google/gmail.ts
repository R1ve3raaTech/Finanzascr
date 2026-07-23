import "server-only";

export interface GmailMessage {
  id: string;
  from: string;
  subject: string;
  bodyText: string;
  receivedAt: string;
}

interface GmailPayloadPart {
  mimeType: string;
  filename?: string;
  body?: { data?: string; attachmentId?: string };
  parts?: GmailPayloadPart[];
}

function decodeBase64Url(data: string): string {
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf-8");
}

const HTML_ENTITIES: Record<string, string> = {
  aacute: "á", Aacute: "Á",
  eacute: "é", Eacute: "É",
  iacute: "í", Iacute: "Í",
  oacute: "ó", Oacute: "Ó",
  uacute: "ú", Uacute: "Ú",
  ntilde: "ñ", Ntilde: "Ñ",
  uuml: "ü", Uuml: "Ü",
  iexcl: "¡", iquest: "¿",
  amp: "&", quot: '"', apos: "'", lt: "<", gt: ">",
};

/** Algunos bancos (ej. BCR) mandan entidades HTML con nombre/número en vez
 * de UTF-8 directo, y eso rompe cualquier regex con acentos si no se
 * decodifican primero. */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&([a-zA-Z]+);/g, (match, name) => HTML_ENTITIES[name] ?? match)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function stripHtml(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, "\n")
      .replace(/&nbsp;/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{2,}/g, "\n")
      .trim()
  );
}

function extractBody(part: GmailPayloadPart): { plain?: string; html?: string } {
  if (part.mimeType === "text/plain" && part.body?.data) {
    return { plain: decodeBase64Url(part.body.data) };
  }
  if (part.mimeType === "text/html" && part.body?.data) {
    return { html: decodeBase64Url(part.body.data) };
  }
  if (part.parts) {
    for (const child of part.parts) {
      const result = extractBody(child);
      if (result.plain || result.html) return result;
    }
  }
  return {};
}

/** Junta las partes que son adjuntos PDF (filename .pdf con attachmentId). */
function findPdfParts(part: GmailPayloadPart): GmailPayloadPart[] {
  const found: GmailPayloadPart[] = [];
  if (part.filename?.toLowerCase().endsWith(".pdf") && part.body?.attachmentId) {
    found.push(part);
  }
  if (part.parts) {
    for (const child of part.parts) found.push(...findPdfParts(child));
  }
  return found;
}

async function getAttachmentData(
  accessToken: string,
  messageId: string,
  attachmentId: string
): Promise<Buffer> {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`Gmail attachment falló: ${response.status}`);
  }
  const data = await response.json();
  const normalized = (data.data as string).replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64");
}

/**
 * Varios bancos (ej. Banco Popular en notificaciones de transferencia) no
 * ponen el detalle en el texto del correo sino en un PDF adjunto. Se extrae
 * el texto de cada PDF adjunto y se concatena al cuerpo para que los
 * parsers regex existentes lo puedan leer igual que un correo de texto.
 */
async function extractPdfAttachmentsText(
  accessToken: string,
  messageId: string,
  payload: GmailPayloadPart
): Promise<string> {
  const pdfParts = findPdfParts(payload);
  if (pdfParts.length === 0) return "";

  // Import dinámico (no al tope del archivo): pdf-parse depende de un
  // binario nativo (@napi-rs/canvas) que en algunos entornos serverless
  // (ej. Vercel) no está disponible y hace fallar la carga del módulo. Si
  // el import se hiciera arriba del archivo, ese fallo tumbaría cualquier
  // acción del servidor que comparta este módulo, no solo la lectura de
  // PDFs — con el import adentro del try, si falla, simplemente se
  // ignoran los PDFs de este correo y todo lo demás sigue funcionando.
  let PDFParse: typeof import("pdf-parse").PDFParse;
  try {
    ({ PDFParse } = await import("pdf-parse"));
  } catch (err) {
    console.error(`[gmail] pdf-parse no disponible en este entorno:`, err);
    return "";
  }

  const texts: string[] = [];
  for (const part of pdfParts) {
    try {
      const buffer = await getAttachmentData(accessToken, messageId, part.body!.attachmentId!);
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      texts.push(result.text);
    } catch (err) {
      console.error(`[gmail] no se pudo leer el PDF adjunto de ${messageId}:`, err);
    }
  }
  return texts.join("\n");
}

/**
 * Busca ids de mensajes que matcheen la query, paginando hasta juntar
 * maxResults en total. Gmail limita cada página a 100 resultados como
 * mucho; sin paginar, un usuario con mucho volumen de correo bancario
 * perdía en silencio los mensajes más viejos que no entraban en la
 * primera página.
 */
export async function listMessageIds(
  accessToken: string,
  query: string,
  maxResults = 100
): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
    url.searchParams.set("q", query);
    url.searchParams.set("maxResults", String(Math.min(100, maxResults - ids.length)));
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Gmail list falló: ${response.status} ${body}`);
    }
    const data = await response.json();
    ids.push(...(data.messages ?? []).map((m: { id: string }) => m.id));
    pageToken = data.nextPageToken;
  } while (pageToken && ids.length < maxResults);

  return ids.slice(0, maxResults);
}

/** Obtiene un mensaje completo y devuelve su texto plano y remitente. */
export async function getMessage(
  accessToken: string,
  id: string
): Promise<GmailMessage> {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`Gmail get falló: ${response.status}`);
  }
  const data = await response.json();

  const headers: { name: string; value: string }[] = data.payload?.headers ?? [];
  const from = headers.find((h) => h.name === "From")?.value ?? "";
  const subject = headers.find((h) => h.name === "Subject")?.value ?? "";

  const payload = data.payload as GmailPayloadPart;
  const { plain, html } = extractBody(payload);
  let textBody = plain ?? (html ? stripHtml(html) : data.snippet ?? "");
  // Algunos correos ponen HTML crudo en la parte "text/plain" (mal armados
  // del lado del remitente); si lo que quedó todavía tiene tags, se limpia
  // igual, si no ningún parser lo puede leer.
  if (/<[a-z][\s\S]*>/i.test(textBody)) {
    textBody = stripHtml(textBody);
  } else if (/&[a-zA-Z]+;|&#\d+;/.test(textBody)) {
    textBody = decodeHtmlEntities(textBody);
  }
  const pdfText = await extractPdfAttachmentsText(accessToken, id, payload);
  const bodyText = pdfText ? `${textBody}\n${pdfText}` : textBody;
  const receivedAt = new Date(Number(data.internalDate)).toISOString();

  return { id, from, subject, bodyText, receivedAt };
}
