import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { signOut } from "@/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Content column + gap + formatting rail — keep in sync with document editor. */
export const DOCUMENT_SHELL_MAX =
  "max-w-[calc(56rem+0.75rem+3.25rem)]";

type AppHeaderProps = {
  className?: string;
  /** Optional right-side action (e.g. Share). Defaults to Sign out. */
  right?: ReactNode;
  /** Content column width when not using the document trailing rail. */
  maxWidthClassName?: string;
  /**
   * Reserve a right rail matching the editor toolbar column so `right`
   * (Share) aligns with the toolbar’s right edge.
   */
  trailingRail?: boolean;
} & (
  | { left: "back"; backHref?: string }
  | { left?: "user"; userName: string }
);

function userInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "U";
}

export function AppHeader(props: AppHeaderProps) {
  const {
    className,
    right,
    maxWidthClassName = "max-w-5xl",
    trailingRail = false,
  } = props;
  const showBack = props.left === "back";

  const backLink = showBack ? (
    <Link
      href={props.backHref ?? "/documents"}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "h-9 gap-2 rounded-xl border-white/12 bg-white/[0.04] px-3 text-[0.8125rem] font-medium tracking-[-0.01em] text-white/70 hover:bg-white/[0.08] hover:text-foreground",
      )}
    >
      <ArrowLeftIcon className="size-4 shrink-0" />
      <span className="hidden sm:inline">Back to documents</span>
      <span className="sm:hidden">Back</span>
    </Link>
  ) : (
    <div className="flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pr-3 pl-1">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-500/20 font-[family-name:var(--font-landing-display)] text-[0.6875rem] font-semibold text-violet-200">
        {userInitial(props.userName)}
      </span>
      <span className="max-w-[10rem] truncate text-[0.8125rem] tracking-[-0.01em] text-white/55 sm:max-w-[16rem]">
        {props.userName}
      </span>
    </div>
  );

  const brand = (
    <Link
      href="/documents"
      className="justify-self-center text-center transition-opacity hover:opacity-90"
    >
      <p className="font-[family-name:var(--font-landing-display)] text-sm font-semibold tracking-[-0.02em]">
        <span className="bg-gradient-to-r from-cyan-200 via-violet-200 to-cyan-100 bg-clip-text text-transparent">
          AJAIA
        </span>
      </p>
      <p className="text-[0.75rem] tracking-[-0.01em] text-white/45">
        Document workspace
      </p>
    </Link>
  );

  const defaultRight = (
    <form action={signOut}>
      <Button
        type="submit"
        variant="outline"
        className="h-9 rounded-xl border-white/12 bg-white/[0.04] px-3.5 text-[0.8125rem] font-medium tracking-[-0.01em] text-white/80 hover:bg-white/[0.08] hover:text-foreground"
      >
        Sign out
      </Button>
    </form>
  );

  const rightSlot = right !== undefined ? right : defaultRight;

  return (
    <header
      className={cn(
        "z-20 border-b border-white/8 bg-[#070b14]/70 backdrop-blur-xl",
        className,
      )}
    >
      {/*
        Padding lives outside DOCUMENT_SHELL_MAX so the shell’s left edge
        matches the document title/editor column in DocumentEditor.
      */}
      <div className="px-6 py-3.5">
        {trailingRail ? (
          <div
            className={cn(
              "mx-auto flex w-full items-center gap-3",
              DOCUMENT_SHELL_MAX,
            )}
          >
            <div className="grid min-w-0 w-full max-w-4xl flex-1 grid-cols-[1fr_auto_1fr] items-center gap-4">
              <div className="justify-self-start">{backLink}</div>
              {brand}
              <div aria-hidden="true" />
            </div>
            <div className="relative hidden h-9 w-[3.25rem] shrink-0 sm:block">
              <div className="absolute top-1/2 right-0 -translate-y-1/2">
                {rightSlot}
              </div>
            </div>
            <div className="shrink-0 sm:hidden">{rightSlot}</div>
          </div>
        ) : (
          <div
            className={cn(
              "mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4",
              maxWidthClassName,
            )}
          >
            <div className="justify-self-start">{backLink}</div>
            {brand}
            <div className="flex min-w-0 items-center justify-end justify-self-end">
              {rightSlot}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
