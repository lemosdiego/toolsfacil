import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AdSlot } from "./ad-slot";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("AdSlot", () => {
  it("não renderiza nada em produção sem o ID do AdSense", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT_ID", "");

    const { container } = render(<AdSlot position="below-tool" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("mostra o contorno com Publicidade em desenvolvimento", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT_ID", "");

    render(<AdSlot position="below-tool" />);

    const slot = screen.getByRole("complementary", { name: "Publicidade" });
    expect(slot).toHaveAttribute("data-ad-position", "below-tool");
    expect(screen.getByText(/Espaço reservado/)).toHaveClass("border-dashed");
  });

  it("reserva a altura em produção quando há o ID", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_ADSENSE_CLIENT_ID", "ca-pub-0000000000000000");

    render(<AdSlot position="in-content" />);

    const slot = screen.getByRole("complementary", { name: "Publicidade" });
    expect(slot.lastElementChild).toHaveClass("min-h-[280px]");
    expect(screen.queryByText(/Espaço reservado/)).not.toBeInTheDocument();
  });

  it("a lateral fica escondida no celular e reserva 600px", () => {
    vi.stubEnv("NODE_ENV", "development");

    render(<AdSlot position="sidebar" />);

    const slot = screen.getByRole("complementary", { name: "Publicidade" });
    expect(slot).toHaveClass("hidden", "lg:flex");
    expect(slot.lastElementChild).toHaveClass("min-h-[600px]");
  });
});
