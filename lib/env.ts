import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// https://env.t3.gg/docs/nextjs
export const env = createEnv({
  server: {
    // NEYNAR
    NEYNAR_API_KEY: z.string().min(1),
    // JWT
    JWT_SECRET: z.string().min(1),
    // QSTASH
    QSTASH_URL: z.string().url().min(1),
    QSTASH_TOKEN: z.string().min(1),
    QSTASH_CURRENT_SIGNING_KEY: z.string().min(1),
    QSTASH_NEXT_SIGNING_KEY: z.string().min(1),
    // SUPABASE
    SUPABASE_SERVICE_KEY: z.string().min(1),
    SUPABASE_URL: z.string().url().min(1),
    DATABASE_URL: z.string().url().min(1),
    DIRECT_URL: z.string().url().min(1),
    // Mint Collectible
    OPENAI_API_KEY: z.string().min(1),
    MIDJOURNEY_API_KEY: z.string().min(1),
    PINATA_JWT_SECRET: z.string().min(1),
    SIGNER_PRIVATE_KEY: z.string().min(1),
    // test playwright
    PLAYWRIGHT_TOKEN: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_URL: z.string().url().min(1),
    // PostHog
    NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().min(1),
    NEXT_PUBLIC_POSTHOG_DISABLED: z.string().optional(),
    // Pinata
    NEXT_PUBLIC_GATEWAY_URL: z.string().min(1),
    // Daimo Pay
    NEXT_PUBLIC_DAIMO_PAY_ID: z.string().min(1),
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: z.string().min(1),
    NEXT_PUBLIC_REOWN_DOMAIN_VERIFICATION_CODE: z.string().min(1),
    // Farcaster Manifest
    NEXT_PUBLIC_FARCASTER_HEADER: z.string().min(1),
    NEXT_PUBLIC_FARCASTER_PAYLOAD: z.string().min(1),
    NEXT_PUBLIC_FARCASTER_SIGNATURE: z.string().min(1),
    // test playwright
    NEXT_PUBLIC_IS_TEST_MODE: z.string().transform((s) => s === "true"),
    NEXT_PUBLIC_APP_ENV: z
      .enum(["development", "production"])
      .optional()
      .default("development"),
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  experimental__runtimeEnv: {
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_POSTHOG_DISABLED: process.env.NEXT_PUBLIC_POSTHOG_DISABLED,
    NEXT_PUBLIC_GATEWAY_URL: process.env.NEXT_PUBLIC_GATEWAY_URL,
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
    NEXT_PUBLIC_DAIMO_PAY_ID: process.env.NEXT_PUBLIC_DAIMO_PAY_ID,
    NEXT_PUBLIC_FARCASTER_HEADER: process.env.NEXT_PUBLIC_FARCASTER_HEADER,
    NEXT_PUBLIC_FARCASTER_PAYLOAD: process.env.NEXT_PUBLIC_FARCASTER_PAYLOAD,
    NEXT_PUBLIC_FARCASTER_SIGNATURE:
      process.env.NEXT_PUBLIC_FARCASTER_SIGNATURE,
    NEXT_PUBLIC_REOWN_DOMAIN_VERIFICATION_CODE:
      process.env.NEXT_PUBLIC_REOWN_DOMAIN_VERIFICATION_CODE,
    NEXT_PUBLIC_IS_TEST_MODE: process.env.NEXT_PUBLIC_IS_TEST_MODE,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  },
});
