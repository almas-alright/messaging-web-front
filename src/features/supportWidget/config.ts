import {
  loadAppConfig,
  type AppConfig,
} from "../../config/env";

export type SupportWidgetTheme = "light" | "dark";

export type SupportWidgetEmbedConfig = {
  tenantId: string;
  apiBaseUrl: string;
  wsUrl: string;
  brandName?: string;
  theme?: SupportWidgetTheme;
};

export type SupportWidgetConfig = {
  tenantId: string;
  apiBaseUrl: string;
  wsBaseUrl: string;
  brandName: string;
  theme: SupportWidgetTheme;
};

declare global {
  interface Window {
    MessagingSupportWidgetConfig?: SupportWidgetEmbedConfig;
  }
}

export function loadSupportWidgetConfig(
  env: ImportMetaEnv = import.meta.env,
  embedConfig: SupportWidgetEmbedConfig | undefined =
    typeof window === "undefined"
      ? undefined
      : window.MessagingSupportWidgetConfig,
): SupportWidgetConfig {
  const sharedConfig = loadAppConfig(env);
  return {
    tenantId:
      embedConfig?.tenantId?.trim() ||
      env.VITE_SUPPORT_WIDGET_TENANT_ID?.trim() ||
      "",
    apiBaseUrl: normalizeBaseUrl(
      embedConfig?.apiBaseUrl || env.VITE_MESSAGING_API_BASE_URL,
      sharedConfig.apiBaseUrl,
    ),
    wsBaseUrl: normalizeBaseUrl(
      embedConfig?.wsUrl || env.VITE_MESSAGING_WS_URL,
      sharedConfig.wsBaseUrl,
    ),
    brandName:
      embedConfig?.brandName?.trim() ||
      env.VITE_SUPPORT_WIDGET_BRAND_NAME?.trim() ||
      "Support",
    theme: normalizeTheme(
      embedConfig?.theme || env.VITE_SUPPORT_WIDGET_THEME,
    ),
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
