"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import {
  LandingHero,
  LandingShell,
  LandingSignInCard,
} from "@/components/landing";

type LandingPageProps = {
  authError?: string;
};

const features = [
  "Rich-text editing with headings and lists",
  "Import .txt and .md files into documents",
  "Share documents with teammates instantly",
];

export function LandingPage({ authError }: LandingPageProps) {
  useEffect(() => {
    if (authError) {
      toast.error("Sign-in failed. Please try again.");
    }
  }, [authError]);

  return (
    <LandingShell>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-14 px-6 py-16 lg:flex-row lg:items-center lg:gap-24 lg:py-20">
        <LandingHero
          badge="Document workspace"
          title={
            <>
              Write, share, and organize with{" "}
              <span className="bg-gradient-to-r from-cyan-200 via-violet-200 to-cyan-100 bg-clip-text text-transparent">
                AJAIA
              </span>
            </>
          }
          description="A lightweight docs app for creating rich documents, importing text files, and sharing access with your team."
          features={features}
        />

        <LandingSignInCard />
      </div>
    </LandingShell>
  );
}
