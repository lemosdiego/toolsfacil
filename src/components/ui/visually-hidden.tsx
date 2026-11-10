import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

/** Texto lido pelo leitor de tela, mas invisível na tela. */
export function VisuallyHidden({
  className,
  ...props
}: ComponentPropsWithoutRef<"span">) {
  return <span className={cn("sr-only", className)} {...props} />;
}
