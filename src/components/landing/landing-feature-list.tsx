import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type LandingFeatureListProps = {
  features: string[];
  className?: string;
};

export function LandingFeatureList({
  features,
  className,
}: LandingFeatureListProps) {
  return (
    <ul className={cn("space-y-4", className)}>
      {features.map((feature) => (
        <li key={feature} className="flex items-center gap-3.5 text-left">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 ring-1 ring-cyan-300/25">
            <Check className="size-3 text-cyan-300" strokeWidth={2.5} />
          </span>
          <span className="text-[0.9375rem] font-medium leading-none tracking-[-0.01em] text-white/70">
            {feature}
          </span>
        </li>
      ))}
    </ul>
  );
}
