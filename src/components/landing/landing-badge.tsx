import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type LandingBadgeProps = {
  children: React.ReactNode;
  className?: string;
};

export function LandingBadge({ children, className }: LandingBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-auto rounded-full border-white/10 bg-white/[0.06] px-3.5 py-1.5 font-[family-name:var(--font-landing-display)] text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-white/70 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </Badge>
  );
}
