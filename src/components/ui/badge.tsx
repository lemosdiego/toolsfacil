import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

type BadgeVariant = "neutral" | "info" | "success" | "danger";

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "border-line bg-surface-muted text-foreground",
  info: "border-transparent bg-info-soft text-info",
  success: "border-transparent bg-success-soft text-success",
  danger: "border-transparent bg-danger-soft text-danger",
};

type BadgeProps = ComponentPropsWithoutRef<"span"> & {
  variant?: BadgeVariant;
};

/** Etiqueta curta e não interativa (ex.: "Novo", "WebP", "-62%"). */
export function Badge({
  variant = "neutral",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
