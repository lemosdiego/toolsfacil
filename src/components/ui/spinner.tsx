import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/cn";

import { VisuallyHidden } from "./visually-hidden";

type SpinnerProps = {
  /**
   * Texto anunciado ao leitor de tela (ex.: "Convertendo imagem").
   * Sem ele, o spinner é só decorativo: use quando há texto visível ao lado.
   */
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "size-4",
  md: "size-6",
  lg: "size-10",
} as const;

export function Spinner({ label, size = "md", className }: SpinnerProps) {
  const icon = (
    <LoaderCircle
      className={cn("animate-spin text-primary", sizeClasses[size], className)}
      aria-hidden="true"
    />
  );

  if (!label) return icon;

  return (
    <span role="status" className="inline-flex">
      {icon}
      <VisuallyHidden>{label}</VisuallyHidden>
    </span>
  );
}
