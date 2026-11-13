import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FaqList } from "./faq-list";

describe("FaqList", () => {
  it("mostra cada pergunta em um details, com a resposta no HTML", () => {
    const { container } = render(
      <FaqList
        items={[
          { question: "É grátis?", answer: "Sim." },
          { question: "Precisa de conta?", answer: "Não." },
        ]}
      />,
    );

    expect(container.querySelectorAll("details")).toHaveLength(2);
    expect(screen.getByText("É grátis?").tagName).toBe("SUMMARY");
    expect(screen.getByText("Não.")).toBeInTheDocument();
  });
});
