import { describe, expect, it } from "vitest";

import {
  asciiSafe,
  buildKhqrPayload,
  crc16CcittFalse,
  decodeKhqrPayload,
  emvAmount,
  tlv,
} from "./emvco";

import type { MerchantProfile } from "@/types";

const merchant: MerchantProfile = {
  name: "JINGHUB EXPRESS LTD",
  city: "PHNOM PENH",
  country: "KH",
  postalCode: "12302",
  mcc: "5732",
  proxyId: "BAKONG.KH.000294817",
  language: "en",
};

describe("crc16CcittFalse", () => {
  it("matches the CRC-16/CCITT-FALSE reference vector", () => {
    expect(crc16CcittFalse("123456789")).toBe("29B1");
  });

  it("is uppercase and zero-padded to four hex digits", () => {
    expect(crc16CcittFalse("A")).toMatch(/^[0-9A-F]{4}$/);
  });
});

describe("tlv", () => {
  it("prefixes the value with a two-digit length", () => {
    expect(tlv("00", "01")).toBe("000201");
    expect(tlv("59", "JINGHUB")).toBe("5907JINGHUB");
  });

  it("rejects tag ids that are not two digits", () => {
    expect(() => tlv("5", "x")).toThrow(/two digits/);
  });

  it("rejects values beyond the 99-character field limit", () => {
    expect(() => tlv("59", "x".repeat(100))).toThrow(/maximum is 99/);
  });
});

describe("asciiSafe", () => {
  it("drops non-ASCII script and truncates to the field width", () => {
    expect(asciiSafe("ភ្នំពេញ PHNOM PENH", 15)).toBe("PHNOM PENH");
  });
});

describe("emvAmount", () => {
  it("writes field 54 with the currency's minor units", () => {
    expect(emvAmount(1234.5, "USD")).toBe("1234.50");
    expect(emvAmount(5000, "KHR")).toBe("5000.00");
  });

  it("refuses non-positive amounts", () => {
    expect(() => emvAmount(0, "USD")).toThrow(/positive number/);
  });
});

describe("buildKhqrPayload", () => {
  const payload = buildKhqrPayload({
    merchant,
    currency: "USD",
    amount: 318.6,
    billNumber: "KH-20260903-7F3A",
  });

  it("opens with the payload format indicator and point of initialization", () => {
    expect(payload.startsWith("0002010102")).toBe(true);
  });

  it("places the CRC field last with a four-character value", () => {
    expect(payload.slice(0, 4)).not.toBe("6304");
    expect(payload).toMatch(/6304[0-9A-F]{4}$/);
  });

  it("round-trips through the decoder with a valid checksum", () => {
    const decoded = decodeKhqrPayload(payload);
    expect(decoded.errors).toEqual([]);
    expect(decoded.checksumValid).toBe(true);
    expect(decoded.amount).toBe(318.6);
    expect(decoded.currency).toBe("USD");
    expect(decoded.billNumber).toBe("KH-20260903-7F3A");
  });

  it("detects a tampered amount", () => {
    const tampered = payload.replace("5406318.60", "5406999.99");
    expect(tampered).not.toBe(payload);
    expect(decodeKhqrPayload(tampered).checksumValid).toBe(false);
  });

  it("omits field 54 for a static open-amount QR", () => {
    const open = buildKhqrPayload({
      merchant,
      currency: "KHR",
      billNumber: "KH-STATIC",
      pointOfInitialization: "11",
    });
    const decoded = decodeKhqrPayload(open);
    expect(decoded.amount).toBeNull();
    expect(decoded.checksumValid).toBe(true);
    expect(decoded.tags.some((tag) => tag.id === "01" && tag.value === "11")).toBe(true);
  });

  it("accepts PSP-specific extra templates", () => {
    const withExtra = buildKhqrPayload({
      merchant,
      currency: "USD",
      amount: 10,
      billNumber: "B1",
      extraTemplates: [{ id: "80", subtags: [{ id: "00", value: "kh.gov.psp" }] }],
    });
    const decoded = decodeKhqrPayload(withExtra);
    expect(decoded.checksumValid).toBe(true);
    expect(decoded.tags.some((tag) => tag.id === "80")).toBe(true);
  });
});
