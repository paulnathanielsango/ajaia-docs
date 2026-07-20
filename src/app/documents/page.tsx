import { redirect } from "next/navigation";

import {
  getOwnedDocuments,
  getSharedDocuments,
} from "@/actions/documents";
import { DocumentList } from "@/components/document-list";
import { createClient } from "@/lib/supabase/server";
import { displayNameFromUser } from "@/lib/user-display";

export default async function DocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const [ownedDocuments, sharedDocuments] = await Promise.all([
    getOwnedDocuments(user.id),
    getSharedDocuments(user.id),
  ]);

  return (
    <DocumentList
      ownedDocuments={ownedDocuments}
      sharedDocuments={sharedDocuments}
      userName={displayNameFromUser(user)}
    />
  );
}
