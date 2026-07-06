import type { AppConfig } from "../config/env";

export type HttpClient = {
  config: AppConfig;
  getHealth: () => Promise<BackendCheckResponse>;
  getReady: () => Promise<BackendCheckResponse>;
};

export type BackendCheckResponse = {
  status: string;
  service: string;
};

export function createHttpClient(config: AppConfig): HttpClient {
  return {
    config,
    getHealth: () => getBackendCheck(config.apiBaseUrl, "/health"),
    getReady: () => getBackendCheck(config.apiBaseUrl, "/ready"),
  };
}

async function getBackendCheck(apiBaseUrl: string, path: string) {
  const response = await fetch(`${apiBaseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
  return response.json() as Promise<BackendCheckResponse>;
}
