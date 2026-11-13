import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site-config";

/*
 * Imagem de compartilhamento (Open Graph), gerada no build.
 * O ImageResponse não lê as variáveis do globals.css: as cores abaixo copiam
 * os tokens do tema claro (--background, --foreground, --muted e --primary).
 * Trocar junto com a identidade visual. É a única exceção à regra dos hex.
 */
const colors = {
  background: "#f8f9fb",
  foreground: "#16181d",
  muted: "#545b69",
  primary: "#1d4ed8",
};

export const alt = `${siteConfig.name}: ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 32,
        padding: 96,
        background: colors.background,
        color: colors.foreground,
        borderTop: `24px solid ${colors.primary}`,
      }}
    >
      <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -2 }}>
        {siteConfig.name}
      </div>
      <div style={{ fontSize: 48, color: colors.muted }}>
        {siteConfig.tagline}
      </div>
      <div style={{ fontSize: 32, color: colors.muted }}>
        Direto no navegador: suas imagens não saem do aparelho.
      </div>
    </div>,
    size,
  );
}
