const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;

type LoginAttemptState = {
  count: number;
  blockedUntil?: number;
};

const loginAttempts = new Map<string, LoginAttemptState>();

export function getLoginRateLimitKey(identifier: string) {
  return identifier.trim().toLowerCase();
}

function getOrCreateState(key: string, now: number): LoginAttemptState {
  const existing = loginAttempts.get(key);
  if (existing) {
    if (existing.blockedUntil && existing.blockedUntil > now) {
      return existing;
    }

    if (existing.blockedUntil && existing.blockedUntil <= now) {
      existing.blockedUntil = undefined;
      existing.count = 0;
      loginAttempts.set(key, existing);
      return existing;
    }

    return existing;
  }

  const state: LoginAttemptState = { count: 0 };
  loginAttempts.set(key, state);
  return state;
}

export function getLoginRateLimitStatus(identifier: string, now = Date.now()) {
  const key = getLoginRateLimitKey(identifier);
  const state = loginAttempts.get(key);

  if (!state) {
    return { blocked: false, remainingAttempts: MAX_LOGIN_ATTEMPTS, retryAfterSeconds: 0 };
  }

  if (state.blockedUntil && state.blockedUntil > now) {
    return {
      blocked: true,
      remainingAttempts: 0,
      retryAfterSeconds: Math.ceil((state.blockedUntil - now) / 1000),
    };
  }

  if (state.blockedUntil && state.blockedUntil <= now) {
    state.blockedUntil = undefined;
    state.count = 0;
  }

  return {
    blocked: false,
    remainingAttempts: Math.max(0, MAX_LOGIN_ATTEMPTS - state.count),
    retryAfterSeconds: 0,
  };
}

export function recordFailedLogin(identifier: string, now = Date.now()) {
  const key = getLoginRateLimitKey(identifier);
  const state = getOrCreateState(key, now);

  if (state.blockedUntil && state.blockedUntil > now) {
    return getLoginRateLimitStatus(key, now);
  }

  state.count += 1;
  if (state.count >= MAX_LOGIN_ATTEMPTS) {
    state.blockedUntil = now + LOGIN_ATTEMPT_WINDOW_MS;
  }

  return getLoginRateLimitStatus(key, now);
}

export function recordSuccessfulLogin(identifier: string) {
  loginAttempts.delete(getLoginRateLimitKey(identifier));
}

export function isLoginRateLimited(identifier: string, now = Date.now()) {
  return getLoginRateLimitStatus(identifier, now).blocked;
}
