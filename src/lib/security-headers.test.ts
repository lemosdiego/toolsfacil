import { describe, expect, it } from "vitest";

import {
  buildContentSecurityPolicy,
  getSecurityHeaders,
} from "./security-headers";

function directives(policy: string) {
  return Object.fromEntries(
    policy.split("; ").map((directive) => {
      const [name, ...sources] = directive.split(" ");
      return [name, sources];
    }),
  );
}

function headerNames(isDevelopment: boolean) {
  return getSecurityHeaders({ isDevelopment }).map((header) => header.key);
}

describe("buildContentSecurityPolicy em produção", () => {
  const policy = directives(
    buildContentSecurityPolicy({ isDevelopment: false }),
  );

  it("só aceita recursos do próprio site por padrão", () => {
    expect(policy["default-src"]).toEqual(["'self'"]);
    expect(policy["object-src"]).toEqual(["'none'"]);
    expect(policy["frame-ancestors"]).toEqual(["'none'"]);
    expect(policy["base-uri"]).toEqual(["'self'"]);
    expect(policy["form-action"]).toEqual(["'self'"]);
  });

  it("libera blob: e data: para as prévias e o Web Worker", () => {
    expect(policy["img-src"]).toEqual(["'self'", "blob:", "data:"]);
    expect(policy["worker-src"]).toEqual(["'self'", "blob:"]);
  });

  it("não envia dados para outros domínios", () => {
    expect(policy["connect-src"]).toEqual(["'self'", "blob:"]);
  });

  it("não libera eval nem WebSocket", () => {
    expect(policy["script-src"]).toEqual(["'self'", "'unsafe-inline'"]);
    expect(policy["connect-src"]).not.toContain("ws:");
  });

  it("promove requisições para https", () => {
    expect(policy).toHaveProperty("upgrade-insecure-requests");
  });
});

describe("buildContentSecurityPolicy em dev", () => {
  const policy = directives(
    buildContentSecurityPolicy({ isDevelopment: true }),
  );

  it("libera o eval do React e o WebSocket do recarregamento", () => {
    expect(policy["script-src"]).toContain("'unsafe-eval'");
    expect(policy["connect-src"]).toContain("ws:");
  });

  it("não promove requisições de localhost para https", () => {
    expect(policy).not.toHaveProperty("upgrade-insecure-requests");
  });
});

describe("getSecurityHeaders", () => {
  it("envia CSP e os cabeçalhos de proteção nos dois ambientes", () => {
    for (const isDevelopment of [true, false]) {
      expect(headerNames(isDevelopment)).toEqual(
        expect.arrayContaining([
          "Content-Security-Policy",
          "X-Content-Type-Options",
          "Referrer-Policy",
          "Permissions-Policy",
          "Cross-Origin-Opener-Policy",
          "X-Frame-Options",
        ]),
      );
    }
  });

  it("envia HSTS só em produção", () => {
    expect(headerNames(false)).toContain("Strict-Transport-Security");
    expect(headerNames(true)).not.toContain("Strict-Transport-Security");
  });
});
