/*
 * Cabeçalhos de segurança do site, aplicados pelo next.config.ts.
 *
 * CSP sem nonce: com nonce, toda página teria de ser renderizada no servidor
 * a cada visita (sem página estática nem cache). O 'unsafe-inline' em
 * script-src cobre os scripts que o próprio Next coloca na página.
 *
 * Um serviço externo novo precisa entrar aqui. Os domínios do AdSense
 * entram na fase do AdSense, junto com o script real.
 */

type Environment = {
  /** `next dev`: libera o eval do React e o WebSocket do recarregamento. */
  isDevelopment: boolean;
};

export type SecurityHeader = { key: string; value: string };

export function buildContentSecurityPolicy({
  isDevelopment,
}: Environment): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      ...(isDevelopment ? ["'unsafe-eval'"] : []),
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    // blob: e data: para as prévias locais das imagens.
    "img-src": ["'self'", "blob:", "data:"],
    "font-src": ["'self'"],
    "connect-src": ["'self'", "blob:", ...(isDevelopment ? ["ws:"] : [])],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };

  const policy = Object.entries(directives).map(
    ([name, sources]) => `${name} ${sources.join(" ")}`,
  );

  // Em dev o site roda em http://localhost: não há o que promover a https.
  if (!isDevelopment) policy.push("upgrade-insecure-requests");

  return policy.join("; ");
}

export function getSecurityHeaders({
  isDevelopment,
}: Environment): SecurityHeader[] {
  const headers: SecurityHeader[] = [
    {
      key: "Content-Security-Policy",
      value: buildContentSecurityPolicy({ isDevelopment }),
    },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // A câmera do celular continua no seletor de arquivo do sistema.
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=()",
    },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "X-Frame-Options", value: "DENY" },
  ];

  // HSTS só em produção (sem preload: difícil de desfazer).
  if (!isDevelopment) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains",
    });
  }

  return headers;
}
