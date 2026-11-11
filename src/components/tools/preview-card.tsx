import { Download } from "lucide-react";

import { buttonBase, buttonVariants } from "@/components/ui/button-styles";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import { formatFileSize, formatSizeChange } from "@/lib/image/format-file-size";

type PreviewCardProps = {
  /** Imagem a mostrar (em geral uma URL `blob:` local). Sem ela, estado vazio. */
  image?: { src: string; alt: string };
  /** Download do resultado. Sem ele, o ícone fica desativado. */
  download?: {
    href: string;
    fileName: string;
    /** Nome acessível do ícone (ex.: "Baixar imagem em WebP"). */
    label: string;
  };
  /** Tamanhos em bytes, antes e depois do processamento. */
  sizes?: { before: number; after: number };
  className?: string;
};

const downloadPosition = "absolute top-3 right-3 shadow-card";

/**
 * Card da prévia, à direita da ferramenta no desktop: imagem sobre o xadrez
 * de transparência, ícone de download no canto e tamanho antes e depois.
 * Sem "use client": serve tanto às páginas quanto às ilhas das ferramentas.
 */
export function PreviewCard({
  image,
  download,
  sizes,
  className,
}: PreviewCardProps) {
  return (
    <figure
      className={cn(
        "flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card",
        className,
      )}
    >
      <div className="relative grid aspect-[4/3] max-h-[28rem] w-full place-items-center bg-checkerboard">
        {image ? (
          // URL blob: local: o next/image não otimiza nem precisa otimizar.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.src}
            alt={image.alt}
            className="size-full object-contain p-4"
          />
        ) : (
          <p className="rounded-control bg-surface px-3 py-1.5 text-sm text-muted">
            A prévia aparece aqui
          </p>
        )}

        {download ? (
          <a
            href={download.href}
            download={download.fileName}
            aria-label={download.label}
            className={cn(
              buttonBase,
              buttonVariants.secondary,
              "size-11 [&_svg]:size-5",
              downloadPosition,
            )}
          >
            <Download aria-hidden="true" />
          </a>
        ) : (
          <IconButton
            aria-label="Baixar imagem"
            variant="secondary"
            disabled
            className={downloadPosition}
          >
            <Download />
          </IconButton>
        )}
      </div>

      {sizes && (
        <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 text-sm">
          <span className="tabular-nums">
            <span className="text-muted">{formatFileSize(sizes.before)}</span>
            <span aria-hidden="true"> → </span>
            <span className="sr-only"> para </span>
            <span className="font-medium">{formatFileSize(sizes.after)}</span>
          </span>
          <Badge
            variant={sizes.after < sizes.before ? "success" : "neutral"}
            className="tabular-nums"
          >
            {formatSizeChange(sizes.before, sizes.after)}
          </Badge>
        </figcaption>
      )}
    </figure>
  );
}
