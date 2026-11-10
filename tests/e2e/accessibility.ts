import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

/** Roda o axe com as regras WCAG 2.1 nível A e AA (inclui contraste). */
export async function findAccessibilityViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  return results.violations.map((violation) => ({
    id: violation.id,
    help: violation.help,
    targets: violation.nodes.map((node) => node.target.join(" ")),
  }));
}
