import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import App from "@/App";

/**
 * End-to-end smoke test of the path that matters: browse → add to cart → checkout details →
 * generate KHQR → decode what was generated and assert the checksum is valid. If the payload
 * builder, the pricing maths or the payment state machine drift, this fails.
 */
afterEach(cleanup);

describe("storefront checkout", () => {
  it("reaches a valid KHQR payload from the catalogue", async () => {
    render(<App />);

    fireEvent.click(await screen.findByRole("link", { name: "Shop the catalogue" }));

    const card = await screen.findByText("Aura One ANC Headphones");
    expect(card).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "Add Aura One ANC Headphones to cart" }),
    );
    await screen.findByRole("heading", { name: "Your cart" });

    fireEvent.click(screen.getByRole("link", { name: /^Checkout$/ }));
    await screen.findByText("Where it goes");

    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Sokha Chan" } });
    fireEvent.change(screen.getByLabelText("Email for the receipt"), {
      target: { value: "sokha@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Mobile number"), {
      target: { value: "012345678" },
    });
    fireEvent.change(screen.getByLabelText("Street address"), {
      target: { value: "No. 24, Street 63, BKK1" },
    });
    fireEvent.change(screen.getByLabelText("City or Khan"), {
      target: { value: "Phnom Penh" },
    });
    fireEvent.change(screen.getByLabelText("Postal code"), { target: { value: "12302" } });

    fireEvent.click(screen.getByRole("button", { name: /Generate KHQR/ }));

    await screen.findByText("Scan to pay");
    expect(screen.getByText(/Bill reference/)).toBeTruthy();

    // The inspector re-decodes the payload the checkout just built.
    fireEvent.click(screen.getByRole("button", { name: /Payload inspector/ }));
    expect(await screen.findByText(/CRC valid/)).toBeTruthy();

    // 299 + 7.5% ... subtotal 299, delivery 0 under free threshold? assert the panel total is shown
    expect(screen.getAllByText(/\$328\.90|328,90/).length).toBeGreaterThan(0);
  });
});
