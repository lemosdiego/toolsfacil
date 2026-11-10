import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/cn";

import {
  buttonBase,
  buttonVariants,
  type ButtonVariant,
} from "./button-styles";

type ButtonSize = "md" | "lg";

const sizeClasses: Record<ButtonSize, string> = {
  // min-h-11 = 44px, o alvo de toque mínimo.
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-6 text-base",
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

type NativeButtonProps = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof CommonProps> & {
    href?: undefined;
    /** Desabilita o botão e mostra um indicador de carregamento. */
    loading?: boolean;
  };

type LinkButtonProps = CommonProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof CommonProps> & {
    loading?: never;
  };

export type ButtonProps = NativeButtonProps | LinkButtonProps;

/** Botão com variantes. Com `href`, vira um link com o mesmo visual. */
export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { variant = "primary", size = "md", className, ...linkProps } = props;

    return (
      <Link
        className={cn(
          buttonBase,
          buttonVariants[variant],
          sizeClasses[size],
          className,
        )}
        {...linkProps}
      />
    );
  }

  const {
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    type = "button",
    className,
    children,
    ...buttonProps
  } = props;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        buttonBase,
        buttonVariants[variant],
        sizeClasses[size],
        className,
      )}
      {...buttonProps}
    >
      {loading && (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
