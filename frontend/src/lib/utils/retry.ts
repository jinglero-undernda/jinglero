/**
 * Retry utility with exponential backoff
 * 
 * Retries a function up to maxRetries times with exponential backoff delays.
 * Only retries on transient errors (network failures, 5xx status codes).
 * Does not retry on 4xx client errors.
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: unknown) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 8000, // 8 seconds
  shouldRetry: (error: unknown) => {
    // Retry on network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true;
    }
    
    // Retry on 5xx server errors
    if (error instanceof Error && (error as any).status) {
      const status = (error as any).status;
      return status >= 500 && status < 600;
    }
    
    // Don't retry on 4xx client errors
    if (error instanceof Error && (error as any).status) {
      const status = (error as any).status;
      if (status >= 400 && status < 500) {
        return false;
      }
    }
    
    // Retry on AbortError (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      return true;
    }
    
    // Default: don't retry
    return false;
  },
};

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - Function to retry (should return a Promise)
 * @param options - Retry options
 * @returns Promise that resolves with the function result or rejects after all retries fail
 * 
 * @example
 * ```ts
 * const result = await retryWithBackoff(
 *   () => fetch('/api/data'),
 *   { maxRetries: 3, initialDelay: 1000 }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if this is the last attempt
      if (attempt >= opts.maxRetries) {
        break;
      }
      
      // Check if we should retry this error
      if (!opts.shouldRetry(error)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(2, attempt),
        opts.maxDelay
      );
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // All retries exhausted, throw the last error
  throw lastError;
}

