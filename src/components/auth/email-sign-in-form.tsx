"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardFooter,
  GlassCardHeader,
  GlassCardTitle,
} from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const fieldLabelClass =
  "text-[0.8125rem] font-medium tracking-[-0.01em] text-white/60";

const fieldInputClass =
  "h-12 rounded-xl border-white/12 bg-white/[0.05] px-3.5 text-[0.9375rem] tracking-[-0.01em] text-foreground placeholder:text-white/30 focus-visible:border-violet-400/40 focus-visible:ring-violet-400/20";

type EmailSignInFormProps = {
  className?: string;
};

export function EmailSignInForm({ className }: EmailSignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const supabase = createClient();

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (isSignUp) {
      toast.success("Account created. You can sign in now.");
      setIsSignUp(false);
      setLoading(false);
      return;
    }

    toast.success("Signed in successfully.");
    router.push("/documents");
    router.refresh();
  }

  return (
    <GlassCard
      variant="elevated"
      className={cn("w-full max-w-[26rem]", className)}
    >
      <GlassCardHeader className="gap-2 px-8 pt-8 text-center">
        <GlassCardTitle className="text-[1.375rem] font-semibold tracking-[-0.03em]">
          {isSignUp ? "Create an account" : "Email sign in"}
        </GlassCardTitle>
        <GlassCardDescription className="text-[0.9375rem] leading-relaxed tracking-[-0.01em] text-white/50">
          {isSignUp
            ? "Register with email and password"
            : "Use your email and password to continue"}
        </GlassCardDescription>
      </GlassCardHeader>

      <GlassCardContent className="space-y-5 px-8 pb-2 pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className={fieldLabelClass}>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="alice@demo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className={fieldInputClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className={fieldLabelClass}>
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              placeholder="password123"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className={fieldInputClass}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-xl bg-white text-[0.9375rem] font-semibold tracking-[-0.01em] text-[#0a0e1a] hover:bg-white/90"
            disabled={loading}
          >
            {loading
              ? "Please wait…"
              : isSignUp
                ? "Create account"
                : "Sign in"}
          </Button>
        </form>
      </GlassCardContent>

      <GlassCardFooter className="flex flex-col gap-3 border-t-0 bg-transparent px-8 pb-8 pt-4">
        <button
          type="button"
          className="text-[0.875rem] font-medium tracking-[-0.01em] text-cyan-300/90 transition-colors hover:text-cyan-200"
          onClick={() => setIsSignUp((current) => !current)}
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "Need an account? Sign up"}
        </button>
        <Link
          href="/"
          className="text-[0.875rem] tracking-[-0.01em] text-white/45 transition-colors hover:text-white/70"
        >
          Back to landing page
        </Link>
        <p className="pt-1 text-center text-[0.8125rem] leading-relaxed tracking-[-0.01em] text-white/35">
          Demo: alice@demo.com / bob@demo.com — password123
        </p>
      </GlassCardFooter>
    </GlassCard>
  );
}
