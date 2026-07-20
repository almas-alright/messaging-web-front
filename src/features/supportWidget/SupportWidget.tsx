import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  createSupportApiClient,
  SupportApiError,
} from "./apiClient";
import type { SupportWidgetConfig } from "./config";
import {
  clearSupportVisitorSession,
  isSupportVisitorSessionExpired,
  loadSupportVisitorSession,
  saveSupportVisitorSession,
  type SupportVisitorSession,
} from "./visitorSessionStorage";
import {
  type ConversationMessagesEvent,
  type MessageCreatedEvent,
  type MessagingWebSocket,
  type ServerEvent,
} from "../../realtime/webSocketClient";
import { createSupportVisitorWebSocket } from "./visitorWebSocket";
import "./supportWidget.css";

export type SupportWidgetState =
  | "collapsed"
  | "opening"
  | "open"
  | "minimized";

type SupportWidgetProps = {
  config: SupportWidgetConfig;
};

type SupportMessage = {
  id: string;
  clientMessageId?: string;
  body: string;
  sender: "visitor" | "agent";
  status?: "sending" | "sent" | "failed";
  createdAt: string;
};

export function SupportWidget({ config }: SupportWidgetProps) {
  const [state, setState] = useState<SupportWidgetState>("collapsed");
  const [email, setEmail] = useState("");
  const [visitorSession, setVisitorSession] =
    useState<SupportVisitorSession | null>(null);
  const [startStatus, setStartStatus] = useState<{
    state: "idle" | "submitting" | "success" | "error";
    message: string;
  }>({ state: "idle", message: "" });
  const openingTimerRef = useRef<number | null>(null);
  const webSocketRef = useRef<MessagingWebSocket | null>(null);
  const readyUserIdRef = useRef<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<{
    state: "idle" | "connecting" | "joined" | "disconnected" | "error";
    message: string;
  }>({ state: "idle", message: "Start a conversation to connect." });
  const panelId = "support-widget-panel";

  useEffect(() => {
    return () => {
      if (openingTimerRef.current !== null) {
        window.clearTimeout(openingTimerRef.current);
      }
      webSocketRef.current?.disconnect();
      webSocketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!visitorSession) return;
    connectVisitorSocket(visitorSession);
    return () => {
      webSocketRef.current?.disconnect();
      webSocketRef.current = null;
    };
  }, [visitorSession?.sessionId]);

  useEffect(() => {
    if (!visitorSession) return;
    const expiryTimer = window.setInterval(() => {
      if (isSupportVisitorSessionExpired(visitorSession)) {
        resetVisitorSession(
          "Your support session ended. Start a new conversation.",
        );
      }
    }, 30_000);
    return () => window.clearInterval(expiryTimer);
  }, [visitorSession?.sessionId]);

  function openWidget() {
    if (openingTimerRef.current !== null) {
      window.clearTimeout(openingTimerRef.current);
    }
    if (!visitorSession) {
      const restoredSession = loadSupportVisitorSession(config.tenantId);
      if (restoredSession) {
        setVisitorSession(restoredSession);
        setStartStatus({
          state: "success",
          message: "Your support conversation was restored.",
        });
      }
    }
    setState("opening");
    openingTimerRef.current = window.setTimeout(() => {
      setState("open");
      openingTimerRef.current = null;
    }, 180);
  }

  function collapseWidget() {
    if (openingTimerRef.current !== null) {
      window.clearTimeout(openingTimerRef.current);
      openingTimerRef.current = null;
    }
    setState("collapsed");
  }

  function resetVisitorSession(message = "Start a new support conversation.") {
    const socket = webSocketRef.current;
    webSocketRef.current = null;
    socket?.disconnect();
    clearSupportVisitorSession(config.tenantId);
    readyUserIdRef.current = null;
    setVisitorSession(null);
    setMessages([]);
    setMessageDraft("");
    setConnectionStatus({
      state: "idle",
      message: "Start a conversation to connect.",
    });
    setStartStatus({ state: "idle", message });
  }

  async function handleWelcomeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!config.tenantId) {
      setStartStatus({
        state: "error",
        message: "Support is not configured for this page.",
      });
      return;
    }

    setStartStatus({ state: "submitting", message: "Starting support…" });
    try {
      const response = await createSupportApiClient(config).startSession({
        tenant_id: config.tenantId,
        email: email.trim(),
      });
      const session = saveSupportVisitorSession(config.tenantId, response);
      setVisitorSession(session);
      setEmail("");
      setStartStatus({
        state: "success",
        message: "Your support conversation is ready.",
      });
    } catch (error) {
      setStartStatus({
        state: "error",
        message: friendlyStartError(error),
      });
    }
  }

  function connectVisitorSocket(session: SupportVisitorSession) {
    if (isSupportVisitorSessionExpired(session)) {
      resetVisitorSession("Your support session ended. Start a new conversation.");
      return;
    }
    webSocketRef.current?.disconnect();
    readyUserIdRef.current = null;
    setConnectionStatus({ state: "connecting", message: "Connecting…" });

    let socket: MessagingWebSocket;
    socket = createSupportVisitorWebSocket(config, session.accessToken, {
      onOpen: () =>
        setConnectionStatus({
          state: "connecting",
          message: "Connected. Waiting for support…",
        }),
      onMessage: (event) => handleVisitorSocketMessage(event, session, socket),
      onClose: () => {
        if (webSocketRef.current !== socket) return;
        webSocketRef.current = null;
        if (isSupportVisitorSessionExpired(session)) {
          resetVisitorSession(
            "Your support session ended. Start a new conversation.",
          );
          return;
        }
        setConnectionStatus({ state: "disconnected", message: "Disconnected." });
      },
      onError: () =>
        setConnectionStatus({
          state: "error",
          message: "Live support is unavailable right now.",
        }),
    });
    webSocketRef.current = socket;
    try {
      socket.connect();
    } catch {
      webSocketRef.current = null;
      setConnectionStatus({
        state: "error",
        message: "Live support is unavailable right now.",
      });
    }
  }

  function handleVisitorSocketMessage(
    event: ServerEvent,
    session: SupportVisitorSession,
    socket: MessagingWebSocket,
  ) {
    if (event.type === "connection.ready" && "user_id" in event) {
      readyUserIdRef.current = String(event.user_id);
      try {
        socket.send({
          type: "conversation.join",
          conversation_id: session.conversationId,
        });
        setConnectionStatus({
          state: "connecting",
          message: "Joining your support conversation…",
        });
      } catch {
        setConnectionStatus({
          state: "error",
          message: "Could not join the support conversation.",
        });
      }
      return;
    }

    if (
      event.type === "conversation.joined" &&
      "conversation_id" in event &&
      event.conversation_id === session.conversationId
    ) {
      setConnectionStatus({ state: "joined", message: "Support is connected." });
      return;
    }

    if (
      isSupportMessageEvent(event) &&
      event.conversation_id === session.conversationId
    ) {
      setMessages((current) =>
        upsertSupportMessage(current, event, readyUserIdRef.current),
      );
      return;
    }

    if (
      isSupportHistoryEvent(event) &&
      event.conversation_id === session.conversationId &&
      Array.isArray(event.messages)
    ) {
      setMessages((current) =>
        event.messages.reduce(
          (next, message) =>
            isSupportMessageEvent(message)
              ? upsertSupportMessage(next, message, readyUserIdRef.current)
              : next,
          current,
        ),
      );
      return;
    }

    if (event.type === "error") {
      if (isVisitorSessionAuthError(event)) {
        resetVisitorSession(
          "Your support session ended. Start a new conversation.",
        );
        return;
      }
      if (
        "client_message_id" in event &&
        typeof event.client_message_id === "string"
      ) {
        setMessages((current) =>
          current.map((message) =>
            message.clientMessageId === event.client_message_id
              ? { ...message, status: "failed" }
              : message,
          ),
        );
      }
      setConnectionStatus({
        state: "error",
        message: "The support conversation encountered an error.",
      });
    }
  }

  function handleMessageSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = messageDraft.trim();
    const socket = webSocketRef.current;
    if (!visitorSession || !body || !socket) return;

    const clientMessageId = createClientMessageId();
    const optimisticMessage: SupportMessage = {
      id: clientMessageId,
      clientMessageId,
      body,
      sender: "visitor",
      status: "sending",
      createdAt: new Date().toISOString(),
    };
    setMessages((current) => [...current, optimisticMessage]);
    try {
      socket.send({
        type: "message.send",
        conversation_id: visitorSession.conversationId,
        client_message_id: clientMessageId,
        body,
      });
      setMessageDraft("");
    } catch {
      setMessages((current) =>
        current.map((message) =>
          message.id === clientMessageId
            ? { ...message, status: "failed" }
            : message,
        ),
      );
    }
  }

  if (state === "collapsed") {
    return (
      <button
        className="support-widget-launcher"
        type="button"
        aria-controls={panelId}
        aria-expanded="false"
        onClick={openWidget}
        data-theme={config.theme}
      >
        <span aria-hidden="true">?</span>
        <strong>{config.brandName}</strong>
      </button>
    );
  }

  if (state === "minimized") {
    return (
      <div className="support-widget-minimized" data-theme={config.theme}>
        <button type="button" onClick={openWidget} aria-controls={panelId}>
          Open {config.brandName}
        </button>
        <button
          className="support-widget-icon-button"
          type="button"
          onClick={collapseWidget}
          aria-label="Close support"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <section
      className="support-widget-panel"
      id={panelId}
      role="dialog"
      aria-label={`${config.brandName} chat`}
      data-state={state}
      data-theme={config.theme}
    >
      <header className="support-widget-header">
        <div>
          <span className="support-widget-presence" aria-hidden="true" />
          <div>
            <strong>{config.brandName}</strong>
            <span>We are here to help</span>
          </div>
        </div>
        <div className="support-widget-header__actions">
          <button
            className="support-widget-icon-button"
            type="button"
            onClick={() => setState("minimized")}
            aria-label="Minimize support"
          >
            −
          </button>
          <button
            className="support-widget-icon-button"
            type="button"
            onClick={collapseWidget}
            aria-label="Close support"
          >
            ×
          </button>
        </div>
      </header>

      <div className="support-widget-body">
        {visitorSession ? (
          <div className="support-widget-conversation">
            <div className="support-widget-conversation__status">
              <p
                className={`support-widget-connection support-widget-connection--${connectionStatus.state}`}
                role={connectionStatus.state === "error" ? "alert" : "status"}
              >
                {connectionStatus.message}
              </p>
              <button type="button" onClick={() => resetVisitorSession()}>
                New conversation
              </button>
            </div>
            <div className="support-widget-messages" aria-live="polite">
              {messages.length ? (
                messages.map((message) => (
                  <article
                    className={`support-widget-message support-widget-message--${message.sender}`}
                    key={message.id}
                  >
                    <p>{message.body}</p>
                    <span>
                      {formatMessageTime(message.createdAt)}
                      {message.sender === "visitor" && message.status
                        ? ` · ${message.status}`
                        : ""}
                    </span>
                  </article>
                ))
              ) : (
                <div className="support-widget-welcome">
                  <span aria-hidden="true">✓</span>
                  <h2>Conversation started</h2>
                  <p>Send a message when live support connects.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <form
            className="support-widget-welcome-form"
            onSubmit={handleWelcomeSubmit}
          >
            <div className="support-widget-welcome">
              <span aria-hidden="true">?</span>
              <h2>How can we help?</h2>
              <p>Enter your email to start a private support conversation.</p>
            </div>
            <label>
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                disabled={startStatus.state === "submitting"}
              />
            </label>
            {startStatus.message ? (
              <p
                className={`support-widget-start-status support-widget-start-status--${startStatus.state}`}
                role={startStatus.state === "error" ? "alert" : "status"}
              >
                {startStatus.message}
              </p>
            ) : null}
            <button
              className="support-widget-start-button"
              type="submit"
              disabled={startStatus.state === "submitting"}
            >
              {startStatus.state === "submitting"
                ? "Starting…"
                : "Start conversation"}
            </button>
          </form>
        )}
      </div>

      <form className="support-widget-footer" onSubmit={handleMessageSubmit}>
        <input
          type="text"
          aria-label="Support message"
          placeholder="Type your message"
          value={messageDraft}
          onChange={(event) => setMessageDraft(event.target.value)}
          disabled={!visitorSession || connectionStatus.state !== "joined"}
        />
        <button
          type="submit"
          disabled={
            !visitorSession ||
            connectionStatus.state !== "joined" ||
            !messageDraft.trim()
          }
          aria-label="Send support message"
        >
          Send
        </button>
      </form>
    </section>
  );
}

function friendlyStartError(error: unknown) {
  if (error instanceof SupportApiError) {
    return error.message;
  }
  return "Support is temporarily unavailable. Please try again.";
}

function isSupportMessageEvent(event: ServerEvent): event is MessageCreatedEvent {
  return (
    event.type === "message.created" &&
    "message_id" in event &&
    typeof event.message_id === "string" &&
    "conversation_id" in event &&
    typeof event.conversation_id === "string" &&
    "sender_id" in event &&
    typeof event.sender_id === "string" &&
    "body" in event &&
    typeof event.body === "string"
  );
}

function isSupportHistoryEvent(
  event: ServerEvent,
): event is ConversationMessagesEvent {
  return (
    event.type === "conversation.messages" &&
    "conversation_id" in event &&
    typeof event.conversation_id === "string" &&
    "messages" in event &&
    Array.isArray(event.messages)
  );
}

function isVisitorSessionAuthError(event: ServerEvent) {
  if (event.type !== "error" || !("error" in event)) return false;
  return /unauthori[sz]ed|invalid token|expired|inactive session/i.test(
    String(event.error),
  );
}

function upsertSupportMessage(
  messages: SupportMessage[],
  event: MessageCreatedEvent,
  readyUserId: string | null,
) {
  const optimisticIndex = event.client_message_id
    ? messages.findIndex(
        (message) => message.clientMessageId === event.client_message_id,
      )
    : -1;
  const message: SupportMessage = {
    id: event.message_id,
    clientMessageId: event.client_message_id,
    body: event.body,
    sender:
      optimisticIndex >= 0 || event.sender_id === readyUserId
        ? "visitor"
        : "agent",
    status: optimisticIndex >= 0 ? "sent" : undefined,
    createdAt: event.created_at || new Date().toISOString(),
  };
  if (optimisticIndex >= 0) {
    return messages.map((current, index) =>
      index === optimisticIndex ? message : current,
    );
  }
  if (messages.some((current) => current.id === message.id)) return messages;
  return [...messages, message];
}

function createClientMessageId() {
  if (typeof window.crypto?.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `support-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatMessageTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
