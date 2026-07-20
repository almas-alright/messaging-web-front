import type { AppConfig } from "../config/env";

export type WebSocketClientConfig = Pick<AppConfig, "wsBaseUrl">;

export type ServerEvent =
  | ConnectionReadyEvent
  | ConversationJoinedEvent
  | ConversationMessagesEvent
  | MessageCreatedEvent
  | MessageReceiptEvent
  | TypingEvent
  | ErrorEvent
  | UnknownServerEvent;

export type ConnectionReadyEvent = {
  type: "connection.ready";
  user_id: string;
};

export type ConversationJoinedEvent = {
  type: "conversation.joined";
  conversation_id: string;
  user_id: string;
};

export type ConversationMessagesEvent = {
  type: "conversation.messages";
  conversation_id: string;
  messages: MessageCreatedEvent[];
};

export type MessageCreatedEvent = {
  type: "message.created";
  conversation_id: string;
  message_id: string;
  client_message_id?: string;
  message_type: "text" | "file" | "system";
  policy_status: "clean" | "flagged" | "blocked";
  sender_id: string;
  body: string;
  attachment_id?: string;
  created_at?: string;
};

export type MessageReceiptEvent = {
  type: "message.delivered" | "message.seen";
  conversation_id: string;
  message_id: string;
  user_id: string;
  status: "delivered" | "seen";
  updated_at?: string;
};

export type TypingEvent = {
  type: "typing.start" | "typing.stop";
  conversation_id: string;
};

export type ErrorEvent = {
  type: "error";
  error: string;
  conversation_id?: string;
};

export type UnknownServerEvent = {
  type: string;
  [key: string]: unknown;
};

export type ClientEvent = {
  type: string;
  conversation_id?: string;
  client_message_id?: string;
  body?: string;
  attachment_id?: string;
};

export type MessagingWebSocket = {
  connect: () => WebSocket;
  disconnect: () => void;
  send: (event: ClientEvent) => void;
};

export type MessagingWebSocketHandlers = {
  onOpen?: () => void;
  onMessage?: (event: ServerEvent) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: () => void;
};

export function buildWebSocketUrl(
  config: WebSocketClientConfig,
  accessToken: string,
) {
  const url = new URL(config.wsBaseUrl);
  url.searchParams.set("token", accessToken.trim());
  return url.toString();
}

export function createMessagingWebSocket(
  config: WebSocketClientConfig,
  accessToken: string,
  handlers: MessagingWebSocketHandlers = {},
): MessagingWebSocket {
  let socket: WebSocket | null = null;

  return {
    connect() {
      if (!accessToken.trim()) {
        throw new Error("A messaging access token is required");
      }
      socket = new WebSocket(buildWebSocketUrl(config, accessToken));
      socket.addEventListener("open", () => handlers.onOpen?.());
      socket.addEventListener("close", (event) => handlers.onClose?.(event));
      socket.addEventListener("error", () => handlers.onError?.());
      socket.addEventListener("message", (event) => {
        handlers.onMessage?.(parseServerEvent(event.data));
      });
      return socket;
    },
    disconnect() {
      socket?.close();
      socket = null;
    },
    send(event: ClientEvent) {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        throw new Error("WebSocket is not connected");
      }
      socket.send(JSON.stringify(event));
    },
  };
}

function parseServerEvent(data: string) {
  return JSON.parse(data) as ServerEvent;
}
