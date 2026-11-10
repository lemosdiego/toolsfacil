import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/cn";

import { buttonBase, buttonVariants } from "./button-styles";

type IconButtonProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "aria-label" | "children"
> & {
  /** Obrigatório: o botão não tem texto visível. */
  "aria-label": string;
  /** O ícone (decorativo; recebe aria-hidden automaticamente no lucide). */
  children: ReactNode;
  variant?: "secondary" | "ghost";
};

/** Botão só com ícone, com 44px de área de toque. */
export function IconButton({
  variant = "ghost",
  type = "button",
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        buttonBase,
        buttonVariants[variant],
        "size-11 [&_svg]:size-5",
        className,
      )}
      {...props}
    />
  );
}
