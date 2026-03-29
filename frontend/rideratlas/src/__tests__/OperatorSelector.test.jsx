import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OperatorSelector from "@/features/rentals/components/OperatorSelector";

// Mock framer-motion to pass through — avoids animation timing issues in tests.
vi.mock("framer-motion", () => ({
  motion: {
    button: ({ children, ...props }) => {
      const { initial, animate, transition, whileInView, viewport, ...domProps } = props;
      return <button {...domProps}>{children}</button>;
    },
    div: ({ children, ...props }) => {
      const { initial, animate, transition, whileInView, viewport, ...domProps } = props;
      return <div {...domProps}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// ── Test fixtures ──
const MOCK_OPERATORS = {
  "allround-rent-muc": {
    id: "allround-rent-muc",
    slug: "allround-rent-muc",
    name: "Allround Rent Munich",
    type: "local",
    country: "DE",
  },
  "eaglerider-muc": {
    id: "eaglerider-muc",
    slug: "eaglerider-muc",
    name: "EagleRider Munich",
    type: "global",
    country: "US",
  },
  "dwm-ducati-muc": {
    id: "dwm-ducati-muc",
    slug: "dwm-ducati-muc",
    name: "DWM Ducati Munich",
    type: "local",
    country: "DE",
  },
};

const MOCK_RENTAL_INDEXES = {
  operatorsByAirport: {
    MUC: ["allround-rent-muc", "eaglerider-muc", "dwm-ducati-muc"],
  },
  rentalsByOperatorByAirport: {
    MUC: {
      "allround-rent-muc": ["r1", "r2", "r3", "r4", "r5"],
      "eaglerider-muc": ["r6", "r7"],
      "dwm-ducati-muc": ["r8"],
    },
  },
};

describe("OperatorSelector — 3-State UI Model", () => {
  // ── STATE: SKELETON ──

  it("renders skeleton cards when isLoading=true", () => {
    render(
      <OperatorSelector
        airportCode="MUC"
        rentalIndexes={null}
        operators={{}}
        onSelectOperator={() => {}}
        isLoading={true}
      />,
    );

    const container = screen.getByRole("status");
    expect(container).toBeInTheDocument();
    expect(screen.getByText("Loading operator data…")).toBeInTheDocument();
  });

  it("renders exactly 4 skeleton cards with fixed height", () => {
    const { container } = render(
      <OperatorSelector
        airportCode="MUC"
        rentalIndexes={null}
        operators={{}}
        onSelectOperator={() => {}}
        isLoading={true}
      />,
    );

    const skeletons = container.querySelectorAll("[aria-hidden='true']");
    expect(skeletons.length).toBe(4);

    // Fixed h-[156px] for zero CLS
    for (const skeleton of skeletons) {
      expect(skeleton.className).toContain("h-[156px]");
    }
  });

  // ── STATE: EMPTY ──

  it("renders empty state when airport has no operators", () => {
    render(
      <OperatorSelector
        airportCode="ZZZ"
        rentalIndexes={{ operatorsByAirport: {} }}
        operators={{}}
        onSelectOperator={() => {}}
        isLoading={false}
      />,
    );

    expect(screen.getByText("No Operators Indexed")).toBeInTheDocument();
  });

  it("renders empty state when operatorsByAirport returns empty array", () => {
    render(
      <OperatorSelector
        airportCode="MUC"
        rentalIndexes={{ operatorsByAirport: { MUC: [] } }}
        operators={{}}
        onSelectOperator={() => {}}
        isLoading={false}
      />,
    );

    expect(screen.getByText("No Operators Indexed")).toBeInTheDocument();
  });

  // ── STATE: LOADED ──

  it("renders operator cards from operatorsByAirport[airport]", () => {
    render(
      <OperatorSelector
        airportCode="MUC"
        rentalIndexes={MOCK_RENTAL_INDEXES}
        operators={MOCK_OPERATORS}
        onSelectOperator={() => {}}
        isLoading={false}
      />,
    );

    expect(screen.getByText("Allround Rent Munich")).toBeInTheDocument();
    expect(screen.getByText("EagleRider Munich")).toBeInTheDocument();
    expect(screen.getByText("DWM Ducati Munich")).toBeInTheDocument();
  });

  it("displays correct fleet count from compound index", () => {
    render(
      <OperatorSelector
        airportCode="MUC"
        rentalIndexes={MOCK_RENTAL_INDEXES}
        operators={MOCK_OPERATORS}
        onSelectOperator={() => {}}
        isLoading={false}
      />,
    );

    expect(screen.getByText("5 machines")).toBeInTheDocument();
    expect(screen.getByText("2 machines")).toBeInTheDocument();
    expect(screen.getByText("1 machine")).toBeInTheDocument();
  });

  it("shows operator count in header", () => {
    render(
      <OperatorSelector
        airportCode="MUC"
        rentalIndexes={MOCK_RENTAL_INDEXES}
        operators={MOCK_OPERATORS}
        onSelectOperator={() => {}}
        isLoading={false}
      />,
    );

    expect(screen.getByText("(3 available)")).toBeInTheDocument();
  });

  // ── Interaction ──

  it("calls onSelectOperator with correct operatorId when clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <OperatorSelector
        airportCode="MUC"
        rentalIndexes={MOCK_RENTAL_INDEXES}
        operators={MOCK_OPERATORS}
        onSelectOperator={onSelect}
        isLoading={false}
      />,
    );

    await user.click(screen.getByLabelText(/View fleet from Allround Rent Munich/));
    expect(onSelect).toHaveBeenCalledWith("allround-rent-muc");
  });

  // ── Guard: missing operator metadata ──

  it("does not crash when operator metadata is missing for an indexed ID", () => {
    const partialOperators = {
      "allround-rent-muc": MOCK_OPERATORS["allround-rent-muc"],
      // eaglerider-muc and dwm-ducati-muc intentionally missing
    };

    render(
      <OperatorSelector
        airportCode="MUC"
        rentalIndexes={MOCK_RENTAL_INDEXES}
        operators={partialOperators}
        onSelectOperator={() => {}}
        isLoading={false}
      />,
    );

    // Should render the one valid operator without crashing
    expect(screen.getByText("Allround Rent Munich")).toBeInTheDocument();
  });

  // ── Airport normalization ──

  it("normalizes lowercase airport code to uppercase for lookup", () => {
    render(
      <OperatorSelector
        airportCode="muc"
        rentalIndexes={MOCK_RENTAL_INDEXES}
        operators={MOCK_OPERATORS}
        onSelectOperator={() => {}}
        isLoading={false}
      />,
    );

    expect(screen.getByText("Allround Rent Munich")).toBeInTheDocument();
  });
});
