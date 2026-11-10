import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

type ContainerElement = "div" | "section" | "main" | "header" | "footer";

type ContainerProps = ComponentPropsWithoutRef<"div"> & {
  as?: ContainerElement;
  /** `content` (padrão) para o layout; `prose` para texto longo. */
  width?: "content" | "prose";
};

const widthClasses = {
  content: "max-w-content",
  prose: "max-w-prose",
} as const;

/** Centraliza o conteúdo com largura máxima e margem lateral responsiva. */
export function Container({
  as: Component = "div",
  width = "content",
  className,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full px-4 sm:px-6",
        widthClasses[width],
        className,
      )}
      {...props}
    />
  );
}
