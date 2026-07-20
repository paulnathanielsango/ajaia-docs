import { cn } from "@/lib/utils";

import { LandingBackground } from "./landing-background";

type LandingShellProps = {
  children: React.ReactNode;
  className?: string;
  /** `dim` slightly darkens the atmospheric bg; `solid` is quiet black for focus. */
  background?: "default" | "dim" | "solid";
};

export function LandingShell({
  children,
  className,
  background = "default",
}: LandingShellProps) {
  return (
    <div
      className={cn(
        "dark landing relative min-h-screen overflow-x-hidden bg-background text-foreground",
        background === "dim" && "bg-[#060912]",
        background === "solid" && "bg-[#05070d]",
        className
      )}
    >
      <LandingBackground variant={background} />
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}
