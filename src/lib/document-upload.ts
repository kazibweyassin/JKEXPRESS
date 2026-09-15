export const DOCUMENT_MAX_BYTES = 25 * 1024 * 1024;

export const DOCUMENT_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/zip": "zip",
  "text/plain": "txt",
};

const allowedExtensions = new Set(Object.values(DOCUMENT_TYPES));

export function documentExtension(file: { name: string; type: string }) {
  const fromType = DOCUMENT_TYPES[file.type];
  if (fromType) return fromType;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (allowedExtensions.has(ext)) return ext;
  throw new Error("Upload a PDF, Word, Excel, image, zip or text file.");
}

export function documentKey(id: string, extension: string) {
  const year = new Date().getFullYear();
  return `documents/${year}/${id}.${extension}`;
}

export function documentDisposition(fileName: string, extension: string) {
  const safe = fileName.replace(/["\r\n]/g, "_") || `document.${extension}`;
  const inline = ["pdf", "jpg", "png", "webp", "txt"].includes(extension);
  return `${inline ? "inline" : "attachment"}; filename="${safe}"`;
}
