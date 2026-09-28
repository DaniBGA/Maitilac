import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import * as schema from "../db/schema";
import { db } from "./db";

/**
 * Login del gestor (Better Auth, email y contraseña).
 * Sin registro público: los usuarios se crean con `pnpm gestor:usuario`.
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 10,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // una semana
  },
  rateLimit: {
    // En desarrollo y en los tests no se limita (el login se repite muchas veces).
    enabled: process.env.NODE_ENV === "production",
    customRules: { "/sign-in/email": { window: 60, max: 5 } },
  },
  plugins: [nextCookies()],
});
