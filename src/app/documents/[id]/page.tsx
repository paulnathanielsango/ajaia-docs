import { notFound, redirect } from "next/navigation";

import { getDocumentById } from "@/actions/documents";
import { DocumentEditor } from "@/components/editor/document-editor";
import { createClient } from "@/lib/supabase/server";

type DocumentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const document = await getDocumentById(id);

  if (!document) {
    notFound();
  }

  return (
    <DocumentEditor
      documentId={document.id}
      initialTitle={document.title}
      initialContent={document.content}
      isOwner={document.isOwner}
    />
  );
}
