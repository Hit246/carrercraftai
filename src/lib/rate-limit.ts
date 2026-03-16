const rateMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  ip: string,
  limit: number = 5,
  windowMs: number = 10 * 60 * 1000 // 10 minutes
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: limit - entry.count };
}