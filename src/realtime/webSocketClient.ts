import type { AppConfig } from "../config/env";

export type WebSocketClientConfig = Pick<AppConfig, "wsBaseUrl">;

export function buildWebSocketUrl(config: WebSocketClientConfig, token: string) {
  const url = new URL(config.wsBaseUrl);
  url.searchParams.set("token", token);
  return url.toString();
}
