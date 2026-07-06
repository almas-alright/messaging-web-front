import { type AppConfig, loadAppConfig } from "./env";

const storageKey = "messaging-web-front:config";

export function loadStoredConfig(): AppConfig {
  const fallback = loadAppConfig();
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as Partial<AppConfig>;
    return {
      apiBaseUrl: parsed.apiBaseUrl?.trim() || fallback.apiBaseUrl,
      wsBaseUrl: parsed.wsBaseUrl?.trim() || fallback.wsBaseUrl,
    };
  } catch {
    return fallback;
  }
}

export function saveStoredConfig(config: AppConfig) {
  window.localStorage.setItem(storageKey, JSON.stringify(config));
}
