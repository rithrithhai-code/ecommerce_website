/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL of a payment service implementing POST /payment-intents and
   * GET /payment-intents/:billNumber/status. Leave unset to run the sandbox simulator.
   */
  readonly VITE_PAYMENT_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
