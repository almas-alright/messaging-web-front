/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_WS_BASE_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_GITHUB_CLIENT_ID?: string;
  readonly VITE_MESSAGING_API_BASE_URL?: string;
  readonly VITE_MESSAGING_WS_URL?: string;
  readonly VITE_SUPPORT_WIDGET_TENANT_ID?: string;
  readonly VITE_SUPPORT_WIDGET_BRAND_NAME?: string;
  readonly VITE_SUPPORT_WIDGET_THEME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
