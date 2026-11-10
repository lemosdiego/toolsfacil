/**
 * Com `CI` definido, o Playwright testa o build de produção (`next start`);
 * sem ele, o servidor de desenvolvimento (`next dev`). Ver playwright.config.ts.
 */
export const isProductionServer = Boolean(process.env.CI);
