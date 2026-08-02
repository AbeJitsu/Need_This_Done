const DEFAULT_AUTH_PATH = '/dashboard';

/**
 * Keep OAuth callbacks inside the application. Absolute URLs and protocol-
 * relative URLs are rejected to prevent an open redirect after sign-in.
 */
export function safeAuthNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return DEFAULT_AUTH_PATH;
  }

  return next;
}
