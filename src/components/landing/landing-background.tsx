import { cn } from "@/lib/utils";

type LandingBackgroundProps = {
  /** `default` keeps atmospheric glow; `dim` is slightly darker; `solid` is quiet black for focus. */
  variant?: "default" | "dim" | "solid";
  className?: string;
};

export function LandingBackground({
  variant = "default",
  className,
}: LandingBackgroundProps) {
  if (variant === "solid") {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden bg-[#05070d]",
          className
        )}
      />
    );
  }

  const base = variant === "dim" ? "#060912" : "#070b14";
  const glowScale = variant === "dim" ? "opacity-80" : undefined;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0" style={{ backgroundColor: base }} />

      <div
        className={cn(
          "absolute -left-1/4 top-0 size-[700px] rounded-full bg-violet-600/20 blur-[120px]",
          glowScale
        )}
      />
      <div
        className={cn(
          "absolute -right-1/4 top-1/3 size-[600px] rounded-full bg-cyan-500/15 blur-[100px]",
          glowScale
        )}
      />
      <div
        className={cn(
          "absolute bottom-0 left-1/3 size-[500px] rounded-full bg-indigo-500/10 blur-[100px]",
          glowScale
        )}
      />

      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.06) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, transparent, transparent, ${base}cc)`,
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
