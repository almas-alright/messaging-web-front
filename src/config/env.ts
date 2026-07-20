export type AppConfig = {
  apiBaseUrl: string;
  wsBaseUrl: string;
};

export type AuthProviderConfig = {
  googleClientId?: string;
  githubClientId?: string;
};

export const defaultConfig: AppConfig = {
  apiBaseUrl: "http://localhost:8080",
  wsBaseUrl: "ws://localhost:8080/ws",
};

export function loadAppConfig(env: ImportMetaEnv = import.meta.env): AppConfig {
  return {
    apiBaseUrl: normalizeBaseUrl(env.VITE_API_BASE_URL, defaultConfig.apiBaseUrl),
    wsBaseUrl: normalizeBaseUrl(env.VITE_WS_BASE_URL, defaultConfig.wsBaseUrl),
  };
}

export function loadAuthProviderConfig(
  env: ImportMetaEnv = import.meta.env,
): AuthProviderConfig {
  return {
    googleClientId: normalizeOptionalValue(env.VITE_GOOGLE_CLIENT_ID),
    githubClientId: normalizeOptionalValue(env.VITE_GITHUB_CLIENT_ID),
  };
}

function normalizeBaseUrl(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return fallback;
  }
  return trimmed.replace(/\/$/, "");
}

function normalizeOptionalValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}
