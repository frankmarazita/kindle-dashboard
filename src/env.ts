import { z } from "zod";

export enum Environment {
  Development = "development",
  Production = "production",
}
const zEnv = z.object({
  ENVIRONMENT: z.enum(Environment).default(Environment.Development),
  SENTRY_DSN: z.string().optional(),
  OBSIDIAN_HOST: z.string().min(1),
  OBSIDIAN_HTTPS: z
    .string()
    .default("false")
    .transform((val) => val === "true"),
  OBSIDIAN_PORT: z.string().transform((val) => {
    const parsed = parseInt(val);
    if (isNaN(parsed)) {
      throw new Error("OBSIDIAN_PORT must be a number");
    }
    return parsed;
  }),
  OBSIDIAN_TOKEN: z.string().min(1),
  PTV_DEV_ID: z.string().min(1),
  PTV_API_KEY: z.string().min(1),
});

export const ENV = zEnv.parse(process.env);
