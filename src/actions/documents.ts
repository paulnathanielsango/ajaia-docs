"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  canAccessDocument,
  canDeleteDocument,
  canShareDocument,
} from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";
import {
  deleteDocumentSchema,
  isAllowedImportFile,
  shareDocumentSchema,
  updateDocumentSchema,
} from "@/lib/validations";

export type DocumentRecord = {
  id: string;
  title: string;
  content: Record<string, unknown>;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type DocumentWithOwner = DocumentRecord & {
  owner_email: string | null;
};

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/");
  }

  return { supabase, user };
}

async function getSharedUserIds(supabase: SupabaseClient, documentId: string) {
  const { data } = await supabase
    .from("document_shares")
    .select("user_id")
    .eq("document_id", documentId);

  return data?.map((row) => row.user_id) ?? [];
}

async function getUserEmailById(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase.rpc("get_user_email_by_id", {
    target_user_id: userId,
  });

  if (error || typeof data !== "string") {
    return null;
  }

  return data;
}

export async function createDocument() {
  const { supabase, user } = await getCurrentUser();

  const { data, error } = await supabase
    .from("documents")
    .insert({
      owner_id: user.id,
      title: "Untitled",
      content: {},
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create document");
  }

  revalidatePath("/documents");
  redirect(`/documents/${data.id}`);
}

export async function updateDocument(input: {
  id: string;
  title?: string;
  content?: Record<string, unknown>;
}) {
  const parsed = updateDocumentSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "Invalid document data." };
  }

  const { supabase, user } = await getCurrentUser();
  const { id, title, content } = parsed.data;

  const { data: document, error: fetchError } = await supabase
    .from("documents")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (fetchError || !document) {
    return { error: "Document not found." };
  }

  const sharedUserIds = await getSharedUserIds(supabase, id);

  if (!canAccessDocument(user.id, document.owner_id, sharedUserIds)) {
    return { error: "You do not have access to this document." };
  }

  const updates: { title?: string; content?: Record<string, unknown> } = {};
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;

  const { error } = await supabase.from("documents").update(updates).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/documents");
  revalidatePath(`/documents/${id}`);
  return { success: true };
}

export async function deleteDocument(input: { id: string }) {
  const parsed = deleteDocumentSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "Invalid document id." };
  }

  const { supabase, user } = await getCurrentUser();
  const { id } = parsed.data;

  const { data: document, error: fetchError } = await supabase
    .from("documents")
    .select("owner_id")
    .eq("id", id)
    .single();

  if (fetchError || !document) {
    return { error: "Document not found." };
  }

  if (!canDeleteDocument(user.id, document.owner_id)) {
    return { error: "Only the owner can delete this document." };
  }

  const { error } = await supabase.from("documents").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/documents");
  redirect("/documents");
}

export async function deleteDocumentForm(formData: FormData): Promise<void> {
  const id = formData.get("id");
  const result = await deleteDocument({
    id: typeof id === "string" ? id : "",
  });

  if (result?.error) {
    throw new Error(result.error);
  }
}

export async function shareDocument(input: {
  documentId: string;
  email: string;
}) {
  const parsed = shareDocumentSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  const { supabase, user } = await getCurrentUser();
  const { documentId, email } = parsed.data;

  const { data: document, error: fetchError } = await supabase
    .from("documents")
    .select("owner_id")
    .eq("id", documentId)
    .single();

  if (fetchError || !document) {
    return { error: "Document not found." };
  }

  if (!canShareDocument(user.id, document.owner_id)) {
    return { error: "Only the owner can share this document." };
  }

  const { data: recipientId, error: lookupError } = await supabase.rpc(
    "get_user_id_by_email",
    { target_email: email },
  );

  if (lookupError || !recipientId) {
    return { error: "No user found with that email address." };
  }

  if (recipientId === user.id) {
    return { error: "You already own this document." };
  }

  const { error } = await supabase.from("document_shares").insert({
    document_id: documentId,
    user_id: recipientId,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "This user already has access." };
    }
    return { error: error.message };
  }

  revalidatePath("/documents");
  revalidatePath(`/documents/${documentId}`);
  return { success: true };
}

export async function importFromFile(formData: FormData) {
  const { supabase, user } = await getCurrentUser();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { error: "No file provided." };
  }

  if (!isAllowedImportFile(file.name)) {
    return { error: "Only .txt and .md files are supported." };
  }

  const text = await file.text();
  const title = file.name.replace(/\.(txt|md)$/i, "") || "Imported document";
  const content = textToTiptapJson(text);

  const { data, error } = await supabase
    .from("documents")
    .insert({
      owner_id: user.id,
      title,
      content,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Failed to import file." };
  }

  revalidatePath("/documents");
  redirect(`/documents/${data.id}`);
}

function textToTiptapJson(text: string): Record<string, unknown> {
  const paragraphs = text.split(/\r?\n/);

  return {
    type: "doc",
    content: paragraphs.map((line) => ({
      type: "paragraph",
      content: line ? [{ type: "text", text: line }] : [],
    })),
  };
}

export async function getOwnedDocuments(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as DocumentRecord[];
}

export async function getSharedDocuments(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("document_shares")
    .select(
      `
      document_id,
      documents (
        id,
        title,
        content,
        owner_id,
        created_at,
        updated_at
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const documents = (data ?? [])
    .flatMap((row) => {
      const doc = row.documents;
      if (!doc) return [];
      return Array.isArray(doc) ? doc : [doc];
    })
    .filter((doc): doc is DocumentRecord => Boolean(doc?.id));

  const enriched: DocumentWithOwner[] = await Promise.all(
    documents.map(async (doc) => ({
      ...doc,
      owner_email: await getUserEmailById(supabase, doc.owner_id),
    })),
  );

  return enriched;
}

export async function getDocumentById(documentId: string) {
  const { supabase, user } = await getCurrentUser();

  const { data: document, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (error || !document) {
    return null;
  }

  const sharedUserIds = await getSharedUserIds(supabase, documentId);

  if (!canAccessDocument(user.id, document.owner_id, sharedUserIds)) {
    return null;
  }

  return {
    ...(document as DocumentRecord),
    isOwner: user.id === document.owner_id,
  };
}
