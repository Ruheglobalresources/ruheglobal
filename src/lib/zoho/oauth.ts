export type ZohoDc = "com" | "eu";

export function zohoBase(dc: ZohoDc) {
  return `https://www.zohoapis.${dc}`;
}

export function zohoAccountsBase(dc: ZohoDc) {
  return `https://accounts.zoho.${dc}`;
}

// Which Zoho data centre the CRM account lives in. Defaults to "com".
export function zohoDc(): ZohoDc {
  return process.env.ZOHO_DC === "eu" ? "eu" : "com";
}

export class ZohoOAuthError extends Error {
  constructor(message: string, public retryable: boolean, public status?: number) {
    super(message);
  }
}

export class ZohoTokenManager {
  private cachedToken: { accessToken: string; expiresAt: number } | null = null;

  constructor(
    private clientId: string,
    private clientSecret: string,
    private refreshToken: string,
    public readonly dc: ZohoDc = "com",
  ) {}

  async accessToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && this.cachedToken.expiresAt > now + 60000) {
      return this.cachedToken.accessToken;
    }

    const body = new URLSearchParams({
      refresh_token: this.refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: "refresh_token",
    });

    const res = await fetch(`${zohoAccountsBase(this.dc)}/oauth/v2/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(10_000),
    });

    const data = (await res.json()) as { access_token?: string; expires_in?: number; error?: string };
    if (!res.ok || !data.access_token) {
      throw new ZohoOAuthError(
        `Zoho token refresh failed: ${data.error ?? res.status}`,
        res.status === 429 || res.status >= 500,
        res.status,
      );
    }

    this.cachedToken = {
      accessToken: data.access_token,
      expiresAt: now + Math.max(60, data.expires_in ?? 3600) * 1000,
    };
    return this.cachedToken.accessToken;
  }

  async request<T>(url: string, init: RequestInit): Promise<T> {
    const token = await this.accessToken();
    const res = await fetch(url, {
      ...init,
      headers: { ...init.headers, authorization: `Zoho-oauthtoken ${token}` },
      signal: AbortSignal.timeout(10_000),
    });

    const text = res.status === 204 ? "" : await res.text();
    let parsed: unknown = {};
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = {};
      }
    }

    if (!res.ok) {
      throw new ZohoOAuthError(
        `Zoho request failed with status ${res.status}: ${text.slice(0, 300)}`,
        res.status === 429 || res.status >= 500,
        res.status,
      );
    }
    return parsed as T;
  }
}