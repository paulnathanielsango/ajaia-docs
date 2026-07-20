import { cn } from "@/lib/utils";

import { LandingBadge } from "./landing-badge";
import { LandingFeatureList } from "./landing-feature-list";

type LandingHeroProps = {
  badge: string;
  title: React.ReactNode;
  description: string;
  features: string[];
  className?: string;
};

export function LandingHero({
  badge,
  title,
  description,
  features,
  className,
}: LandingHeroProps) {
  return (
    <section
      className={cn(
        "flex max-w-xl flex-col items-center gap-8 text-center lg:items-start lg:text-left",
        className
      )}
    >
      <LandingBadge>{badge}</LandingBadge>

      <div className="space-y-6">
        <h1
          className={cn(
            "font-[family-name:var(--font-landing-display)] text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.04em] text-foreground sm:text-5xl lg:text-[3.5rem]"
          )}
        >
          {title}
        </h1>
        <p className="max-w-md text-[1.0625rem] font-normal leading-[1.7] tracking-[-0.01em] text-white/55 sm:text-lg sm:leading-[1.7] lg:max-w-lg">
          {description}
        </p>
      </div>

      <LandingFeatureList features={features} className="w-full max-w-md" />
    </section>
  );
}
