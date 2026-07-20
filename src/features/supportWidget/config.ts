import {
  loadAppConfig,
  type AppConfig,
} from "../../config/env";

export type SupportWidgetTheme = "light" | "dark";

export type SupportWidgetConfig = {
  tenantId: string;
  apiBaseUrl: string;
  wsBaseUrl: string;
  brandName: string;
  theme: SupportWidgetTheme;
};

export function loadSupportWidgetConfig(
  env: ImportMetaEnv = import.meta.env,
): SupportWidgetConfig {
  const sharedConfig = loadAppConfig(env);
  return {
    tenantId: env.VITE_SUPPORT_WIDGET_TENANT_ID?.trim() ?? "",
    apiBaseUrl: normalizeBaseUrl(
      env.VITE_MESSAGING_API_BASE_URL,
      sharedConfig.apiBaseUrl,
    ),
    wsBaseUrl: normalizeBaseUrl(
      env.VITE_MESSAGING_WS_URL,
      sharedConfig.wsBaseUrl,
    ),
    brandName: env.VITE_SUPPORT_WIDGET_BRAND_NAME?.trim() || "Support",
    theme: normalizeTheme(env.VITE_SUPPORT_WIDGET_THEME),
  };
}

export function supportWidgetClientConfig(
  config: SupportWidgetConfig,
): AppConfig {
  return {
    apiBaseUrl: config.apiBaseUrl,
    wsBaseUrl: config.wsBaseUrl,
  };
}

export function isSupportWidgetConfigured(config: SupportWidgetConfig) {
  return Boolean(
    config.tenantId && config.apiBaseUrl && config.wsBaseUrl,
  );
}

function normalizeBaseUrl(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  return (trimmed || fallback).replace(/\/$/, "");
}

function normalizeTheme(value: string | undefined): SupportWidgetTheme {
  return value?.trim().toLowerCase() === "dark" ? "dark" : "light";
}
