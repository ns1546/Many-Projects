/**
 * Media sanitization & resilient fallback utility.
 * Prevents ERR_CONNECTION_TIMED_OUT caused by expired or blocked Facebook CDN links (scontent.fbcdn.net).
 */
export function getSafeMediaUrl(
  url: string | null | undefined,
  fallback = "/images/vocal-processing-course.jpg"
): string {
  if (!url || typeof url !== "string" || !url.trim()) return fallback;
  const clean = url.trim();
  // Filter out expired or blocked Facebook CDN URLs that cause ERR_CONNECTION_TIMED_OUT
  if (clean.includes("fbcdn.net") || clean.includes("facebook.com/")) {
    return fallback;
  }
  return clean;
}
