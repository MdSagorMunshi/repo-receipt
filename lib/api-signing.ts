import { createHmac, timingSafeEqual } from "node:crypto";

import type { CompareRepoRef } from "@/lib/compare-routes";
import { getReceiptFormat } from "@/lib/receipt-formats";
import { getReceiptMode } from "@/lib/receipt-modes";
import type { ReceiptFormat, ReceiptMode } from "@/lib/types";

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

function buildPayload(owner: string, repo: string, expiresAt: number, mode: ReceiptMode, format: ReceiptFormat) {
  return `${owner}/${repo}:${expiresAt}:${mode}:${format}`;
}

function buildComparePayload(
  left: CompareRepoRef,
  right: CompareRepoRef,
  expiresAt: number,
  mode: ReceiptMode,
  format: ReceiptFormat,
) {
  return `${left.owner}/${left.repo}:${right.owner}/${right.repo}:${expiresAt}:${mode}:${format}`;
}

export function createProtectedReceiptPath(
  owner: string,
  repo: string,
  mode: ReceiptMode = "fine-print",
  format: ReceiptFormat = "portrait",
  ttlSeconds = DEFAULT_TTL_SECONDS,
) {
  const secret = getSigningSecret();
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const resolvedMode = getReceiptMode(mode);
  const resolvedFormat = getReceiptFormat(format);

  if (!secret) {
    const base = `/api/generate/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
    const search = new URLSearchParams();

    if (resolvedMode !== "fine-print") {
      search.set("mode", resolvedMode);
    }

    if (resolvedFormat !== "portrait") {
      search.set("format", resolvedFormat);
    }

    const query = search.toString();
    return query ? `${base}?${query}` : base;
  }

  const signature = signValue(buildPayload(owner, repo, expiresAt, resolvedMode, resolvedFormat), secret);
  const query = new URLSearchParams({
    expires: String(expiresAt),
    sig: signature,
  });

  if (resolvedMode !== "fine-print") {
    query.set("mode", resolvedMode);
  }

  if (resolvedFormat !== "portrait") {
    query.set("format", resolvedFormat);
  }

  return `/api/receipt/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}?${query.toString()}`;
}

export function verifyProtectedReceiptSignature(
  owner: string,
  repo: string,
  expires: string | null,
  signature: string | null,
  mode: string | null,
  format: string | null,
) {
  const secret = getSigningSecret();

  if (!secret || !expires || !signature) {
    return false;
  }

  const expiresAt = Number(expires);

  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expected = signValue(
    buildPayload(owner, repo, expiresAt, getReceiptMode(mode), getReceiptFormat(format)),
    secret,
  );
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

export function createProtectedComparePath(
  left: CompareRepoRef,
  right: CompareRepoRef,
  mode: ReceiptMode = "fine-print",
  format: ReceiptFormat = "portrait",
  ttlSeconds = DEFAULT_TTL_SECONDS,
) {
  const secret = getSigningSecret();
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const resolvedMode = getReceiptMode(mode);
  const resolvedFormat = getReceiptFormat(format);

  const query = new URLSearchParams({
    left: `${left.owner}/${left.repo}`,
    right: `${right.owner}/${right.repo}`,
  });

  if (!secret) {
    if (resolvedMode !== "fine-print") {
      query.set("mode", resolvedMode);
    }

    if (resolvedFormat !== "portrait") {
      query.set("format", resolvedFormat);
    }

    return `/api/compare?${query.toString()}`;
  }

  const signature = signValue(buildComparePayload(left, right, expiresAt, resolvedMode, resolvedFormat), secret);
  query.set("expires", String(expiresAt));
  query.set("sig", signature);

  if (resolvedMode !== "fine-print") {
    query.set("mode", resolvedMode);
  }

  if (resolvedFormat !== "portrait") {
    query.set("format", resolvedFormat);
  }

  return `/api/compare/download?${query.toString()}`;
}

export function verifyProtectedCompareSignature(
  left: CompareRepoRef,
  right: CompareRepoRef,
  expires: string | null,
  signature: string | null,
  mode: string | null,
  format: string | null,
) {
  const secret = getSigningSecret();

  if (!secret || !expires || !signature) {
    return false;
  }

  const expiresAt = Number(expires);

  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expected = signValue(
    buildComparePayload(left, right, expiresAt, getReceiptMode(mode), getReceiptFormat(format)),
    secret,
  );
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}
