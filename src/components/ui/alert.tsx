import { CircleAlert, CircleCheck, Info, type LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/cn";

type AlertVariant = "info" | "success" | "error";

const variantConfig: Record<
  AlertVariant,
  { classes: string; icon: LucideIcon; role: "alert" | "status" }
> = {
  info: { classes: "bg-info-soft text-info", icon: Info, role: "status" },
  success: {
    classes: "bg-success-soft text-success",
    icon: CircleCheck,
    role: "status",
  },
  // Erro interrompe o leitor de tela; os demais são anunciados com calma.
  error: {
    classes: "bg-danger-soft text-danger",
    icon: CircleAlert,
    role: "alert",
  },
};

type AlertProps = Omit<ComponentPropsWithoutRef<"div">, "title" | "role"> & {
  variant?: AlertVariant;
  title?: ReactNode;
};

/**
 * Mensagem de estado. Para erros, diga o que aconteceu e o que fazer
 * (ex.: "Arquivo muito grande. Escolha uma imagem de até 20 MB.").
 */
export function Alert({
  variant = "info",
  title,
  className,
  children,
  ...props
}: AlertProps) {
  const { classes, icon: Icon, role } = variantConfig[variant];

  return (
    <div
      role={role}
      className={cn(
        "flex gap-3 rounded-control p-4 text-sm",
        classes,
        className,
      )}
      {...props}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-foreground">{children}</div>}
      </div>
    </div>
  );
}
