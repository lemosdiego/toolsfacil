import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

type HeadingLevel = 1 | 2 | 3;
type HeadingSize = "xl" | "lg" | "md";

type HeadingProps = ComponentPropsWithoutRef<"h1"> & {
  /** Nível semântico (h1 a h3). Use um único h1 por página. */
  level: HeadingLevel;
  /** Tamanho visual, independente da tag. Padrão: segue o nível. */
  size?: HeadingSize;
};

const defaultSize: Record<HeadingLevel, HeadingSize> = {
  1: "xl",
  2: "lg",
  3: "md",
};

const sizeClasses: Record<HeadingSize, string> = {
  xl: "text-3xl leading-tight sm:text-4xl",
  lg: "text-2xl leading-snug",
  md: "text-lg leading-snug",
};

export function Heading({ level, size, className, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;

  return (
    <Tag
      className={cn(
        "font-semibold tracking-tight text-balance text-foreground",
        sizeClasses[size ?? defaultSize[level]],
        className,
      )}
      {...props}
    />
  );
}
