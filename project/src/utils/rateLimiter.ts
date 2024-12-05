interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

class RateLimiter {
  private attempts: Map<string, { count: number; firstAttempt: number }>;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.attempts = new Map();
    this.config = config;
  }

  isRateLimited(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt) {
      this.attempts.set(key, { count: 1, firstAttempt: now });
      return false;
    }

    if (now - attempt.firstAttempt >= this.config.windowMs) {
      this.attempts.set(key, { count: 1, firstAttempt: now });
      return false;
    }

    if (attempt.count >= this.config.maxAttempts) {
      return true;
    }

    attempt.count++;
    return false;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Configurações de rate limit para diferentes ações
export const loginRateLimiter = new RateLimiter({
  maxAttempts: 5, // 5 tentativas
  windowMs: 15 * 60 * 1000 // 15 minutos
});

export const signupRateLimiter = new RateLimiter({
  maxAttempts: 3, // 3 tentativas
  windowMs: 60 * 60 * 1000 // 1 hora
});

export const passwordResetRateLimiter = new RateLimiter({
  maxAttempts: 3, // 3 tentativas
  windowMs: 60 * 60 * 1000 // 1 hora
});
