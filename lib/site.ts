const DEFAULT_APP_NAME = "repo-receipt";
const DEFAULT_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(input: string | undefined) {
  if (!input) {
    return DEFAULT_SITE_URL;
  }

  const trimmed = input.trim();

  if (!trimmed) {
    return DEFAULT_SITE_URL;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/g, "");
  }

  return `https://${trimmed.replace(/\/+$/g, "")}`;
}

export function getAppName() {
  return process.env.NEXT_PUBLIC_APP_NAME?.trim() || DEFAULT_APP_NAME;
}

export function getSiteUrl() {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
}

export function getSiteHost() {
  try {
    return new URL(getSiteUrl()).host;
  } catch {
    return DEFAULT_APP_NAME;
  }
}

export function getMetadataBase() {
  try {
    return new URL(getSiteUrl());
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export function getThemeStorageKey() {
  return `${getAppName().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-theme`;
}
