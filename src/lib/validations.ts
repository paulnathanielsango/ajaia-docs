import { z } from "zod";

export const updateDocumentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
});

export const deleteDocumentSchema = z.object({
  id: z.string().uuid(),
});

export const shareDocumentSchema = z.object({
  documentId: z.string().uuid(),
  email: z.string().email(),
});

export const ALLOWED_IMPORT_EXTENSIONS = [".txt", ".md"] as const;

export function isAllowedImportFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  return ALLOWED_IMPORT_EXTENSIONS.some((ext) => lower.endsWith(ext));
}
