import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_TTL_SECONDS = 5 * 60;
let warnedAboutSigningSecret = false;

function getSigningSecret() {
  const secret = process.env.API_SIGNING_SECRET?.trim();

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "repo-receipt-dev-signing-secret";
  }

  if (!warnedAboutSigningSecret) {
    console.warn("repo-receipt: API_SIGNING_SECRET is not set; protected receipt URLs are disabled.");
    warnedAboutSigningSecret = true;
  }

  return null;
}

function signValue(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function buildPayload(owner: string, repo: string, expiresAt: number) {
  return `${owner}/${repo}:${expiresAt}`;
}

export function createProtectedReceiptPath(owner: string, repo: string, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const secret = getSigningSecret();
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;

  if (!secret) {
    return `/api/generate/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  }

  const signature = signValue(buildPayload(owner, repo, expiresAt), secret);
  return `/api/receipt/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}?expires=${expiresAt}&sig=${signature}`;
}

export function verifyProtectedReceiptSignature(owner: string, repo: string, expires: string | null, signature: string | null) {
  const secret = getSigningSecret();

  if (!secret || !expires || !signature) {
    return false;
  }

  const expiresAt = Number(expires);

  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expected = signValue(buildPayload(owner, repo, expiresAt), secret);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}
