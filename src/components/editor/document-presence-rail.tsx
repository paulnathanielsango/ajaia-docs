"use client";

import type { DocumentPresenceUser } from "@/hooks/use-document-collaboration";
import { cn } from "@/lib/utils";

type DocumentPresenceRailProps = {
  users: DocumentPresenceUser[];
  className?: string;
};

function userInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function DocumentPresenceRail({
  users,
  className,
}: DocumentPresenceRailProps) {
  if (users.length === 0) return null;

  // Out of flow (no column shift) but sticky like EditorToolbar:
  // stretch with <main>, then stick the avatars at top-6 while scrolling.
  return (
    <aside
      className={cn(
        "pointer-events-none absolute inset-y-8 right-6 z-20 hidden w-10 sm:block",
        className,
      )}
      aria-label="People currently in this document"
    >
      <ul className="pointer-events-auto sticky top-6 flex flex-col items-center gap-2.5">
        {users.map((user) => (
          <li key={user.userId} className="group relative">
            <button
              type="button"
              className={cn(
                "flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 shadow-lg shadow-black/30 ring-1 ring-white/10 outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-cyan-400/60",
                !user.avatarUrl && "text-white",
              )}
              style={{
                borderColor: user.color,
                backgroundColor: user.avatarUrl ? undefined : user.color,
              }}
              aria-label={user.name}
            >
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote OAuth avatars; domains vary
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="size-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="font-[family-name:var(--font-landing-display)] text-sm font-semibold text-[#0a0e1a]">
                  {userInitial(user.name)}
                </span>
              )}
            </button>
            <span
              role="tooltip"
              className="pointer-events-none absolute top-1/2 right-full z-10 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#0a0e1a]/95 px-2.5 py-1.5 text-xs font-medium tracking-[-0.01em] text-white/90 opacity-0 shadow-xl backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
            >
              {user.name}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
