"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  Loader2Icon,
  MailIcon,
  Share2Icon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { shareDocument } from "@/actions/documents";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ShareDialogProps = {
  documentId: string;
  documentTitle?: string;
  triggerClassName?: string;
};

export function ShareDialog({
  documentId,
  documentTitle,
  triggerClassName,
}: ShareDialogProps) {
  const emailId = useId();
  const errorId = useId();
  const hintId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const displayTitle = documentTitle?.trim() || "Untitled document";

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setEmail("");
      setError(null);
      setLoading(false);
    }
  }

  async function handleShare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await shareDocument({ documentId, email });

    if ("error" in result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    toast.success(`Shared “${displayTitle}” with ${email.trim()}.`);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-9 gap-2 rounded-xl border-white/12 bg-white/[0.04] px-3.5 text-[0.8125rem] font-medium tracking-[-0.01em] text-white/80 hover:bg-white/[0.08] hover:text-foreground",
              triggerClassName,
            )}
          >
            <Share2Icon className="size-3.5" />
            Share
          </Button>
        }
      />

      <DialogContent
        showCloseButton={false}
        className={cn(
          "gap-0 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b101c]/97 p-0 text-foreground shadow-[0_32px_100px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/[0.06] backdrop-blur-xl sm:max-w-[26rem]",
          "font-[family-name:var(--font-landing-body)]",
        )}
      >
        <div className="relative overflow-hidden px-6 pt-6 pb-5 sm:px-7 sm:pt-7 sm:pb-6">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.12),_transparent_70%)]"
            aria-hidden="true"
          />

          <DialogClose
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-3.5 right-3.5 z-10 size-8 rounded-lg text-white/40 hover:bg-white/[0.06] hover:text-white/80 sm:top-4 sm:right-4"
              />
            }
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <DialogHeader className="relative gap-5 pr-9 text-left sm:pr-10">
            <div className="space-y-1.5">
              <p className="font-[family-name:var(--font-landing-display)] text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-cyan-300/70">
                Sharing
              </p>
              <DialogTitle className="font-[family-name:var(--font-landing-display)] text-[1.375rem] leading-[1.2] font-semibold tracking-[-0.03em] text-white">
                Invite someone to edit
              </DialogTitle>
              <DialogDescription className="text-[0.875rem] leading-relaxed tracking-[-0.01em] text-white/45">
                They’ll get full edit access as soon as you send the invite.
              </DialogDescription>
            </div>

            <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-cyan-300/15 bg-cyan-400/[0.08] text-cyan-200/90"
                aria-hidden="true"
              >
                <Share2Icon className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="font-[family-name:var(--font-landing-display)] text-[0.625rem] font-medium uppercase tracking-[0.14em] text-white/35">
                  Document
                </p>
                <p className="truncate font-[family-name:var(--font-landing-display)] text-[0.875rem] leading-snug font-medium tracking-[-0.02em] text-white/90">
                  {displayTitle}
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form
          onSubmit={handleShare}
          className="space-y-5 border-t border-white/[0.06] bg-white/[0.015] px-6 pt-5 pb-6 sm:px-7 sm:pt-6 sm:pb-7"
        >
          <div className="space-y-2">
            <Label
              htmlFor={emailId}
              className="text-[0.8125rem] font-medium tracking-[-0.01em] text-white/60"
            >
              Teammate’s email
            </Label>
            <div className="relative">
              <MailIcon
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/30"
                aria-hidden="true"
              />
              <Input
                ref={inputRef}
                id={emailId}
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="alex@company.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError(null);
                }}
                required
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : hintId}
                disabled={loading}
                className={cn(
                  "h-11 rounded-xl border-white/10 bg-[#070b14]/55 pl-11 pr-3.5 text-[0.875rem] tracking-[-0.01em] text-white placeholder:text-white/25 focus-visible:border-cyan-400/45 focus-visible:ring-cyan-400/20",
                  error &&
                    "border-rose-400/45 focus-visible:border-rose-400/55 focus-visible:ring-rose-400/20",
                )}
              />
            </div>
            {error ? (
              <p
                id={errorId}
                role="alert"
                className="text-[0.75rem] leading-relaxed tracking-[-0.01em] text-rose-300/95"
              >
                {error}
              </p>
            ) : (
              <p
                id={hintId}
                className="text-[0.75rem] leading-relaxed tracking-[-0.01em] text-white/32"
              >
                Must already have an Ajaia account. They’ll find it under{" "}
                <span className="font-medium text-white/50">Shared with Me</span>
                .
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  disabled={loading}
                  className="h-10 w-full rounded-xl px-4 text-[0.8125rem] font-medium tracking-[-0.01em] text-white/50 hover:bg-white/[0.05] hover:text-white/85 sm:w-auto"
                />
              }
            >
              Cancel
            </DialogClose>
            <Button
              type="submit"
              size="lg"
              disabled={loading || email.trim().length === 0}
              className="h-10 w-full gap-2 rounded-xl bg-white px-4 text-[0.8125rem] font-semibold tracking-[-0.01em] text-[#070b14] hover:bg-white/92 sm:min-w-[8.75rem] sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2Icon className="size-3.5 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send invite"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
