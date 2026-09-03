import type { MerchantProfile } from "@/types";

/**
 * Sandbox merchant profile. Swap these values for the ones your acquirer issues — the
 * QR payload is rebuilt from this object alone, so nothing else has to change.
 */
export const MERCHANT: MerchantProfile = {
  name: "JINGHUB EXPRESS",
  city: "Phnom Penh",
  country: "KH",
  postalCode: "12302",
  /** MCC 5732 — Electronics Sale. */
  mcc: "5732",
  /** Bakong proxy / BIS account identifier supplied by the PSP. */
  proxyId: "AK.702.BAKONG.000000000000000001",
  language: "en",
};

export const SUPPORT_CONTACT = {
  phone: "+855 23 900 100",
  email: "care@jinghub.example",
  address: "No. 24, Street 63, BKK1, Phnom Penh 12302",
  hours: "Mon–Sun · 08:30 – 20:30 (ICT)",
};
