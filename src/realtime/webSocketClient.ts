import type { AppConfig } from "../config/env";

export type WebSocketClientConfig = Pick<AppConfig, "wsBaseUrl">;

export type ServerEvent =
  | ConnectionReadyEvent
  | ConversationJoinedEvent
  | ConversationMessagesEvent
  | MessageCreatedEvent
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
  onClose?: () => void;
  onError?: () => void;
};

export function buildWebSocketUrl(config: WebSocketClientConfig, token: string) {
  const url = new URL(config.wsBaseUrl);
  url.searchParams.set("token", token);
  return url.toString();
}

export function createMessagingWebSocket(
  config: WebSocketClientConfig,
  token: string,
  handlers: MessagingWebSocketHandlers = {},
): MessagingWebSocket {
  let socket: WebSocket | null = null;

  return {
    connect() {
      socket = new WebSocket(buildWebSocketUrl(config, token));
      socket.addEventListener("open", () => handlers.onOpen?.());
      socket.addEventListener("close", () => handlers.onClose?.());
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
