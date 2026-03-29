import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PriceGapBadge from "@/features/rentals/components/PriceGapBadge";

describe("PriceGapBadge", () => {
  // ── Visibility ──

  it("renders badge when cheapest data is provided", () => {
    render(
      <PriceGapBadge
        airportCode="MUC"
        cheapest={{
          rentalId: "bmw-r1300gs-muc",
          pricePerDay: 189,
          currency: "EUR",
          bikeName: "BMW R 1300 GS",
          isAlpineReady: true,
        }}
      />,
    );

    expect(screen.getByText("Best Value at MUC")).toBeInTheDocument();
  });

  it("returns null when cheapest is null", () => {
    const { container } = render(
      <PriceGapBadge airportCode="MUC" cheapest={null} />,
    );

    expect(container.innerHTML).toBe("");
  });

  it("returns null when cheapest has no rentalId", () => {
    const { container } = render(
      <PriceGapBadge airportCode="MUC" cheapest={{}} />,
    );

    expect(container.innerHTML).toBe("");
  });

  // ── Label stability ──

  it("shows 'Best Value at MUC' for alpine-ready cheapest", () => {
    render(
      <PriceGapBadge
        airportCode="MUC"
        cheapest={{
          rentalId: "test-bike",
          pricePerDay: 120,
          currency: "EUR",
          bikeName: "Test Bike",
          isAlpineReady: true,
        }}
      />,
    );

    expect(screen.getByText("Best Value at MUC")).toBeInTheDocument();
  });

  it("shows 'Best Value at MXP' for MXP alpine-ready cheapest", () => {
    render(
      <PriceGapBadge
        airportCode="MXP"
        cheapest={{
          rentalId: "test-bike-mxp",
          pricePerDay: 73,
          currency: "EUR",
          bikeName: "Moto Morini X-CAPE",
          isAlpineReady: true,
        }}
      />,
    );

    expect(screen.getByText("Best Value at MXP")).toBeInTheDocument();
  });

  it("shows price-based label for non-alpine cheapest", () => {
    render(
      <PriceGapBadge
        airportCode="LAX"
        cheapest={{
          rentalId: "cruiser-lax",
          pricePerDay: 89,
          currency: "USD",
          bikeName: "Harley Sportster",
          isAlpineReady: false,
        }}
      />,
    );

    // Should show the price-based label, not "Best Value at"
    const label = screen.getByText(/\/day/i);
    expect(label).toBeInTheDocument();
    expect(label.textContent).toContain("$89");
  });

  // ── LED pulse animation structure ──

  it("renders the LED ping animation element", () => {
    const { container } = render(
      <PriceGapBadge
        airportCode="MUC"
        cheapest={{
          rentalId: "test",
          pricePerDay: 100,
          currency: "EUR",
          bikeName: "Test",
          isAlpineReady: true,
        }}
      />,
    );

    const pingElement = container.querySelector(".animate-ping");
    expect(pingElement).toBeInTheDocument();
  });
});
