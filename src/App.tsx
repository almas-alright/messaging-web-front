import { useEffect, useMemo, useRef, useState } from "react";
import {
  AuthApiError,
  createAuthClient,
  type AuthUserResponse,
} from "./api/authClient";
import {
  type AdminModerationFlagResponse,
  type AdminModerationFlagStatus,
  createHttpClient,
  type AttachmentResponse,
  type ConversationMessageResponse,
  type ConversationMessagesResponse,
  type CurrentUserResponse,
  type ModerationPolicyListResponse,
} from "./api/httpClient";
import {
  clearStoredSession,
  loadStoredAccessToken,
  loadStoredSession,
  logoutAndClearSession,
  refreshStoredSession,
} from "./auth/sessionStorage";
import { AppShell } from "./components/AppShell";
import { AdminModerationPanel } from "./components/AdminModerationPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import type { AppConfig } from "./config/env";
import { loadStoredConfig, saveStoredConfig } from "./config/storage";
import { ChatPanel } from "./features/chat/ChatPanel";
import { AuthScreen } from "./features/auth/AuthScreen";
import { GlassChatApp } from "./features/glassChatV2/GlassChatApp";
import { SupportWidgetDemoPage } from "./features/supportWidget";
import {
  detectModerationRisk,
  type ModerationDetection,
} from "./moderation/detection";
import {
  loadCachedModerationPolicies,
  saveCachedModerationPolicies,
  type CachedModerationPolicies,
} from "./moderation/policyCache";
import {
  createMessagingWebSocket,
  type MessageCreatedEvent,
  type MessagingWebSocket,
  type ServerEvent,
} from "./realtime/webSocketClient";
import type { ChatMessage, ConnectionState } from "./types/chat";

const TYPING_IDLE_TIMEOUT_MS = 1500;
const TYPING_INDICATOR_TIMEOUT_MS = 3000;
const MODERATION_FLAG_IDLE_TIMEOUT_MS = 800;
const MESSAGE_HISTORY_PAGE_SIZE = 30;

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

type MessageHistoryStatus = {
  state: "idle" | "loading" | "loadingOlder" | "ok" | "error";
  label: string;
};

type MessageHistoryPagination = {
  hasMore: boolean;
  nextBefore: string | null;
};

type AdminFlagsStatus = {
  state: "idle" | "loading" | "ok" | "error";
  label: string;
};

export function App() {
  if (window.location.pathname === "/support-widget-demo") {
    return <SupportWidgetDemoPage />;
  }
  return window.location.pathname === "/demo" ? <DemoApp /> : <StandaloneApp />;
}

type SessionState =
  | { status: "checking"; user: null; message: string }
  | { status: "unauthenticated"; user: null; message: string }
  | { status: "authenticated"; user: AuthUserResponse; message: string }
  | { status: "error"; user: null; message: string };

function StandaloneApp() {
  const [sessionState, setSessionState] = useState<SessionState>(() =>
    loadStoredSession()
      ? { status: "checking", user: null, message: "Loading your account…" }
      : { status: "unauthenticated", user: null, message: "" },
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (sessionState.status === "checking") {
      void loadCurrentUser();
    }
  }, []);

  async function loadCurrentUser() {
    const session = loadStoredSession();
    if (!session) {
      setSessionState({ status: "unauthenticated", user: null, message: "" });
      return;
    }

    setSessionState({
      status: "checking",
      user: null,
      message: "Loading your account…",
    });
    const authClient = createAuthClient(loadStoredConfig());
    try {
      let accessToken = session.accessToken;
      let user: AuthUserResponse;
      try {
        user = await authClient.getMe(accessToken);
      } catch (error) {
        if (!(error instanceof AuthApiError) || error.status !== 401) {
          throw error;
        }
        const refreshedSession = await refreshStoredSession(authClient);
        accessToken = refreshedSession.accessToken;
        user = await authClient.getMe(accessToken);
      }
      setSessionState({
        status: "authenticated",
        user,
        message: "",
      });
    } catch (error) {
      setSessionState({
        status: "error",
        user: null,
        message:
          error instanceof Error
            ? error.message
            : "We could not load your messaging account.",
      });
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logoutAndClearSession(createAuthClient(loadStoredConfig()));
    } catch {
      // Local session clearing is guaranteed by the lifecycle helper.
    } finally {
      setSessionState({ status: "unauthenticated", user: null, message: "" });
      setIsLoggingOut(false);
    }
  }

  if (sessionState.status === "unauthenticated") {
    return (
      <AuthScreen
        onAuthenticated={(user) =>
          setSessionState({ status: "authenticated", user, message: "" })
        }
      />
    );
  }

  if (sessionState.status === "checking" || sessionState.status === "error") {
    return (
      <main className="session-gate">
        <section className="session-gate__card">
          <p className="eyebrow">Betopia messaging</p>
          <h1>
            {sessionState.status === "checking"
              ? "Opening your chat"
              : "Your session needs attention"}
          </h1>
          <p role={sessionState.status === "error" ? "alert" : "status"}>
            {sessionState.message}
          </p>
          {sessionState.status === "error" ? (
            <div className="button-row">
              <button type="button" onClick={() => void loadCurrentUser()}>
                Try again
              </button>
              <button type="button" onClick={() => void handleLogout()}>
                Sign out
              </button>
            </div>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <div className="authenticated-app">
      <header className="authenticated-header">
        <div>
          <p className="eyebrow">Betopia messaging</p>
          <strong>{sessionState.user.display_name}</strong>
          <span>{sessionState.user.email ?? sessionState.user.user_id}</span>
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Signing out…" : "Sign out"}
        </button>
      </header>
      <GlassChatApp currentUser={sessionState.user} />
    </div>
  );
}

function DemoApp() {
  const webSocketRef = useRef<MessagingWebSocket | null>(null);
  const joinedConversationRef = useRef<{
    conversationId: string;
    userId: string;
  } | null>(null);
  const typingStopTimerRef = useRef<number | null>(null);
  const typingIndicatorTimerRef = useRef<number | null>(null);
  const moderationFlagTimerRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);
  const draftClientMessageIdRef = useRef<string | null>(null);
  const submittedModerationFlagKeysRef = useRef<Set<string>>(new Set());
  const [config, setConfig] = useState<AppConfig>(() => loadStoredConfig());
  const [jwtToken, setJwtToken] = useState(() => loadStoredAccessToken());
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    state: "idle",
    label: "Not checked",
  });
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    state: "idle",
    label: "Session not checked",
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
  const [messageHistoryStatus, setMessageHistoryStatus] =
    useState<MessageHistoryStatus>({
      state: "idle",
      label: "Not loaded",
    });
  const [messageHistoryPagination, setMessageHistoryPagination] =
    useState<MessageHistoryPagination>({
      hasMore: false,
      nextBefore: null,
    });
  const [messageDraft, setMessageDraft] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedAttachment, setUploadedAttachment] =
    useState<AttachmentResponse | null>(null);
  const [attachmentMetadataById, setAttachmentMetadataById] = useState<
    Record<string, AttachmentResponse>
  >({});
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    state: "idle",
    label: "No file uploaded",
  });
  const [composerNotice, setComposerNotice] = useState<string | null>(null);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [moderationPolicyCache, setModerationPolicyCache] =
    useState<CachedModerationPolicies | null>(() =>
      loadCachedModerationPolicies(),
    );
  const [adminModerationFlags, setAdminModerationFlags] = useState<
    AdminModerationFlagResponse[]
  >([]);
  const [adminFlagsStatus, setAdminFlagsStatus] = useState<AdminFlagsStatus>({
    state: "idle",
    label: "Not loaded",
  });
  const [updatingAdminFlagId, setUpdatingAdminFlagId] = useState<string | null>(
    null,
  );
  const moderationDetection = useMemo(
    () =>
      detectModerationRisk(
        messageDraft,
        moderationPolicyCache?.policies ?? [],
      ),
    [messageDraft, moderationPolicyCache],
  );

  useEffect(() => {
    joinedConversationRef.current = joinedConversation;
  }, [joinedConversation]);

  useEffect(() => {
    if (!currentUser || !jwtToken.trim()) {
      setAdminModerationFlags([]);
      setAdminFlagsStatus({ state: "idle", label: "Not loaded" });
      return;
    }

    void refreshModerationPolicies();
    if (currentUser.role === "admin") {
      void handleAdminFlagsRefresh();
    } else {
      setAdminModerationFlags([]);
      setAdminFlagsStatus({ state: "idle", label: "Admin session required" });
    }
  }, [config.apiBaseUrl, currentUser, jwtToken]);

  useEffect(() => {
    clearModerationFlagTimer();

    const activeConversation = joinedConversation;
    const draft = messageDraft.trim();
    if (
      !moderationDetection ||
      !activeConversation ||
      !draft ||
      !jwtToken.trim()
    ) {
      return;
    }

    moderationFlagTimerRef.current = window.setTimeout(() => {
      const clientMessageId = ensureDraftClientMessageId();
      const dedupeKey = buildModerationFlagDedupeKey(
        activeConversation.conversationId,
        clientMessageId,
        moderationDetection,
      );

      if (submittedModerationFlagKeysRef.current.has(dedupeKey)) {
        return;
      }

      submittedModerationFlagKeysRef.current.add(dedupeKey);
      void createHttpClient(config)
        .createModerationFlag(jwtToken, {
          conversation_id: activeConversation.conversationId,
          client_message_id: clientMessageId,
          policy_id: moderationDetection.policyKey,
          matched_type: moderationDetection.matchedType,
          matched_text: moderationDetection.matchedText,
          message_excerpt: buildModerationMessageExcerpt(
            draft,
            moderationDetection.matchedText,
          ),
          detected_at: new Date().toISOString(),
        })
        .catch(() => {
          // Keep the local warning responsive even when flag submission fails.
        });
    }, MODERATION_FLAG_IDLE_TIMEOUT_MS);
  }, [config, joinedConversation, jwtToken, messageDraft, moderationDetection]);

  useEffect(() => {
    return () => {
      clearTypingStopTimer();
      clearTypingIndicatorTimer();
      clearModerationFlagTimer();
    };
  }, []);

  function handleConfigChange(nextConfig: AppConfig) {
    setConfig(nextConfig);
    saveStoredConfig(nextConfig);
  }

  function handleSessionClear() {
    setJwtToken("");
    setCurrentUser(null);
    setAuthStatus({ state: "idle", label: "Session cleared" });
    clearStoredSession();
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
    setAuthStatus({ state: "checking", label: "Checking session" });
    setCurrentUser(null);
    try {
      const user = await createHttpClient(config).getCurrentUser(jwtToken);
      setCurrentUser(user);
      setAuthStatus({ state: "ok", label: "Session accepted" });
    } catch (error) {
      setAuthStatus({
        state: "error",
        label:
          error instanceof Error ? error.message : "Current user check failed",
      });
    }
  }

  async function refreshModerationPolicies() {
    try {
      const response = await createHttpClient(config).getModerationPolicies(
        jwtToken,
      );
      updateModerationPolicyCache(response);
    } catch {
      // Cached policies continue to support local detection while offline.
    }
  }

  async function handleAdminFlagsRefresh() {
    if (!jwtToken.trim()) {
      return;
    }

    setAdminFlagsStatus({
      state: "loading",
      label: "Loading moderation flags",
    });
    try {
      const flags = await createHttpClient(config).getAdminModerationFlags(
        jwtToken,
      );
      setAdminModerationFlags(flags);
      setAdminFlagsStatus({
        state: "ok",
        label: `${flags.length} flag${flags.length === 1 ? "" : "s"} loaded`,
      });
    } catch (error) {
      setAdminFlagsStatus({
        state: "error",
        label:
          error instanceof Error
            ? error.message
            : "Moderation flags load failed",
      });
    }
  }

  async function handleAdminFlagStatusUpdate(
    flagId: string,
    status: Exclude<AdminModerationFlagStatus, "open">,
  ) {
    if (!jwtToken.trim()) {
      return;
    }

    setUpdatingAdminFlagId(flagId);
    try {
      const updatedFlag = await createHttpClient(config).updateAdminModerationFlag(
        jwtToken,
        flagId,
        { status },
      );
      setAdminModerationFlags((currentFlags) =>
        currentFlags.map((flag) =>
          flag.id === updatedFlag.id ? updatedFlag : flag,
        ),
      );
      setAdminFlagsStatus({
        state: "ok",
        label: `Flag ${updatedFlag.id} marked ${updatedFlag.status}`,
      });
    } catch (error) {
      setAdminFlagsStatus({
        state: "error",
        label:
          error instanceof Error ? error.message : "Flag status update failed",
      });
    } finally {
      setUpdatingAdminFlagId(null);
    }
  }

  function updateModerationPolicyCache(response: ModerationPolicyListResponse) {
    setModerationPolicyCache((currentCache) => {
      if (currentCache?.version === response.version) {
        return currentCache;
      }

      return saveCachedModerationPolicies(response);
    });
  }

  function handleWebSocketConnect() {
    setWebSocketStatus({ state: "connecting", label: "Connecting" });
    setReadyUserId(null);
    setJoinedConversation(null);
    setMessages([]);
    resetMessageHistoryState();
    setComposerNotice(null);
    resetTypingState();
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
    sendTypingStop();
    webSocketRef.current?.disconnect();
    webSocketRef.current = null;
    setReadyUserId(null);
    setJoinedConversation(null);
    setMessages([]);
    resetMessageHistoryState();
    setComposerNotice(null);
    resetTypingState();
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
      setMessages([]);
      resetMessageHistoryState();
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
      return;
    }
    if (
      (event.type === "typing.start" || event.type === "typing.stop") &&
      "conversation_id" in event &&
      typeof event.conversation_id === "string"
    ) {
      handleTypingEvent(event.type, event.conversation_id);
    }
  }

  function messageFromServer(event: {
    message_id: string;
    conversation_id: string;
    sender_id: string;
    body: string;
    created_at?: string;
    attachment_id?: string;
  }): ChatMessage {
    return {
      id: event.message_id,
      conversationId: event.conversation_id,
      senderId: event.sender_id,
      body: event.body,
      createdAt: event.created_at || new Date().toISOString(),
      attachmentId: event.attachment_id,
    };
  }

  function messageFromHistoryItem(item: ConversationMessageResponse): ChatMessage {
    return {
      id: item.id,
      conversationId: item.conversation_id,
      senderId: item.sender_id,
      body: item.body,
      createdAt: item.created_at || new Date().toISOString(),
      attachmentId: item.attachment_id,
    };
  }

  function handleConversationJoin() {
    webSocketRef.current?.send({
      type: "conversation.join",
      conversation_id: conversationId.trim(),
    });
  }

  async function handleConversationHistory() {
    if (!joinedConversation || !jwtToken.trim()) {
      return;
    }

    setMessageHistoryStatus({
      state: "loading",
      label: "Loading latest messages",
    });
    setComposerNotice(null);
    try {
      const response = await createHttpClient(config).getConversationMessages(
        jwtToken,
        joinedConversation.conversationId,
        { limit: MESSAGE_HISTORY_PAGE_SIZE },
      );
      setMessages(response.messages.map(messageFromHistoryItem));
      updateMessageHistoryPagination(response);
      setMessageHistoryStatus({
        state: "ok",
        label: `${response.messages.length} latest messages loaded`,
      });
    } catch (error) {
      setMessageHistoryStatus({
        state: "error",
        label: error instanceof Error ? error.message : "History load failed",
      });
    }
  }

  async function handleOlderMessagesLoad() {
    if (
      !joinedConversation ||
      !jwtToken.trim() ||
      !messageHistoryPagination.hasMore ||
      !messageHistoryPagination.nextBefore ||
      messageHistoryStatus.state === "loading" ||
      messageHistoryStatus.state === "loadingOlder"
    ) {
      return;
    }

    setMessageHistoryStatus({
      state: "loadingOlder",
      label: "Loading older messages",
    });
    try {
      const response = await createHttpClient(config).getConversationMessages(
        jwtToken,
        joinedConversation.conversationId,
        {
          limit: MESSAGE_HISTORY_PAGE_SIZE,
          before: messageHistoryPagination.nextBefore,
        },
      );
      const olderMessages = response.messages.map(messageFromHistoryItem);
      setMessages((currentMessages) =>
        prependMessagesIfNew(currentMessages, olderMessages),
      );
      updateMessageHistoryPagination(response);
      setMessageHistoryStatus({
        state: "ok",
        label: `${olderMessages.length} older messages loaded`,
      });
    } catch (error) {
      setMessageHistoryStatus({
        state: "error",
        label:
          error instanceof Error ? error.message : "Older messages load failed",
      });
    }
  }

  function handleMessageSend() {
    const body = messageDraft.trim();
    const attachment = uploadedAttachment;

    if (!joinedConversation || (!body && !attachment)) {
      return;
    }

    try {
      sendTypingStop();
      const clientMessageId = ensureDraftClientMessageId();
      webSocketRef.current?.send({
        type: "message.send",
        conversation_id: joinedConversation.conversationId,
        client_message_id: clientMessageId,
        body: body || undefined,
        attachment_id: attachment?.id,
      });
      setMessageDraft("");
      draftClientMessageIdRef.current = null;
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

  function handleMessageDraftChange(nextMessage: string) {
    setMessageDraft(nextMessage);

    if (!nextMessage.trim()) {
      draftClientMessageIdRef.current = null;
      clearModerationFlagTimer();
      sendTypingStop();
      return;
    }

    ensureDraftClientMessageId();
    sendTypingStart();
    scheduleTypingStop();
  }

  function ensureDraftClientMessageId() {
    if (!draftClientMessageIdRef.current) {
      draftClientMessageIdRef.current = createClientMessageId();
    }

    return draftClientMessageIdRef.current;
  }

  function sendTypingStart() {
    const activeConversation = joinedConversationRef.current;
    const socket = webSocketRef.current;

    if (!activeConversation || !socket || isTypingRef.current) {
      return;
    }

    try {
      socket.send({
        type: "typing.start",
        conversation_id: activeConversation.conversationId,
      });
      isTypingRef.current = true;
    } catch {
      clearTypingStopTimer();
    }
  }

  function sendTypingStop() {
    const activeConversation = joinedConversationRef.current;
    const socket = webSocketRef.current;

    clearTypingStopTimer();
    if (!activeConversation || !socket || !isTypingRef.current) {
      isTypingRef.current = false;
      return;
    }

    try {
      socket.send({
        type: "typing.stop",
        conversation_id: activeConversation.conversationId,
      });
    } catch {
      // The socket may already be closing; the next joined session starts fresh.
    } finally {
      isTypingRef.current = false;
    }
  }

  function scheduleTypingStop() {
    clearTypingStopTimer();
    typingStopTimerRef.current = window.setTimeout(() => {
      sendTypingStop();
    }, TYPING_IDLE_TIMEOUT_MS);
  }

  function handleTypingEvent(
    eventType: "typing.start" | "typing.stop",
    eventConversationId: string,
  ) {
    const activeConversation = joinedConversationRef.current;

    if (
      !activeConversation ||
      activeConversation.conversationId !== eventConversationId
    ) {
      return;
    }

    if (eventType === "typing.stop") {
      clearTypingIndicatorTimer();
      setIsOtherUserTyping(false);
      return;
    }

    setIsOtherUserTyping(true);
    clearTypingIndicatorTimer();
    typingIndicatorTimerRef.current = window.setTimeout(() => {
      setIsOtherUserTyping(false);
    }, TYPING_INDICATOR_TIMEOUT_MS);
  }

  function resetTypingState() {
    clearTypingStopTimer();
    clearTypingIndicatorTimer();
    isTypingRef.current = false;
    setIsOtherUserTyping(false);
  }

  function clearTypingStopTimer() {
    if (typingStopTimerRef.current !== null) {
      window.clearTimeout(typingStopTimerRef.current);
      typingStopTimerRef.current = null;
    }
  }

  function clearTypingIndicatorTimer() {
    if (typingIndicatorTimerRef.current !== null) {
      window.clearTimeout(typingIndicatorTimerRef.current);
      typingIndicatorTimerRef.current = null;
    }
  }

  function clearModerationFlagTimer() {
    if (moderationFlagTimerRef.current !== null) {
      window.clearTimeout(moderationFlagTimerRef.current);
      moderationFlagTimerRef.current = null;
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
      setAttachmentMetadataById((currentMetadata) => ({
        ...currentMetadata,
        [attachment.id]: attachment,
      }));
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

  function updateMessageHistoryPagination(response: ConversationMessagesResponse) {
    setMessageHistoryPagination({
      hasMore: response.pagination.has_more,
      nextBefore:
        response.pagination.next_before ||
        response.pagination.next_cursor ||
        null,
    });
  }

  function resetMessageHistoryState() {
    setMessageHistoryStatus({
      state: "idle",
      label: "Not loaded",
    });
    setMessageHistoryPagination({
      hasMore: false,
      nextBefore: null,
    });
  }

  return (
    <AppShell>
      <div className="demo-layout">
        <div className="side-panel-stack">
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
            onSessionClear={handleSessionClear}
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
          {currentUser?.role === "admin" ? (
            <AdminModerationPanel
              flags={adminModerationFlags}
              status={adminFlagsStatus}
              updatingFlagId={updatingAdminFlagId}
              onRefresh={handleAdminFlagsRefresh}
              onStatusUpdate={handleAdminFlagStatusUpdate}
            />
          ) : null}
        </div>
        <ChatPanel
          connectionState={webSocketStatus}
          readyUserId={readyUserId}
          conversationId={conversationId}
          joinedConversation={joinedConversation}
          messages={messages}
          historyStatus={messageHistoryStatus}
          hasOlderMessages={messageHistoryPagination.hasMore}
          attachmentMetadataById={attachmentMetadataById}
          attachmentBaseUrl={config.apiBaseUrl}
          messageDraft={messageDraft}
          selectedFile={selectedFile}
          uploadedAttachment={uploadedAttachment}
          uploadStatus={uploadStatus}
          canSendMessage={Boolean(messageDraft.trim() || uploadedAttachment)}
          isComposerDisabled={
            webSocketStatus.state !== "connected" || !joinedConversation
          }
          composerNotice={composerNotice}
          moderationWarning={
            moderationDetection
              ? `Warning: this message may include restricted contact information (${moderationDetection.label}).`
              : null
          }
          moderationPolicies={moderationPolicyCache?.policies ?? []}
          isOtherUserTyping={isOtherUserTyping}
          onMessageDraftChange={handleMessageDraftChange}
          onSelectedFileChange={handleSelectedFileChange}
          onFileUpload={handleFileUpload}
          onLoadOlderMessages={handleOlderMessagesLoad}
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

function prependMessagesIfNew(
  messages: ChatMessage[],
  olderMessages: ChatMessage[],
) {
  const existingIds = new Set(messages.map((message) => message.id));
  const uniqueOlderMessages = olderMessages.filter(
    (message) => !existingIds.has(message.id),
  );

  return [...uniqueOlderMessages, ...messages];
}

function buildModerationFlagDedupeKey(
  conversationId: string,
  clientMessageId: string,
  detection: ModerationDetection,
) {
  return [
    conversationId,
    clientMessageId,
    detection.policyKey,
    detection.matchedType,
    detection.matchedText.trim().toLocaleLowerCase(),
  ].join("|");
}

function buildModerationMessageExcerpt(message: string, matchedText: string) {
  const sanitizedMessage = matchedText.trim()
    ? message.replace(new RegExp(escapeRegExp(matchedText), "gi"), "[redacted]")
    : message;

  return truncateText(sanitizedMessage.trim(), 160);
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
    (!("created_at" in event) || typeof event.created_at === "string")
  );
}
