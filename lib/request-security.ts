import { getSiteUrl } from "@/lib/site";

const CLI_USER_AGENT_PATTERN =
  /\b(curl|wget|httpie|python-requests|python-urllib|aiohttp|axios|node-fetch|undici|postmanruntime|insomnia|go-http-client|okhttp|java\/|libwww-perl)\b/i;

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();

    if (first) {
      return first;
    }
  }

  const direct =
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-vercel-forwarded-for");

  return direct?.trim() || "unknown";
}

export function getUserAgent(request: Request): string {
  return request.headers.get("user-agent")?.trim() || "";
}

export function isLikelyCliClient(request: Request): boolean {
  return CLI_USER_AGENT_PATTERN.test(getUserAgent(request));
}

export function isSameOriginRequest(request: Request): boolean {
  const siteUrl = getSiteUrl();
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const secFetchSite = request.headers.get("sec-fetch-site");

  if (origin && origin === siteUrl) {
    return true;
  }

  if (referer) {
    try {
      if (new URL(referer).origin === siteUrl) {
        return true;
      }
    } catch {
      return false;
    }
  }

  return secFetchSite === "same-origin" || secFetchSite === "same-site";
}

export function isAllowedProtectedClient(request: Request): boolean {
  if (isLikelyCliClient(request)) {
    return false;
  }

  return isSameOriginRequest(request);
}
