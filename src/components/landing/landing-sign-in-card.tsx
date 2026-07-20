import Link from "next/link";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { buttonVariants } from "@/components/ui/button";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
} from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type LandingSignInCardProps = {
  className?: string;
};

export function LandingSignInCard({ className }: LandingSignInCardProps) {
  return (
    <GlassCard
      variant="elevated"
      className={cn("w-full max-w-[26rem]", className)}
    >
      <GlassCardHeader className="gap-2 px-8 pt-8 text-center">
        <GlassCardTitle className="text-[1.375rem] font-semibold tracking-[-0.03em]">
          Welcome back
        </GlassCardTitle>
        <GlassCardDescription className="text-[0.9375rem] leading-relaxed tracking-[-0.01em] text-white/50">
          Sign in to access your documents
        </GlassCardDescription>
      </GlassCardHeader>
      <GlassCardContent className="space-y-5 px-8 pb-8 pt-6">
        <GoogleSignInButton className="h-12 text-[0.9375rem] font-medium tracking-[-0.01em]" />
        <div className="flex items-center gap-3">
          <Separator className="flex-1 bg-white/8" />
          <span className="font-[family-name:var(--font-landing-display)] text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-white/35">
            or
          </span>
          <Separator className="flex-1 bg-white/8" />
        </div>
        <Link
          href="/login"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-12 w-full rounded-xl bg-white text-[0.9375rem] font-semibold tracking-[-0.01em] text-[#0a0e1a] hover:bg-white/90"
          )}
        >
          Sign in with email
        </Link>
        <p className="pt-1 text-center text-[0.8125rem] leading-relaxed tracking-[-0.01em] text-white/35">
          Demo accounts available on the email sign-in page.
        </p>
      </GlassCardContent>
    </GlassCard>
  );
}
