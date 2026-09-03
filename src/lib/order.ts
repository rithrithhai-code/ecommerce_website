/** Identity helpers for orders and the KHQR bill number that doubles as payment ref. */

function randomSuffix(length: number): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 to stay readable
  let out = "";
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < length; i += 1) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

function stamp(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/** Bill number written to EMVCo tag 62.01 and polled against the payment API. */
export function makeBillNumber(date = new Date()): string {
  return `KH${stamp(date)}${randomSuffix(6)}`;
}

export function makeOrderId(date = new Date()): string {
  return `ORD-${stamp(date)}-${randomSuffix(4)}`;
}

/** How long a dynamic KHQR stays payable before the shopper must regenerate it. */
export const PAYMENT_WINDOW_SECONDS = 10 * 60;

export function paymentDeadline(from = new Date()): Date {
  return new Date(from.getTime() + PAYMENT_WINDOW_SECONDS * 1000);
}
