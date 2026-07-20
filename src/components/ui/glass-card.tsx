import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const glassCardVariants = cva(
  "flex flex-col overflow-hidden rounded-[1.25rem] border text-card-foreground",
  {
    variants: {
      variant: {
        default:
          "border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 ring-1 ring-white/[0.06]",
        elevated:
          "border-white/12 bg-white/[0.06] shadow-[0_24px_80px_-12px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.08]",
        subtle:
          "border-white/5 bg-white/[0.02] shadow-lg shadow-black/10 ring-1 ring-white/[0.04]",
      },
      padding: {
        none: "",
        sm: "p-5",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "none",
    },
  }
);

function GlassCard({
  className,
  variant,
  padding,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof glassCardVariants>) {
  return (
    <div
      data-slot="glass-card"
      className={cn(glassCardVariants({ variant, padding, className }))}
      {...props}
    />
  );
}

function GlassCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card-header"
      className={cn("flex flex-col gap-1.5 px-6 pt-6", className)}
      {...props}
    />
  );
}

function GlassCardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card-title"
      className={cn(
        "font-[family-name:var(--font-landing-display)] text-xl font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  );
}

function GlassCardDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card-description"
      className={cn(
        "font-[family-name:var(--font-landing-body)] text-sm leading-relaxed text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

function GlassCardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card-content"
      className={cn("px-6 pb-6", className)}
      {...props}
    />
  );
}

function GlassCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="glass-card-footer"
      className={cn(
        "flex items-center border-t border-white/8 px-6 py-4",
        className
      )}
      {...props}
    />
  );
}

export {
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardFooter,
  GlassCardHeader,
  GlassCardTitle,
  glassCardVariants,
};
