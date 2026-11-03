const requestCounts = new Map<string, { count: number; timestamp: number }>();

export async function checkRateLimit(ip: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  const record = requestCounts.get(ip);
  
  if (!record || now - record.timestamp > windowMs) {
    requestCounts.set(ip, { count: 1, timestamp: now });
    return true; // OK
  }
  
  if (record.count >= limit) {
    return false; // Rate Limited
  }
  
  record.count += 1;
  return true; // OK
}
