import type { AppConfig } from "../config/env";

export type HttpClient = {
  config: AppConfig;
  getHealth: () => Promise<BackendCheckResponse>;
  getReady: () => Promise<BackendCheckResponse>;
  getCurrentUser: (jwtToken: string) => Promise<CurrentUserResponse>;
};

export type BackendCheckResponse = {
  status: string;
  service: string;
};

export type CurrentUserResponse = {
  user_id: string;
  display_name: string;
  role: "buyer" | "seller" | "admin";
};

export function createHttpClient(config: AppConfig): HttpClient {
  return {
    config,
    getHealth: () => getBackendCheck(config.apiBaseUrl, "/health"),
    getReady: () => getBackendCheck(config.apiBaseUrl, "/ready"),
    getCurrentUser: (jwtToken: string) => getCurrentUser(config.apiBaseUrl, jwtToken),
  };
}

async function getBackendCheck(apiBaseUrl: string, path: string) {
  const response = await fetch(`${apiBaseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
  return response.json() as Promise<BackendCheckResponse>;
}

async function getCurrentUser(apiBaseUrl: string, jwtToken: string) {
  const response = await fetch(`${apiBaseUrl}/auth/me`, {
    headers: {
      Authorization: `Bearer ${jwtToken.trim()}`,
    },
  });
  if (!response.ok) {
    throw new Error(`/auth/me returned ${response.status}`);
  }
  return response.json() as Promise<CurrentUserResponse>;
}
