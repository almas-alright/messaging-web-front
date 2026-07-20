import {
  createMessagingWebSocket,
  type MessagingWebSocket,
  type MessagingWebSocketHandlers,
} from "../../realtime/webSocketClient";
import type { SupportWidgetConfig } from "./config";

export function createSupportVisitorWebSocket(
  config: Pick<SupportWidgetConfig, "wsBaseUrl">,
  visitorToken: string,
  handlers: MessagingWebSocketHandlers,
): MessagingWebSocket {
  return createMessagingWebSocket(
    { wsBaseUrl: supportVisitorWebSocketUrl(config.wsBaseUrl) },
    visitorToken,
    handlers,
  );
}

export function supportVisitorWebSocketUrl(wsBaseUrl: string) {
  const url = new URL(wsBaseUrl);
  if (!url.pathname.endsWith("/support/ws")) {
    url.pathname = url.pathname.endsWith("/ws")
      ? `${url.pathname.slice(0, -3)}/support/ws`
      : `${url.pathname.replace(/\/$/, "")}/support/ws`;
  }
  return url.toString();
}
