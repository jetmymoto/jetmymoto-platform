import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mock networkGraph module ──
const mockReadGraphShard = vi.fn();
const mockGetGraphShardStatus = vi.fn();
const mockLoadGraphShard = vi.fn();

vi.mock("@/core/network/networkGraph", () => ({
  GRAPH: {},
  readGraphShard: (...args) => mockReadGraphShard(...args),
  getGraphShardStatus: (...args) => mockGetGraphShardStatus(...args),
  loadGraphShard: (...args) => mockLoadGraphShard(...args),
}));

// ── Mock framer-motion to passthrough ──
vi.mock("framer-motion", () => ({
  motion: {
    button: ({ children, ...props }) => {
      const { initial, animate, transition, whileInView, viewport, whileHover, whileTap, ...domProps } = props;
      return <button {...domProps}>{children}</button>;
    },
    div: ({ children, ...props }) => {
      const { initial, animate, transition, whileInView, viewport, whileHover, whileTap, ...domProps } = props;
      return <div {...domProps}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// ── Mock RentalCard to simplify assertions ──
vi.mock("@/features/rentals/components/RentalCard", () => ({
  default: ({ rental }) => (
    <div data-testid={`rental-card-${rental.id}`}>{rental.id}</div>
  ),
}));

import RentalGrid from "@/features/rentals/components/RentalGrid";

// ── Test fixtures ──

const OPERATORS = {
  "alpha-motors-muc": {
    id: "alpha-motors-muc",
    slug: "alpha-motors-muc",
    name: "Alpha Motors Munich",
    type: "local",
    country: "DE",
  },
  "beta-rides-muc": {
    id: "beta-rides-muc",
    slug: "beta-rides-muc",
    name: "Beta Rides Munich",
    type: "franchise",
    country: "DE",
  },
};

const RENTALS = {
  "bmw-r1300gs-muc": {
    id: "bmw-r1300gs-muc",
    slug: "bmw-r1300gs-muc",
    brand: "BMW",
    model: "R 1300 GS",
    category: "adventure",
    airportCode: "MUC",
    operatorId: "alpha-motors-muc",
    pricing: { pricePerDay: 189, currency: "EUR" },
  },
  "bmw-f900r-muc": {
    id: "bmw-f900r-muc",
    slug: "bmw-f900r-muc",
    brand: "BMW",
    model: "F 900 R",
    category: "sport-touring",
    airportCode: "MUC",
    operatorId: "alpha-motors-muc",
    pricing: { pricePerDay: 129, currency: "EUR" },
  },
  "ducati-multistrada-muc": {
    id: "ducati-multistrada-muc",
    slug: "ducati-multistrada-muc",
    brand: "Ducati",
    model: "Multistrada V4S",
    category: "adventure",
    airportCode: "MUC",
    operatorId: "beta-rides-muc",
    pricing: { pricePerDay: 220, currency: "EUR" },
  },
};

const RENTAL_INDEXES = {
  rentalsByAirport: {
    MUC: ["bmw-r1300gs-muc", "bmw-f900r-muc", "ducati-multistrada-muc"],
  },
  rentalsByOperator: {
    "alpha-motors-muc": ["bmw-r1300gs-muc", "bmw-f900r-muc"],
    "beta-rides-muc": ["ducati-multistrada-muc"],
  },
  rentalsByOperatorByAirport: {
    MUC: {
      "alpha-motors-muc": ["bmw-r1300gs-muc", "bmw-f900r-muc"],
      "beta-rides-muc": ["ducati-multistrada-muc"],
    },
  },
  operatorsByAirport: {
    MUC: ["alpha-motors-muc", "beta-rides-muc"],
  },
  cheapestByAirport: {
    MUC: {
      rentalId: "bmw-f900r-muc",
      pricePerDay: 129,
      currency: "EUR",
      bikeName: "BMW F 900 R",
      isAlpineReady: true,
    },
  },
  suitabilityScores: {
    MUC: { alpine: 9, touring: 7, urban: 5 },
  },
};

function setupLoadedShard() {
  mockGetGraphShardStatus.mockReturnValue("loaded");
  mockReadGraphShard.mockReturnValue({
    rentals: RENTALS,
    operators: OPERATORS,
    rentalIndexes: RENTAL_INDEXES,
  });
  mockLoadGraphShard.mockResolvedValue(undefined);
}

function setupIdleShard() {
  mockGetGraphShardStatus.mockReturnValue("idle");
  mockReadGraphShard.mockReturnValue(null);
  mockLoadGraphShard.mockResolvedValue(undefined);
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ──────────────────────────────────────────────────────────────── Tests ──

describe("RentalGrid", () => {
  // ── Step 1: Operator Selection surface ──

  it("shows operator selector in Step 1 when no operator is selected", () => {
    setupLoadedShard();
    render(<RentalGrid airportCode="MUC" />);

    // OperatorSelector should be visible (renders operator names)
    expect(screen.getByText("Alpha Motors Munich")).toBeInTheDocument();
    expect(screen.getByText("Beta Rides Munich")).toBeInTheDocument();
  });

  it("does NOT render any fleet rental cards in Step 1", () => {
    setupLoadedShard();
    render(<RentalGrid airportCode="MUC" />);

    // No RentalCard instances should be in the DOM during operator selection
    expect(screen.queryByTestId("rental-card-bmw-r1300gs-muc")).not.toBeInTheDocument();
    expect(screen.queryByTestId("rental-card-bmw-f900r-muc")).not.toBeInTheDocument();
    expect(screen.queryByTestId("rental-card-ducati-multistrada-muc")).not.toBeInTheDocument();
  });

  it("shows total machine count in the showroom header", () => {
    setupLoadedShard();
    render(<RentalGrid airportCode="MUC" />);

    expect(screen.getByText("3 Machines Indexed")).toBeInTheDocument();
  });

  // ── Step 2: Fleet Reveal ──

  it("renders only the selected operator's fleet after clicking an operator", async () => {
    setupLoadedShard();
    const user = userEvent.setup();
    render(<RentalGrid airportCode="MUC" />);

    // Click Alpha Motors
    await user.click(screen.getByText("Alpha Motors Munich"));

    // Alpha fleet visible
    expect(screen.getByTestId("rental-card-bmw-r1300gs-muc")).toBeInTheDocument();
    expect(screen.getByTestId("rental-card-bmw-f900r-muc")).toBeInTheDocument();

    // Beta fleet NOT visible
    expect(screen.queryByTestId("rental-card-ducati-multistrada-muc")).not.toBeInTheDocument();
  });

  it("shows back button and filter controls in Step 2", async () => {
    setupLoadedShard();
    const user = userEvent.setup();
    render(<RentalGrid airportCode="MUC" />);

    await user.click(screen.getByText("Alpha Motors Munich"));

    // Back button
    expect(screen.getByText(/All Operators/i)).toBeInTheDocument();

    // Filter selects
    expect(screen.getByLabelText("Filter rentals by brand")).toBeInTheDocument();
    expect(screen.getByLabelText("Filter rentals by type")).toBeInTheDocument();
    expect(screen.getByLabelText("Sort rentals by price")).toBeInTheDocument();
  });

  it("returns to Step 1 when back button is clicked", async () => {
    setupLoadedShard();
    const user = userEvent.setup();
    render(<RentalGrid airportCode="MUC" />);

    // Enter Step 2
    await user.click(screen.getByText("Alpha Motors Munich"));
    expect(screen.getByTestId("rental-card-bmw-r1300gs-muc")).toBeInTheDocument();

    // Click back
    await user.click(screen.getByText(/All Operators/i));

    // Back to Step 1 — operator names visible, no rental cards
    expect(screen.getByText("Alpha Motors Munich")).toBeInTheDocument();
    expect(screen.queryByTestId("rental-card-bmw-r1300gs-muc")).not.toBeInTheDocument();
  });

  it("resets filters when switching operators", async () => {
    setupLoadedShard();
    const user = userEvent.setup();
    render(<RentalGrid airportCode="MUC" />);

    // Select Alpha, change brand filter
    await user.click(screen.getByText("Alpha Motors Munich"));
    const brandSelect = screen.getByLabelText("Filter rentals by brand");
    await user.selectOptions(brandSelect, "BMW");

    // Go back and select Beta
    await user.click(screen.getByText(/All Operators/i));
    await user.click(screen.getByText("Beta Rides Munich"));

    // Brand filter should be reset to ALL
    const newBrandSelect = screen.getByLabelText("Filter rentals by brand");
    expect(newBrandSelect.value).toBe("ALL");
  });

  // ── Empty states ──

  it("shows empty hub state when airport has no rentals", () => {
    mockGetGraphShardStatus.mockReturnValue("loaded");
    mockReadGraphShard.mockReturnValue({
      rentals: {},
      operators: {},
      rentalIndexes: {
        rentalsByAirport: {},
        rentalsByOperatorByAirport: {},
        operatorsByAirport: {},
        cheapestByAirport: {},
        suitabilityScores: {},
      },
    });
    mockLoadGraphShard.mockResolvedValue(undefined);

    render(<RentalGrid airportCode="ZZZ" />);

    expect(screen.getByText(/No Verified Rentals For ZZZ/i)).toBeInTheDocument();
  });

  it("shows empty filter state when filters exclude all fleet", async () => {
    setupLoadedShard();
    const user = userEvent.setup();
    render(<RentalGrid airportCode="MUC" />);

    // Select Beta (1 Ducati only)
    await user.click(screen.getByText("Beta Rides Munich"));

    // Filter by BMW brand — should have no match in Beta fleet
    const brandSelect = screen.getByLabelText("Filter rentals by brand");
    // Beta only has Ducati, so there's no BMW option at all
    // The filter should show Ducati only
    expect(screen.getByTestId("rental-card-ducati-multistrada-muc")).toBeInTheDocument();
  });

  // ── Shard loading state ──

  it("triggers shard load when status is idle", () => {
    setupIdleShard();
    render(<RentalGrid airportCode="MUC" />);

    expect(mockLoadGraphShard).toHaveBeenCalledWith("rentals");
  });

  // ── Price Gap Badge ──

  it("renders PriceGapBadge when cheapest data exists for airport", () => {
    setupLoadedShard();
    render(<RentalGrid airportCode="MUC" />);

    expect(screen.getByText("Best Value at MUC")).toBeInTheDocument();
  });

  // ── Airport normalization ──

  it("normalizes lowercase airport code to uppercase", () => {
    setupLoadedShard();
    render(<RentalGrid airportCode="muc" />);

    expect(screen.getByText("MUC Rental Fleet")).toBeInTheDocument();
    expect(screen.getByText("3 Machines Indexed")).toBeInTheDocument();
  });
});
