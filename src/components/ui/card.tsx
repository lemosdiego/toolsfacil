import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

type CardProps = ComponentPropsWithoutRef<"div"> & {
  as?: "div" | "article" | "section";
};

/** Superfície com borda, raio e sombra para agrupar conteúdo. */
export function Card({
  as: Component = "div",
  className,
  ...props
}: CardProps) {
  return (
    <Component
      className={cn(
        "rounded-card border border-line bg-surface p-5 shadow-card sm:p-6",
        className,
      )}
      {...props}
    />
  );
}
