import "server-only";
import { PDFParse } from "pdf-parse";

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

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
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

/** Busca ids de mensajes que matcheen la query de búsqueda de Gmail. */
export async function listMessageIds(
  accessToken: string,
  query: string,
  maxResults = 20
): Promise<string[]> {
  const url = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", String(maxResults));

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gmail list falló: ${response.status} ${body}`);
  }
  const data = await response.json();
  return (data.messages ?? []).map((m: { id: string }) => m.id);
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
  const textBody = plain ?? (html ? stripHtml(html) : data.snippet ?? "");
  const pdfText = await extractPdfAttachmentsText(accessToken, id, payload);
  const bodyText = pdfText ? `${textBody}\n${pdfText}` : textBody;
  const receivedAt = new Date(Number(data.internalDate)).toISOString();

  return { id, from, subject, bodyText, receivedAt };
}
