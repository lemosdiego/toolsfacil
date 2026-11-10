import { cn } from "@/lib/cn";

type ProgressBarProps = {
  /** Progresso de 0 a 100. Valores fora do intervalo são ajustados. */
  value: number;
  /** Nome acessível (ex.: "Progresso da conversão"). */
  label: string;
  /** Mostra o rótulo e a porcentagem acima da barra. */
  showValue?: boolean;
  className?: string;
};

export function ProgressBar({
  value,
  label,
  showValue = false,
  className,
}: ProgressBarProps) {
  const percent = Math.round(
    Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0)),
  );

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {showValue && (
        <div className="flex justify-between text-sm" aria-hidden="true">
          <span className="text-muted">{label}</span>
          <span className="font-medium tabular-nums">{percent}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
