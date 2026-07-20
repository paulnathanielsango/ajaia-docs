"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { updateDocument } from "@/actions/documents";
import { DocumentPresenceRail } from "@/components/editor/document-presence-rail";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import {
  LandingFontProvider,
  LandingShell,
} from "@/components/landing";
import { AppHeader, DOCUMENT_SHELL_MAX } from "@/components/layout";
import { ShareDialog } from "@/components/share-dialog";
import {
  GlassCard,
  GlassCardContent,
} from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { RemoteCursors, setRemoteCursors } from "@/extensions/remote-cursors";
import { useDocumentCollaboration } from "@/hooks/use-document-collaboration";
import { cn } from "@/lib/utils";

type DocumentEditorProps = {
  documentId: string;
  initialTitle: string;
  initialContent: Record<string, unknown>;
  isOwner: boolean;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };

export function DocumentEditor({
  documentId,
  initialTitle,
  initialContent,
  isOwner,
}: DocumentEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const titleRef = useRef(title);
  const applyingRemoteRef = useRef(false);
  const lastLocalEditAtRef = useRef(0);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const broadcastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRef = useRef<ReturnType<typeof useEditor>>(null);

  const handleRemoteDoc = useCallback(
    (payload: { title: string; content: Record<string, unknown> }) => {
      if (Date.now() - lastLocalEditAtRef.current < 700) return;

      const editor = editorRef.current;
      if (!editor) return;

      applyingRemoteRef.current = true;
      setTitle(payload.title);
      titleRef.current = payload.title;
      editor.commands.setContent(
        Object.keys(payload.content).length > 0 ? payload.content : emptyDoc,
        { emitUpdate: false },
      );
      queueMicrotask(() => {
        applyingRemoteRef.current = false;
      });
    },
    [],
  );

  const {
    users,
    selfUserId,
    updateSelection,
    broadcastDoc,
  } = useDocumentCollaboration({
    documentId,
    onRemoteDoc: handleRemoteDoc,
  });

  const persistRef = useRef<() => Promise<void>>(async () => undefined);
  const broadcastRef = useRef<() => void>(() => undefined);
  const updateSelectionRef = useRef(updateSelection);
  updateSelectionRef.current = updateSelection;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Underline, RemoteCursors],
    content:
      Object.keys(initialContent).length > 0 ? initialContent : emptyDoc,
    editorProps: {
      attributes: {
        class:
          "prose-invert min-h-[min(70vh,640px)] px-1 py-1 text-[0.975rem] leading-relaxed tracking-[-0.01em] text-white/85 focus:outline-none [&_h1]:mb-3 [&_h1]:font-[family-name:var(--font-landing-display)] [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-[-0.03em] [&_h1]:text-foreground [&_h2]:mb-2.5 [&_h2]:font-[family-name:var(--font-landing-display)] [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-[-0.02em] [&_h2]:text-foreground [&_p]:mb-3 [&_strong]:font-semibold [&_strong]:text-foreground [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6",
      },
    },
    onUpdate: () => {
      if (applyingRemoteRef.current) return;
      lastLocalEditAtRef.current = Date.now();
      setSaveStatus("idle");
      broadcastRef.current();
      void persistRef.current();
    },
    onSelectionUpdate: ({ editor: current }) => {
      const { from, to } = current.state.selection;
      updateSelectionRef.current(from, to);
    },
  });

  editorRef.current = editor;

  persistRef.current = async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      const current = editorRef.current;
      if (!current) return;

      setSaveStatus("saving");
      const result = await updateDocument({
        id: documentId,
        title: titleRef.current,
        content: current.getJSON() as Record<string, unknown>,
      });

      if ("error" in result && result.error) {
        setSaveStatus("error");
        toast.error(result.error);
        return;
      }

      setSaveStatus("saved");
    }, 1000);
  };

  broadcastRef.current = () => {
    if (broadcastTimerRef.current) clearTimeout(broadcastTimerRef.current);

    broadcastTimerRef.current = setTimeout(() => {
      const current = editorRef.current;
      if (!current) return;
      broadcastDoc(
        titleRef.current,
        current.getJSON() as Record<string, unknown>,
      );
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (broadcastTimerRef.current) clearTimeout(broadcastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!editor) return;

    const remoteCursors = users
      .filter(
        (user) =>
          user.userId !== selfUserId &&
          user.selection &&
          typeof user.selection.from === "number",
      )
      .map((user) => ({
        userId: user.userId,
        name: user.name,
        color: user.color,
        from: user.selection!.from,
        to: user.selection!.to,
      }));

    setRemoteCursors(editor, remoteCursors);
  }, [editor, users, selfUserId]);

  function handleTitleChange(value: string) {
    setTitle(value);
    titleRef.current = value;
    lastLocalEditAtRef.current = Date.now();
    setSaveStatus("idle");
    broadcastRef.current();
    void persistRef.current();
  }

  const saveLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved"
        ? "Saved"
        : saveStatus === "error"
          ? "Save failed"
          : null;

  return (
    <LandingFontProvider>
      <LandingShell background="solid" className="overflow-x-visible">
        <AppHeader
          left="back"
          trailingRail
          right={
            isOwner ? (
              <ShareDialog
                documentId={documentId}
                documentTitle={title}
              />
            ) : null
          }
        />

        <main className="relative px-6 pt-4 pb-8">
          {/*
            Same shell geometry as AppHeader (trailingRail): padding outside,
            DOCUMENT_SHELL_MAX centered, max-w-4xl column + 3.25rem toolbar.
          */}
          <div
            className={cn(
              "mx-auto flex w-full items-start gap-3",
              DOCUMENT_SHELL_MAX,
            )}
          >
            <div className="min-w-0 w-full max-w-4xl flex-1 space-y-3">
              <div className="flex w-full min-w-0 flex-col gap-1">
                <Input
                  value={title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  className="h-11 w-full min-w-0 rounded-xl border-white/10 bg-white/[0.04] px-3.5 font-[family-name:var(--font-landing-display)] text-base font-medium tracking-[-0.02em] text-foreground placeholder:text-white/30 focus-visible:border-cyan-400/40 focus-visible:ring-cyan-400/20"
                  aria-label="Document title"
                  placeholder="Untitled document"
                />
                <p
                  className={cn(
                    "px-1 text-[0.6875rem] tracking-[-0.01em]",
                    saveStatus === "error"
                      ? "text-rose-300/90"
                      : "text-white/40",
                    !saveLabel && "hidden",
                  )}
                  aria-live="polite"
                >
                  {saveLabel}
                </p>
              </div>

              <GlassCard variant="default">
                <GlassCardContent className="px-5 py-5 sm:px-7 sm:py-6">
                  {/* Reserve prose min-height before TipTap mounts to avoid CLS. */}
                  <div className="min-h-[min(70vh,640px)]">
                    <EditorContent editor={editor} />
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>

            <EditorToolbar editor={editor} />
          </div>

          <DocumentPresenceRail users={users} />
        </main>
      </LandingShell>
    </LandingFontProvider>
  );
}
