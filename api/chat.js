// In-memory rate limit store (resets on server restart, good enough for Vercel)
const ipRequests = new Map();
const ipPlanCount = new Map();

function getIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    "unknown"
  );
}

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 30; // max 30 requests per minute per IP

  if (!ipRequests.has(ip)) {
    ipRequests.set(ip, []);
  }

  // Clean old requests outside window
  const requests = ipRequests.get(ip).filter(t => now - t < windowMs);
  ipRequests.set(ip, requests);

  if (requests.length >= maxRequests) {
    return true;
  }

  requests.push(now);
  return false;
}

function isPlanLimited(ip) {
  const now = Date.now();
  const windowMs = 30 * 24 * 60 * 60 * 1000; // 30 days

  if (!ipPlanCount.has(ip)) {
    ipPlanCount.set(ip, []);
  }

  // Clean old plan generations outside 30 day window
  const plans = ipPlanCount.get(ip).filter(t => now - t < windowMs);
  ipPlanCount.set(ip, plans);

  return plans.length >= 1; // max 1 free plan per IP per 30 days
}

function recordPlanGeneration(ip) {
  if (!ipPlanCount.has(ip)) {
    ipPlanCount.set(ip, []);
  }
  ipPlanCount.get(ip).push(Date.now());
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = getIP(req);

  // General rate limit — 30 requests per minute
  if (isRateLimited(ip)) {
    return res.status(429).json({
      error: { message: "Too many requests. Please wait a moment and try again." }
    });
  }

  try {
    const { messages, system, isPlanGeneration, isPro, isTranslation } = req.body;

    // Plan generation limit for free users
    if (isPlanGeneration && !isPro) {
      if (isPlanLimited(ip)) {
        return res.status(429).json({
          error: {
            message: "Free plan limit reached. You've already generated a free plan from this device in the last 30 days. Upgrade to Pro for unlimited plans.",
            code: "PLAN_LIMIT_REACHED"
          }
        });
      }
      recordPlanGeneration(ip);
    }

    const body = {
      model: "claude-sonnet-4-20250514",
      max_tokens: isTranslation ? 2000 : 1000,
      messages,
    };
    if (system) body.system = system;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.REACT_APP_ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: { message: error.message } });
  }
}
