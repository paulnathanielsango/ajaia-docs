import Link from "next/link";
import { FileTextIcon, PlusIcon, Trash2Icon } from "lucide-react";

import {
  createDocument,
  deleteDocumentForm,
  type DocumentRecord,
  type DocumentWithOwner,
} from "@/actions/documents";
import { FileImportButton } from "@/components/file-import-button";
import { AppHeader } from "@/components/layout";
import {
  LandingFontProvider,
  LandingShell,
} from "@/components/landing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

type DocumentListProps = {
  ownedDocuments: DocumentRecord[];
  sharedDocuments: DocumentWithOwner[];
  userName: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function DocumentRow({
  id,
  title,
  updatedAt,
  badge,
  showDelete,
}: {
  id: string;
  title: string;
  updatedAt: string;
  badge?: string;
  showDelete?: boolean;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3.5 transition-all hover:border-white/15 hover:bg-white/[0.06]">
      <Link
        href={`/documents/${id}`}
        className="flex min-w-0 flex-1 items-center justify-between gap-4"
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-400/10 text-cyan-300 transition-colors group-hover:border-cyan-300/25 group-hover:bg-cyan-400/15">
            <FileTextIcon className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-[family-name:var(--font-landing-display)] text-[0.9375rem] font-medium tracking-[-0.02em] text-foreground">
              {title}
            </p>
            <p className="mt-0.5 text-[0.8125rem] tracking-[-0.01em] text-white/40">
              Updated {formatDate(updatedAt)}
            </p>
          </div>
        </div>
        {badge ? (
          <Badge
            variant="secondary"
            className="h-auto shrink-0 rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-[0.6875rem] font-medium tracking-[-0.01em] text-violet-200"
          >
            {badge}
          </Badge>
        ) : null}
      </Link>

      {showDelete ? (
        <form action={deleteDocumentForm}>
          <input type="hidden" name="id" value={id} />
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${title}`}
            className="shrink-0 text-white/35 hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2Icon className="size-4" />
          </Button>
        </form>
      ) : null}
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-10 text-center text-[0.875rem] leading-relaxed tracking-[-0.01em] text-white/40">
      {children}
    </p>
  );
}

function DocumentSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <GlassCard variant="default" className={cn(className)}>
      <GlassCardHeader className="gap-1.5 border-b border-white/6 px-6 py-5">
        <GlassCardTitle className="text-[1.0625rem] font-semibold tracking-[-0.02em]">
          {title}
        </GlassCardTitle>
        <GlassCardDescription className="text-[0.875rem] tracking-[-0.01em] text-white/45">
          {description}
        </GlassCardDescription>
      </GlassCardHeader>
      <GlassCardContent className="space-y-2.5 px-6 py-5">
        {children}
      </GlassCardContent>
    </GlassCard>
  );
}

export function DocumentList({
  ownedDocuments,
  sharedDocuments,
  userName,
}: DocumentListProps) {
  return (
    <LandingFontProvider>
      <LandingShell background="dim">
        <AppHeader userName={userName} />

        <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="font-[family-name:var(--font-landing-display)] text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-white/40">
                Workspace
              </p>
              <h1 className="font-[family-name:var(--font-landing-display)] text-[2rem] font-semibold tracking-[-0.04em] text-foreground sm:text-[2.25rem]">
                Your documents
              </h1>
              <p className="max-w-md text-[0.9375rem] leading-relaxed tracking-[-0.01em] text-white/50">
                Create, import, and manage your workspace.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <FileImportButton />
              <form action={createDocument}>
                <Button
                  type="submit"
                  className="h-10 gap-2 rounded-xl bg-white px-4 text-[0.875rem] font-semibold tracking-[-0.01em] text-[#0a0e1a] hover:bg-white/90"
                >
                  <PlusIcon className="size-4" />
                  New document
                </Button>
              </form>
            </div>
          </div>

          <DocumentSection
            title="My Documents"
            description="Documents you own"
          >
            {ownedDocuments.length === 0 ? (
              <EmptyState>
                No documents yet. Create one or import a .txt/.md file.
              </EmptyState>
            ) : (
              ownedDocuments.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  id={doc.id}
                  title={doc.title}
                  updatedAt={doc.updated_at}
                  showDelete
                />
              ))
            )}
          </DocumentSection>

          <DocumentSection
            title="Shared with Me"
            description="Documents others have shared with you"
          >
            {sharedDocuments.length === 0 ? (
              <EmptyState>No shared documents yet.</EmptyState>
            ) : (
              sharedDocuments.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  id={doc.id}
                  title={doc.title}
                  updatedAt={doc.updated_at}
                  badge={`Shared by ${doc.owner_email ?? "owner"}`}
                />
              ))
            )}
          </DocumentSection>
        </main>
      </LandingShell>
    </LandingFontProvider>
  );
}
