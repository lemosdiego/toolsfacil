/**
 * Classes compartilhadas por Button e IconButton.
 * Arquivo comum (sem "use client"), para servir aos Server Components.
 */
export const buttonVariants = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  secondary:
    "border border-line-strong bg-surface text-foreground hover:bg-surface-muted",
  ghost: "bg-transparent text-foreground hover:bg-surface-muted",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;

export const buttonBase =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-control font-medium transition-colors select-none disabled:pointer-events-none disabled:opacity-60";
