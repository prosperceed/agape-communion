interface RateLimitEntry {
  attempts: number;
  firstAttemptAt: number;
  blockedUntil: number | null;
}

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_DURATION_MS = 15 * 60 * 1000;

const loginAttemptsMap = new Map<string, RateLimitEntry>();

export function checkLoginRateLimit(identifier: string): {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
} {
  const key = identifier.toLowerCase().trim();
  const now = Date.now();
  const entry = loginAttemptsMap.get(key);

  if (!entry) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, retryAfterSeconds: 0 };
  }

  if (entry.blockedUntil && entry.blockedUntil > now) {
    const retryAfterSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  if (now - entry.firstAttemptAt > WINDOW_MS) {
    loginAttemptsMap.delete(key);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, retryAfterSeconds: 0 };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - entry.attempts);
  return { allowed: remaining > 0, remainingAttempts: remaining, retryAfterSeconds: 0 };
}

export function recordFailedLoginAttempt(identifier: string): void {
  const key = identifier.toLowerCase().trim();
  const now = Date.now();
  const existing = loginAttemptsMap.get(key);

  if (!existing || now - existing.firstAttemptAt > WINDOW_MS) {
    loginAttemptsMap.set(key, {
      attempts: 1,
      firstAttemptAt: now,
      blockedUntil: null,
    });
    return;
  }

  const nextAttempts = existing.attempts + 1;
  loginAttemptsMap.set(key, {
    attempts: nextAttempts,
    firstAttemptAt: existing.firstAttemptAt,
    blockedUntil: nextAttempts >= MAX_ATTEMPTS ? now + BLOCK_DURATION_MS : null,
  });
}

export function resetLoginRateLimit(identifier: string): void {
  loginAttemptsMap.delete(identifier.toLowerCase().trim());
}

export function clearAllLoginRateLimits(): void {
  loginAttemptsMap.clear();
}
