/**
 * Validate user-supplied AI provider base URLs.
 *
 * Used by API/Vite route layers to reduce SSRF risk:
 * - allow localhost URLs for local providers (ollama/lmstudio)
 * - allow HTTPS URLs on known cloud provider domains (exact or subdomain)
 */
export function isAllowedAIBaseUrl(baseUrl: string): boolean {
  try {
    const parsed = new URL(baseUrl);
    if (!parsed.protocol || (parsed.protocol !== "http:" && parsed.protocol !== "https:")) {
      return false;
    }

    const host = parsed.hostname.toLowerCase();

    if (isLoopbackHost(host)) {
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    }

    if (parsed.protocol !== "https:") {
      return false;
    }

    return (
      matchesHostOrSubdomain(host, "openai.com") ||
      matchesHostOrSubdomain(host, "anthropic.com") ||
      matchesHostOrSubdomain(host, "openrouter.ai") ||
      matchesHostOrSubdomain(host, "groq.com") ||
      matchesHostOrSubdomain(host, "googleapis.com") ||
      matchesHostOrSubdomain(host, "mistral.ai") ||
      matchesHostOrSubdomain(host, "deepseek.com") ||
      matchesHostOrSubdomain(host, "dashscope.aliyuncs.com") ||
      matchesHostOrSubdomain(host, "moonshot.cn") ||
      matchesHostOrSubdomain(host, "bigmodel.cn")
    );
  } catch {
    return false;
  }
}

export function assertAllowedAIBaseUrl(baseUrl: string): void {
  if (!isAllowedAIBaseUrl(baseUrl)) {
    throw new Error("Invalid AI provider baseUrl");
  }
}

function isLoopbackHost(host: string): boolean {
  const normalized = host.startsWith("[") && host.endsWith("]") ? host.slice(1, -1) : host;
  if (normalized === "localhost" || normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") {
    return true;
  }

  if (normalized.startsWith("::ffff:")) {
    return isLoopbackHost(normalized.slice("::ffff:".length));
  }

  const octets = normalized.split(".");
  return (
    octets.length === 4 &&
    octets[0] === "127" &&
    octets.every((octet) => /^\d{1,3}$/.test(octet) && Number(octet) <= 255)
  );
}

function matchesHostOrSubdomain(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}
