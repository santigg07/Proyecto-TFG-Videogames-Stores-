/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly API_URL: string;
  readonly PUBLIC_API_URL: string;
  readonly PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
  readonly PUBLIC_PAYPAL_CLIENT_ID: string;
  readonly PUBLIC_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}