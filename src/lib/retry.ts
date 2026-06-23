export interface RetryOptions {
  retries?: number;
  delayMs?: number;
  onRetry?: (attempt: number, maxAttempts: number) => void;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { retries = 3, delayMs = 5000, onRetry } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isLastAttempt = attempt === retries;
      if (isLastAttempt) break;
      onRetry?.(attempt + 1, retries);
      await sleep(delayMs);
    }
  }

  throw lastError;
}