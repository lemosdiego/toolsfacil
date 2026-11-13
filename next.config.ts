import type { NextConfig } from "next";

import { getSecurityHeaders } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // CSP e cabeçalhos de segurança em todas as respostas (ver security-headers.ts).
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: getSecurityHeaders({
          isDevelopment: process.env.NODE_ENV === "development",
        }),
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
