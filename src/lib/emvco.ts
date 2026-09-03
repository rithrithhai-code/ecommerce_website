/**
 * KHQR / EMVCo Merchant-Presented QR payload builder.
 *
 * The QR shown at checkout is a real EMVCo TLV string (tag-length-value) closed with a
 * CRC-16/CCITT-FALSE checksum — the same construction KHQR and other merchant-presented
 * schemes use. Tag ids follow EMVCo Part 2 (Merchant Presented Mode).
 *
 * NOTE FOR PRODUCTION: the merchant-account-information and unreserved templates differ
 * between Cambodian acquirers and KHQR versions. Confirm the exact sub-tag layout with
 * your PSP's specification before going live; `extraTemplates` lets you add or override
 * tags without editing this file.
 */

import type { CurrencyCode, MerchantProfile } from "@/types";

/** ISO-4217 numeric codes for the currencies this store can settle in. */
export const EMV_CURRENCY: Record<CurrencyCode, string> = {
  USD: "840",
  KHR: "116",
};

/** ISO-4217 minor-unit exponents, applied when writing field 54. */
export const CURRENCY_EXPONENT: Record<CurrencyCode, number> = {
  USD: 2,
  KHR: 2,
};

export const EmvTag = {
  PayloadFormatIndicator: "00",
  PointOfInitialization: "01",
  MerchantAccountInfoBank: "02",
  MerchantAccountInfoGuid: "51",
  MerchantCategoryCode: "52",
  TransactionCurrency: "53",
  TransactionAmount: "54",
  CountryCode: "58",
  MerchantName: "59",
  MerchantCity: "60",
  PostalCode: "61",
  AdditionalData: "62",
  MerchantLanguage: "64",
  Unreserved: "80",
  Crc: "63",
} as const;

export const TagNames: Record<string, string> = {
  "00": "Payload format indicator",
  "01": "Point of initialization",
  "02": "Merchant account information (bank)",
  "26": "Merchant account information (template)",
  "51": "Merchant account information (globally unique)",
  "52": "Merchant category code",
  "53": "Transaction currency",
  "54": "Transaction amount",
  "58": "Country code",
  "59": "Merchant name",
  "60": "Merchant city",
  "61": "Postal code",
  "62": "Additional data field template",
  "63": "CRC checksum",
  "64": "Merchant language template",
  "80": "Unreserved templates",
};

/** Tags whose value is itself a concatenation of sub-TLV records. */
const NESTED_TAGS = new Set(["02", "26", "51", "62", "64", "80"]);

export interface SubTag {
  id: string;
  value: string;
}

export interface KhqrRequest {
  merchant: MerchantProfile;
  currency: CurrencyCode;
  /** Order total expressed in `currency`. Omit for a static (open-amount) QR. */
  amount?: number;
  /** Bill number echoed back by the payer's bank, so payments can be matched. */
  billNumber: string;
  /** "11" static / "12" dynamic. Dynamic QRs carry an amount and expire. */
  pointOfInitialization?: "11" | "12";
  /** Extra or replacement top-level templates, appended in EMVCo tag order. */
  extraTemplates?: Array<{ id: string; subtags: SubTag[] }>;
  /** Overrides the tag used for merchant account information (some PSPs use "02"). */
  accountInfoTag?: string;
}

/** Encode one TLV record. EMVCo lengths are two ASCII digits, so values cap at 99 chars. */
export function tlv(id: string, value: string): string {
  if (!/^\d{2}$/.test(id)) {
    throw new Error(`Invalid EMVCo tag id "${id}" — expected two digits`);
  }
  if (value.length > 99) {
    throw new Error(`Tag ${id} value is ${value.length} characters, maximum is 99`);
  }
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

function encodeTemplate(id: string, subtags: SubTag[]): string {
  return tlv(
    id,
    subtags.map((sub) => tlv(sub.id, sub.value)).join(""),
  );
}

/**
 * EMVCo payloads are printable ASCII. Khmer script and typographic quotes are common in
 * merchant profiles, so they are folded out before the length prefixes are computed.
 */
export function asciiSafe(value: string, maxLength: number): string {
  return value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .trim()
    .slice(0, maxLength);
}

/** Render an amount for field 54 using the currency's minor-unit exponent. */
export function emvAmount(amount: number, currency: CurrencyCode): string {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`Amount must be a positive number, received ${amount}`);
  }
  if (amount > 999999999.99) {
    throw new Error("Amount exceeds the 99-character EMVCo field limit");
  }
  return amount.toFixed(CURRENCY_EXPONENT[currency]);
}

/**
 * CRC-16/CCITT-FALSE — polynomial 0x1021, initial value 0xFFFF, no reflection, no XOR
 * out. The reference vector for the ASCII string "123456789" is 0x29B1.
 */
export function crc16CcittFalse(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Build the complete QR string. The checksum field is "6304" plus four hex characters
 * computed over everything that precedes it, including "6304" itself.
 */
export function buildKhqrPayload(request: KhqrRequest): string {
  const {
    merchant,
    currency,
    amount,
    billNumber,
    pointOfInitialization = "12",
    extraTemplates = [],
    accountInfoTag = EmvTag.MerchantAccountInfoGuid,
  } = request;

  const fields: string[] = [
    tlv(EmvTag.PayloadFormatIndicator, "01"),
    tlv(EmvTag.PointOfInitialization, pointOfInitialization),
    encodeTemplate(accountInfoTag, [
      { id: "00", value: asciiSafe(merchant.proxyId, 99) },
      { id: "01", value: asciiSafe(merchant.name, 25) },
    ]),
    tlv(EmvTag.MerchantCategoryCode, asciiSafe(merchant.mcc, 4)),
    tlv(EmvTag.TransactionCurrency, EMV_CURRENCY[currency]),
  ];

  if (amount !== undefined) {
    fields.push(tlv(EmvTag.TransactionAmount, emvAmount(amount, currency)));
  }

  fields.push(
    tlv(EmvTag.CountryCode, merchant.country),
    tlv(EmvTag.MerchantName, asciiSafe(merchant.name, 25).toUpperCase()),
    tlv(EmvTag.MerchantCity, asciiSafe(merchant.city, 15).toUpperCase()),
    tlv(EmvTag.PostalCode, asciiSafe(merchant.postalCode, 9)),
    encodeTemplate(EmvTag.AdditionalData, [
      { id: "01", value: asciiSafe(billNumber, 25) },
      { id: "03", value: "JINGHUB" },
    ]),
    encodeTemplate(EmvTag.MerchantLanguage, [{ id: "00", value: merchant.language }]),
  );

  for (const template of extraTemplates) {
    fields.push(encodeTemplate(template.id, template.subtags));
  }

  const withoutCrc = `${fields.join("")}${EmvTag.Crc}04`;
  return `${withoutCrc}${crc16CcittFalse(withoutCrc)}`;
}

export interface DecodedTag {
  id: string;
  name: string;
  value: string;
  length: number;
  nested: DecodedTag[];
}

export interface DecodeResult {
  tags: DecodedTag[];
  checksumPresent: boolean;
  checksumValid: boolean;
  expectedChecksum: string;
  actualChecksum: string;
  amount: number | null;
  currency: CurrencyCode | null;
  billNumber: string | null;
  errors: string[];
}

function decodeSubTags(value: string, errors: string[], where: string): DecodedTag[] {
  const out: DecodedTag[] = [];
  let cursor = 0;
  while (cursor + 4 <= value.length) {
    const id = value.slice(cursor, cursor + 2);
    const length = Number(value.slice(cursor + 2, cursor + 4));
    if (Number.isNaN(length)) {
      errors.push(`${where}: non-numeric length at offset ${cursor}`);
      break;
    }
    const start = cursor + 4;
    out.push({
      id,
      name: `Sub-tag ${id}`,
      value: value.slice(start, start + length),
      length,
      nested: [],
    });
    cursor = start + length;
  }
  return out;
}

/**
 * Parse a payload back into its tag tree and re-verify the checksum. Powers the
 * "decode this QR" panel in checkout and is the fastest way to spot a bad merchant
 * profile (over-long name, non-ASCII characters, missing bill number).
 */
export function decodeKhqrPayload(payload: string): DecodeResult {
  const errors: string[] = [];
  const tags: DecodedTag[] = [];
  let cursor = 0;

  while (cursor + 4 <= payload.length) {
    const id = payload.slice(cursor, cursor + 2);
    const rawLength = payload.slice(cursor + 2, cursor + 4);
    const length = Number(rawLength);

    if (!/^\d{2}$/.test(rawLength) || Number.isNaN(length)) {
      errors.push(`Malformed length prefix at offset ${cursor}`);
      break;
    }

    const start = cursor + 4;
    const value = payload.slice(start, start + length);
    if (value.length !== length) {
      errors.push(`Tag ${id} declared ${length} characters but only ${value.length} remain`);
      break;
    }

    tags.push({
      id,
      name: TagNames[id] ?? `Tag ${id}`,
      value,
      length,
      nested: NESTED_TAGS.has(id) ? decodeSubTags(value, errors, `Tag ${id}`) : [],
    });

    cursor = start + length;
  }

  if (cursor !== payload.length) {
    errors.push(`${payload.length - cursor} trailing characters could not be parsed`);
  }

  const crcTag = tags.find((tag) => tag.id === EmvTag.Crc);
  const checksumPresent = Boolean(crcTag);
  const bodyEnd = payload.lastIndexOf(`${EmvTag.Crc}04`);
  const head = bodyEnd >= 0 ? payload.slice(0, bodyEnd + 4) : payload;
  const expectedChecksum = crc16CcittFalse(head);
  const actualChecksum = crcTag?.value.toUpperCase() ?? "";

  const amountTag = tags.find((tag) => tag.id === EmvTag.TransactionAmount)?.value;
  const currencyTag = tags.find((tag) => tag.id === EmvTag.TransactionCurrency)?.value;
  const billTag = tags
    .find((tag) => tag.id === EmvTag.AdditionalData)
    ?.nested.find((sub) => sub.id === "01")?.value;

  const isoToCode: Record<string, CurrencyCode> = { "840": "USD", "116": "KHR" };

  return {
    tags,
    checksumPresent,
    checksumValid: checksumPresent && expectedChecksum === actualChecksum,
    expectedChecksum,
    actualChecksum,
    amount: amountTag !== undefined ? Number(amountTag) : null,
    currency: currencyTag ? (isoToCode[currencyTag] ?? null) : null,
    billNumber: billTag ?? null,
    errors,
  };
}
