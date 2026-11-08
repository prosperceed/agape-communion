import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, users } from "@/lib/db";
import { env } from "@/config/env";
import {
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  resetLoginRateLimit,
} from "./rate-limit";
import {
  assertAdminPermission,
  AuthorizationError,
  type Permission,
} from "./permissions";
import type { AdminRole, AccountStatus, AuthenticatedAdmin } from "@/types";

const loginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

let testAdminOverride: AuthenticatedAdmin | null | undefined = undefined;

export function setTestAdminSession(admin: AuthenticatedAdmin | null | undefined) {
  testAdminOverride = admin;
}

export async function verifyAdminCredentials(
  rawEmail: string,
  rawPassword: string
): Promise<
  | { ok: true; admin: AuthenticatedAdmin }
  | { ok: false; error: string; statusCode: number }
> {
  const parsed = loginCredentialsSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid email or password format.", statusCode: 400 };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const rateLimit = checkLoginRateLimit(email);
  if (!rateLimit.allowed) {
    return {
      ok: false,
      error: `Too many failed login attempts. Try again in ${rateLimit.retryAfterSeconds} seconds.`,
      statusCode: 429,
    };
  }

  const db = await getDb();
  const [userRecord] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!userRecord) {
    recordFailedLoginAttempt(email);
    return { ok: false, error: "Invalid email or password.", statusCode: 401 };
  }

  if (userRecord.status !== "ACTIVE") {
    recordFailedLoginAttempt(email);
    return {
      ok: false,
      error: "This administrator account is not active.",
      statusCode: 403,
    };
  }

  const storedHash = userRecord.passwordHash || "";
  const isBcryptHash =
    storedHash.startsWith("$2a$") ||
    storedHash.startsWith("$2b$") ||
    storedHash.startsWith("$2y$");

  let isPasswordValid = false;
  if (isBcryptHash) {
    isPasswordValid = await bcrypt.compare(parsed.data.password, storedHash);
  } else if (storedHash.length > 0 && storedHash === parsed.data.password) {
    // Plain-text password entered directly in database: encrypt and persist immediately
    isPasswordValid = true;
    const encryptedHash = await bcrypt.hash(parsed.data.password, 12);
    await db
      .update(users)
      .set({ passwordHash: encryptedHash, updatedAt: new Date() })
      .where(eq(users.id, userRecord.id));
  }

  if (!isPasswordValid) {
    recordFailedLoginAttempt(email);
    return { ok: false, error: "Invalid email or password.", statusCode: 401 };
  }

  resetLoginRateLimit(email);

  await db
    .update(users)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, userRecord.id));

  return {
    ok: true,
    admin: {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role,
      status: userRecord.status,
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 12, // 12 hours
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          !credentials ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        const result = await verifyAdminCredentials(
          credentials.email,
          credentials.password
        );

        if (!result.ok) {
          return null;
        }

        return {
          id: result.admin.id,
          name: result.admin.name,
          email: result.admin.email,
          role: result.admin.role,
          status: result.admin.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as unknown as AuthenticatedAdmin).role;
        token.status = (user as unknown as AuthenticatedAdmin).status;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        (session.user as unknown as AuthenticatedAdmin).role =
          token.role as AdminRole;
        (session.user as unknown as AuthenticatedAdmin).status =
          token.status as AccountStatus;
      }
      return session;
    },
  },
});

export async function getCurrentAdmin(): Promise<AuthenticatedAdmin | null> {
  if (testAdminOverride !== undefined) {
    if (!testAdminOverride) return null;
    const db = await getDb();
    const [freshUser] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: users.status,
      })
      .from(users)
      .where(eq(users.id, testAdminOverride.id))
      .limit(1);

    if (!freshUser || freshUser.status !== "ACTIVE") {
      return null;
    }
    return freshUser;
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }

    const db = await getDb();
    const [freshUser] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: users.status,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!freshUser || freshUser.status !== "ACTIVE") {
      return null;
    }

    return freshUser;
  } catch {
    return null;
  }
}

export async function requireAdminPermission(
  permission: Permission
): Promise<AuthenticatedAdmin> {
  const admin = await getCurrentAdmin();
  return assertAdminPermission(admin, permission);
}

export { AuthorizationError };
export * from "./permissions";
export * from "./rate-limit";
export * from "./activity-log";
