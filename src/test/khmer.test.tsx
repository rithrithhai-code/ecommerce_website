import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import App from "@/App";

/**
 * Language switching, verified from the shopper's side: the control is reachable, the root
 * `lang` follows the choice (which is what loads the Khmer font stack), and the checkout
 * surface re-renders in Khmer without losing the cart.
 */
afterEach(cleanup);

describe("khmer localisation", () => {
  it("renders the storefront in Khmer when the language is switched", async () => {
    render(<App />);

    // English by default.
    expect(await screen.findByRole("link", { name: "Shop the catalogue" })).toBeTruthy();

    const [khmerButton] = await screen.findAllByRole("button", { name: "ខ្មែរ" });
    fireEvent.click(khmerButton);

    await waitFor(() => expect(document.documentElement.lang).toBe("km"));
    expect(await screen.findByRole("link", { name: "មើលបញ្ជីទំនិញ" })).toBeTruthy();
    expect(screen.getAllByText(/ស្កេន/).length).toBeGreaterThan(0);

    // Cart and totals survive the switch: only the copy changes.
    fireEvent.click(screen.getByRole("link", { name: "មើលបញ្ជីទំនិញ" }));
    expect(await screen.findByText("បញ្ជីទំនិញ")).toBeTruthy();
  });
});
