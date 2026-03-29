import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const mockCreateRentalReservation = vi.fn();
const mockCreateCheckoutSession = vi.fn();
const mockGenerateMissionCopy = vi.fn();
const mockGenerateExperienceUpsell = vi.fn();
const mockGenerateItinerary = vi.fn();

vi.mock("@/services/bookingService", () => ({
  createRentalReservation: (...args) => mockCreateRentalReservation(...args),
  createCheckoutSession: (...args) => mockCreateCheckoutSession(...args),
}));

vi.mock("@/features/rentals/utils/missionCopyEngine", () => ({
  generateMissionCopy: (...args) => mockGenerateMissionCopy(...args),
}));

vi.mock("@/features/rentals/utils/experienceEngine", () => ({
  generateExperienceUpsell: (...args) => mockGenerateExperienceUpsell(...args),
}));

vi.mock("@/features/rentals/utils/itineraryEngine", () => ({
  generateItinerary: (...args) => mockGenerateItinerary(...args),
}));

import SalesSharkChatWidget from "@/features/rentals/components/SalesSharkChatWidget";

const RENTAL = {
  id: "bmw-r1300gs-mxp-eagle-rider-mxp",
  slug: "bmw-r1300gs-mxp-eagle-rider-mxp",
  category: "adventure",
  airportCode: "MXP",
  airportCity: "Milan",
  brand: "BMW",
  model: "R 1300 GS",
  operatorId: "eagle-rider-mxp",
};

const OPERATOR = {
  id: "eagle-rider-mxp",
  name: "EagleRider Milan Airport",
  security_deposit_amount: "EUR 2000",
  security_deposit_policy: "A EUR 2000 authorization is held at pickup.",
  cancellation_policy: "48-hour notice required for refund.",
};

const AIRPORT = {
  code: "MXP",
  city: "Milan",
};

function renderWidget() {
  return render(
    <MemoryRouter>
      <SalesSharkChatWidget rental={RENTAL} operator={OPERATOR} airport={AIRPORT} />
    </MemoryRouter>,
  );
}

beforeAll(() => {
  Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
    value: vi.fn(),
    writable: true,
  });
});

async function driveToConfirm(user, container) {
  await user.click(screen.getByRole("button", { name: /initiate briefing/i }));

  const [pickupDateInput, returnDateInput] = container.querySelectorAll('input[type="date"]');
  fireEvent.change(pickupDateInput, { target: { value: "2026-05-10" } });
  fireEvent.change(returnDateInput, { target: { value: "2026-05-12" } });

  await user.click(screen.getByRole("button", { name: /confirm window/i }));
  await screen.findByRole("button", { name: /premium/i });

  await user.click(screen.getByRole("button", { name: /premium/i }));
  await screen.findByRole("button", { name: /verify identity/i });

  await user.type(screen.getByPlaceholderText(/commander name/i), "Vlad Rider");
  await user.type(screen.getByPlaceholderText(/secure email/i), "vladisin80@gmail.com");

  await user.click(screen.getByRole("button", { name: /verify identity/i }));
  await screen.findByRole("button", { name: /lock this machine now/i });
}

beforeEach(() => {
  vi.clearAllMocks();

  mockGenerateMissionCopy.mockResolvedValue({
    hook: "Mission hook copy",
    durationAdvice: "This window works. But extending by 1–2 days unlocks the full terrain profile this machine is built for.",
  });
  mockGenerateExperienceUpsell.mockResolvedValue({
    routeHighlight: null,
    hotelSuggestion: null,
    restaurantSuggestion: null,
    bikerSpot: null,
  });
  mockGenerateItinerary.mockResolvedValue({
    overview: "Overview",
    days: [
      {
        day: 1,
        title: "Outbound Vector",
        summary: "Summary",
        distanceKm: 180,
        highlights: ["Highway egress"],
      },
    ],
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SalesSharkChatWidget recovery flow", () => {
  it("shows recovery copy and retry CTA after checkout fails following reservation creation", async () => {
    mockCreateRentalReservation.mockResolvedValue({
      success: true,
      bookingRef: "JMR-TEST-123",
    });
    mockCreateCheckoutSession.mockRejectedValue(new Error("payment uplink fault"));

    const user = userEvent.setup();
    const { container } = renderWidget();

    await driveToConfirm(user, container);
    await user.click(screen.getByRole("button", { name: /lock this machine now/i }));

    await waitFor(() => {
      expect(mockCreateRentalReservation).toHaveBeenCalledTimes(1);
      expect(mockCreateCheckoutSession).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByText(/transmission interrupted\./i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/we've already linked this reservation to: vladisin80@gmail.com/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /retry secure uplink/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue via ops confirmation/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/this machine is being held for a limited window while we resolve this\./i),
    ).toHaveLength(2);
  });

  it("allows ops confirmation fallback after a failed checkout hold", async () => {
    mockCreateRentalReservation.mockResolvedValue({
      success: true,
      bookingRef: "JMR-TEST-123",
    });
    mockCreateCheckoutSession.mockRejectedValue(new Error("payment uplink fault"));

    const user = userEvent.setup();
    const { container } = renderWidget();

    await driveToConfirm(user, container);
    await user.click(screen.getByRole("button", { name: /lock this machine now/i }));

    await screen.findByRole("button", { name: /continue via ops confirmation/i });
    await user.click(screen.getByRole("button", { name: /continue via ops confirmation/i }));

    expect(
      await screen.findByText(/ops hold active/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/booking reference held: jmr-test-123/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ops will finalize this manually and contact you shortly\./i),
    ).toBeInTheDocument();
  });
});
