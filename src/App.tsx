import { useRef, useState } from "react";
import {
  createHttpClient,
  type AttachmentResponse,
  type CurrentUserResponse,
} from "./api/httpClient";
import {
  clearStoredJwt,
  loadStoredJwt,
  saveStoredJwt,
} from "./auth/demoAuthStorage";
import { AppShell } from "./components/AppShell";
import { SettingsPanel } from "./components/SettingsPanel";
import type { AppConfig } from "./config/env";
import { loadStoredConfig, saveStoredConfig } from "./config/storage";
import { ChatPanel } from "./features/chat/ChatPanel";
import {
  createMessagingWebSocket,
  type MessageCreatedEvent,
  type ServerEvent,
  type MessagingWebSocket,
} from "./realtime/webSocketClient";
import type { ChatMessage, ConnectionState } from "./types/chat";

type BackendStatus = {
  state: "idle" | "checking" | "ok" | "error";
  label: string;
};

type AuthStatus = {
  state: "idle" | "checking" | "ok" | "error";
  label: string;
};

type WebSocketStatus = {
  state: ConnectionState;
  label: string;
};

type UploadStatus = {
  state: "idle" | "uploading" | "uploaded" | "error";
  label: string;
};

export function App() {
  const webSocketRef = useRef<MessagingWebSocket | null>(null);
  const [config, setConfig] = useState<AppConfig>(() => loadStoredConfig());
  const [jwtToken, setJwtToken] = useState(() => loadStoredJwt());
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    state: "idle",
    label: "Not checked",
  });
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    state: "idle",
    label: "JWT not checked",
  });
  const [currentUser, setCurrentUser] = useState<CurrentUserResponse | null>(
    null,
  );
  const [webSocketStatus, setWebSocketStatus] = useState<WebSocketStatus>({
    state: "idle",
    label: "Not connected",
  });
  const [readyUserId, setReadyUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState("conv-001");
  const [joinedConversation, setJoinedConversation] = useState<{
    conversationId: string;
    userId: string;
  } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedAttachment, setUploadedAttachment] =
    useState<AttachmentResponse | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    state: "idle",
    label: "No file uploaded",
  });
  const [composerNotice, setComposerNotice] = useState<string | null>(null);

  function handleConfigChange(nextConfig: AppConfig) {
    setConfig(nextConfig);
    saveStoredConfig(nextConfig);
  }

  function handleJwtTokenChange(nextToken: string) {
    setJwtToken(nextToken);
    saveStoredJwt(nextToken);
  }

  function handleJwtClear() {
    setJwtToken("");
    setCurrentUser(null);
    setAuthStatus({ state: "idle", label: "JWT cleared" });
    clearStoredJwt();
  }

  function handleSelectedFileChange(file: File | null) {
    setSelectedFile(file);
    setUploadedAttachment(null);
    setUploadStatus({
      state: "idle",
      label: file ? "File ready to upload" : "No file uploaded",
    });
  }

  async function handleHealthCheck() {
    await runBackendCheck("Health", () => createHttpClient(config).getHealth());
  }

  async function handleReadyCheck() {
    await runBackendCheck("Ready", () => createHttpClient(config).getReady());
  }

  async function handleCurrentUserCheck() {
    setAuthStatus({ state: "checking", label: "Checking JWT" });
    setCurrentUser(null);
    try {
      const user = await createHttpClient(config).getCurrentUser(jwtToken);
      setCurrentUser(user);
      setAuthStatus({ state: "ok", label: "JWT accepted" });
    } catch (error) {
      setAuthStatus({
        state: "error",
        label:
          error instanceof Error ? error.message : "Current user check failed",
      });
    }
  }

  function handleWebSocketConnect() {
    setWebSocketStatus({ state: "connecting", label: "Connecting" });
    setReadyUserId(null);
    setJoinedConversation(null);
    setMessages([]);
    setComposerNotice(null);
    webSocketRef.current?.disconnect();
    const client = createMessagingWebSocket(config, jwtToken, {
      onOpen: () => setWebSocketStatus({ state: "connected", label: "Open" }),
      onMessage: handleWebSocketMessage,
      onClose: () =>
        setWebSocketStatus({ state: "idle", label: "Disconnected" }),
      onError: () =>
        setWebSocketStatus({ state: "error", label: "Connection error" }),
    });
    webSocketRef.current = client;
    client.connect();
  }

  function handleWebSocketReconnect() {
    handleWebSocketConnect();
  }

  function handleWebSocketDisconnect() {
    webSocketRef.current?.disconnect();
    webSocketRef.current = null;
    setReadyUserId(null);
    setJoinedConversation(null);
    setMessages([]);
    setComposerNotice(null);
    setWebSocketStatus({ state: "idle", label: "Disconnected" });
  }

  function handleWebSocketMessage(event: ServerEvent) {
    if (
      event.type === "connection.ready" &&
      "user_id" in event &&
      typeof event.user_id === "string"
    ) {
      setReadyUserId(event.user_id);
      setWebSocketStatus({
        state: "connected",
        label: `Ready as ${event.user_id}`,
      });
      return;
    }
    if (
      event.type === "conversation.joined" &&
      "conversation_id" in event &&
      typeof event.conversation_id === "string" &&
      "user_id" in event &&
      typeof event.user_id === "string"
    ) {
      setJoinedConversation({
        conversationId: event.conversation_id,
        userId: event.user_id,
      });
      return;
    }
    if (
      event.type === "conversation.messages" &&
      "messages" in event &&
      Array.isArray(event.messages)
    ) {
      setMessages(event.messages.map(messageFromServer));
      setComposerNotice(null);
      return;
    }
    if (
      event.type === "message.created" &&
      isMessageCreatedEvent(event)
    ) {
      setMessages((currentMessages) =>
        appendMessageIfNew(currentMessages, messageFromServer(event)),
      );
      setComposerNotice(null);
    }
  }

  function messageFromServer(event: {
    message_id: string;
    conversation_id: string;
    sender_id: string;
    body: string;
    created_at: string;
    attachment_id?: string;
  }): ChatMessage {
    return {
      id: event.message_id,
      conversationId: event.conversation_id,
      senderId: event.sender_id,
      body: event.body,
      createdAt: event.created_at,
      attachmentId: event.attachment_id,
    };
  }

  function handleConversationJoin() {
    webSocketRef.current?.send({
      type: "conversation.join",
      conversation_id: conversationId.trim(),
    });
  }

  function handleConversationHistory() {
    if (!joinedConversation) {
      return;
    }
    webSocketRef.current?.send({
      type: "conversation.history",
      conversation_id: joinedConversation.conversationId,
    });
  }

  function handleMessageSend() {
    const body = messageDraft.trim();
    const attachment = uploadedAttachment;

    if (!joinedConversation || (!body && !attachment)) {
      return;
    }

    try {
      webSocketRef.current?.send({
        type: "message.send",
        conversation_id: joinedConversation.conversationId,
        client_message_id: createClientMessageId(),
        body: body || undefined,
        attachment_id: attachment?.id,
      });
      setMessageDraft("");
      if (attachment) {
        setSelectedFile(null);
        setUploadedAttachment(null);
        setUploadStatus({ state: "idle", label: "No file uploaded" });
      }
      setComposerNotice("Message sent. Waiting for server event.");
    } catch (error) {
      setComposerNotice(
        error instanceof Error ? error.message : "Message send failed",
      );
    }
  }

  async function handleFileUpload() {
    if (!selectedFile || !joinedConversation) {
      return;
    }

    setUploadStatus({ state: "uploading", label: "Uploading file" });
    setComposerNotice(null);

    try {
      const attachment = await createHttpClient(config).uploadAttachment(
        jwtToken,
        joinedConversation.conversationId,
        selectedFile,
      );
      setUploadedAttachment(attachment);
      setUploadStatus({
        state: "uploaded",
        label: `Uploaded ${attachment.original_name}`,
      });
    } catch (error) {
      setUploadedAttachment(null);
      setUploadStatus({
        state: "error",
        label: error instanceof Error ? error.message : "File upload failed",
      });
    }
  }

  async function runBackendCheck(
    label: string,
    check: () => Promise<{ status: string; service: string }>,
  ) {
    setBackendStatus({ state: "checking", label: `${label} check running` });
    try {
      const result = await check();
      setBackendStatus({
        state: "ok",
        label: `${label}: ${result.service} is ${result.status}`,
      });
    } catch (error) {
      setBackendStatus({
        state: "error",
        label: error instanceof Error ? error.message : `${label} check failed`,
      });
    }
  }

  return (
    <AppShell>
      <div className="demo-layout">
        <SettingsPanel
          config={config}
          backendStatus={backendStatus}
          authStatus={authStatus}
          webSocketStatus={webSocketStatus}
          readyUserId={readyUserId}
          joinedConversation={joinedConversation}
          conversationId={conversationId}
          jwtToken={jwtToken}
          currentUser={currentUser}
          onConfigChange={handleConfigChange}
          onJwtTokenChange={handleJwtTokenChange}
          onJwtClear={handleJwtClear}
          onConversationIdChange={setConversationId}
          onCheckCurrentUser={handleCurrentUserCheck}
          onWebSocketConnect={handleWebSocketConnect}
          onWebSocketReconnect={handleWebSocketReconnect}
          onWebSocketDisconnect={handleWebSocketDisconnect}
          onConversationJoin={handleConversationJoin}
          onConversationHistory={handleConversationHistory}
          onCheckHealth={handleHealthCheck}
          onCheckReady={handleReadyCheck}
        />
        <ChatPanel
          connectionState={webSocketStatus}
          readyUserId={readyUserId}
          conversationId={conversationId}
          joinedConversation={joinedConversation}
          messages={messages}
          messageDraft={messageDraft}
          selectedFile={selectedFile}
          uploadedAttachment={uploadedAttachment}
          uploadStatus={uploadStatus}
          canSendMessage={Boolean(messageDraft.trim() || uploadedAttachment)}
          isComposerDisabled={
            webSocketStatus.state !== "connected" || !joinedConversation
          }
          composerNotice={composerNotice}
          onMessageDraftChange={setMessageDraft}
          onSelectedFileChange={handleSelectedFileChange}
          onFileUpload={handleFileUpload}
          onMessageSend={handleMessageSend}
        />
      </div>
    </AppShell>
  );
}

function createClientMessageId() {
  if ("crypto" in window && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function appendMessageIfNew(
  messages: ChatMessage[],
  nextMessage: ChatMessage,
) {
  if (messages.some((message) => message.id === nextMessage.id)) {
    return messages;
  }

  return [...messages, nextMessage];
}

function isMessageCreatedEvent(event: ServerEvent): event is MessageCreatedEvent {
  return (
    event.type === "message.created" &&
    "message_id" in event &&
    typeof event.message_id === "string" &&
    "conversation_id" in event &&
    typeof event.conversation_id === "string" &&
    "sender_id" in event &&
    typeof event.sender_id === "string" &&
    "body" in event &&
    typeof event.body === "string" &&
    "created_at" in event &&
    typeof event.created_at === "string"
  );
}
