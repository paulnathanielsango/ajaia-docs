"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import { presenceColor } from "@/lib/presence-color";
import { displayNameFromUser } from "@/lib/user-display";

export type DocumentPresenceUser = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  color: string;
  selection: { from: number; to: number } | null;
};

type PresenceMeta = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  color: string;
  onlineAt: string;
};

type DocSyncPayload = {
  clientId: string;
  title: string;
  content: Record<string, unknown>;
};

type CursorSyncPayload = {
  userId: string;
  from: number;
  to: number;
};

type SelectionRange = { from: number; to: number };

function avatarFromUser(user: { user_metadata?: Record<string, unknown> }) {
  const meta = user.user_metadata ?? {};
  const avatarUrl = meta.avatar_url;
  const picture = meta.picture;

  if (typeof avatarUrl === "string" && avatarUrl) return avatarUrl;
  if (typeof picture === "string" && picture) return picture;
  return null;
}

function usersFromPresenceState(
  state: Record<string, PresenceMeta[]>,
  selections: Map<string, SelectionRange>,
): DocumentPresenceUser[] {
  const byId = new Map<string, DocumentPresenceUser>();

  for (const metas of Object.values(state)) {
    for (const meta of metas) {
      if (!meta.userId || byId.has(meta.userId)) continue;
      byId.set(meta.userId, {
        userId: meta.userId,
        name: meta.name || "Anonymous",
        avatarUrl: meta.avatarUrl ?? null,
        color: meta.color || presenceColor(meta.userId),
        selection: selections.get(meta.userId) ?? null,
      });
    }
  }

  // Drop caret state for users who left the channel.
  for (const userId of selections.keys()) {
    if (!byId.has(userId)) selections.delete(userId);
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

type UseDocumentCollaborationOptions = {
  documentId: string;
  onRemoteDoc?: (payload: {
    title: string;
    content: Record<string, unknown>;
  }) => void;
};

export function useDocumentCollaboration({
  documentId,
  onRemoteDoc,
}: UseDocumentCollaborationOptions) {
  const [users, setUsers] = useState<DocumentPresenceUser[]>([]);
  const [selfUserId, setSelfUserId] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const clientIdRef = useRef(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `client-${Math.random().toString(36).slice(2)}`,
  );
  const identityRef = useRef<{
    userId: string;
    name: string;
    avatarUrl: string | null;
    color: string;
  } | null>(null);
  const selectionRef = useRef<SelectionRange | null>(null);
  const remoteSelectionsRef = useRef(new Map<string, SelectionRange>());
  const selectionThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const onRemoteDocRef = useRef(onRemoteDoc);
  onRemoteDocRef.current = onRemoteDoc;

  const trackPresence = useCallback(async () => {
    const channel = channelRef.current;
    const identity = identityRef.current;
    if (!channel || !identity) return;

    await channel.track({
      userId: identity.userId,
      name: identity.name,
      avatarUrl: identity.avatarUrl,
      color: identity.color,
      onlineAt: new Date().toISOString(),
    } satisfies PresenceMeta);
  }, []);

  const broadcastCursor = useCallback(() => {
    const channel = channelRef.current;
    const identity = identityRef.current;
    const selection = selectionRef.current;
    if (!channel || !identity || !selection) return;

    void channel.send({
      type: "broadcast",
      event: "cursor_sync",
      payload: {
        userId: identity.userId,
        from: selection.from,
        to: selection.to,
      } satisfies CursorSyncPayload,
    });
  }, []);

  const updateSelection = useCallback(
    (from: number, to: number) => {
      selectionRef.current = { from, to };
      if (selectionThrottleRef.current) return;
      selectionThrottleRef.current = setTimeout(() => {
        selectionThrottleRef.current = null;
        broadcastCursor();
      }, 50);
    },
    [broadcastCursor],
  );

  const broadcastDoc = useCallback(
    (title: string, content: Record<string, unknown>) => {
      const channel = channelRef.current;
      if (!channel) return;

      void channel.send({
        type: "broadcast",
        event: "doc_sync",
        payload: {
          clientId: clientIdRef.current,
          title,
          content,
        } satisfies DocSyncPayload,
      });
    },
    [],
  );

  useEffect(() => {
    const supabase = createClient();
    let channel: RealtimeChannel | null = null;
    let cancelled = false;

    async function join() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) return;

      const identity = {
        userId: user.id,
        name: displayNameFromUser(user),
        avatarUrl: avatarFromUser(user),
        color: presenceColor(user.id),
      };
      identityRef.current = identity;
      setSelfUserId(user.id);

      channel = supabase.channel(`document:${documentId}`, {
        config: {
          presence: {
            key: user.id,
          },
          broadcast: {
            self: false,
          },
        },
      });
      channelRef.current = channel;

      channel.on("presence", { event: "sync" }, () => {
        if (!channel) return;
        const state = channel.presenceState<PresenceMeta>();
        setUsers(
          usersFromPresenceState(state, remoteSelectionsRef.current),
        );
      });

      // When someone else joins, re-share our caret so they see it without a move.
      channel.on("presence", { event: "join" }, ({ key }) => {
        if (key === identityRef.current?.userId) return;
        broadcastCursor();
      });

      channel.on("broadcast", { event: "cursor_sync" }, ({ payload }) => {
        const data = payload as CursorSyncPayload;
        if (
          !data ||
          typeof data.userId !== "string" ||
          typeof data.from !== "number" ||
          typeof data.to !== "number"
        ) {
          return;
        }
        if (data.userId === identityRef.current?.userId) return;

        const next = { from: data.from, to: data.to };
        remoteSelectionsRef.current.set(data.userId, next);
        setUsers((prev) =>
          prev.map((entry) =>
            entry.userId === data.userId
              ? { ...entry, selection: next }
              : entry,
          ),
        );
      });

      channel.on("broadcast", { event: "doc_sync" }, ({ payload }) => {
        const data = payload as DocSyncPayload;
        if (!data || data.clientId === clientIdRef.current) return;
        if (!data.content || typeof data.content !== "object") return;
        onRemoteDocRef.current?.({
          title: typeof data.title === "string" ? data.title : "Untitled",
          content: data.content,
        });
      });

      channel.subscribe(async (status) => {
        if (status !== "SUBSCRIBED" || !channel || cancelled) return;
        await trackPresence();
        // Share current caret once so peers see us without waiting for a move.
        broadcastCursor();
      });
    }

    void join();

    return () => {
      cancelled = true;
      channelRef.current = null;
      remoteSelectionsRef.current.clear();
      if (selectionThrottleRef.current) {
        clearTimeout(selectionThrottleRef.current);
      }
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [documentId, trackPresence, broadcastCursor]);

  return {
    users,
    selfUserId,
    updateSelection,
    broadcastDoc,
  };
}

/** @deprecated Use useDocumentCollaboration — kept as a thin alias for the avatar rail. */
export function useDocumentPresence(documentId: string) {
  const { users } = useDocumentCollaboration({ documentId });
  return users;
}
