import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type {
  AttachmentResponse,
  ModerationPolicyResponse,
} from "../../api/httpClient";
import { detectModerationRisk } from "../../moderation/detection";
import type { ChatMessage, ConnectionState } from "../../types/chat";

const EMOJI_OPTIONS = ["👍", "😊", "😂", "🔥", "🎉", "🙏", "❤️", "✅"];

type MessageTimelineItem =
  | {
      type: "day";
      id: string;
      label: string;
    }
  | {
      type: "message";
      message: ChatMessage;
    };

type ChatPanelProps = {
  connectionState: {
    state: ConnectionState;
    label: string;
  };
  readyUserId: string | null;
  conversationId: string;
  joinedConversation: {
    conversationId: string;
    userId: string;
  } | null;
  messages: ChatMessage[];
  historyStatus: {
    state: "idle" | "loading" | "loadingOlder" | "ok" | "error";
    label: string;
  };
  hasOlderMessages: boolean;
  attachmentMetadataById: Record<string, AttachmentResponse>;
  attachmentBaseUrl: string;
  messageDraft: string;
  selectedFile: File | null;
  uploadedAttachment: AttachmentResponse | null;
  uploadStatus: {
    state: "idle" | "uploading" | "uploaded" | "error";
    label: string;
  };
  canSendMessage: boolean;
  isComposerDisabled: boolean;
  composerNotice: string | null;
  moderationWarning: string | null;
  moderationPolicies: ModerationPolicyResponse[];
  isOtherUserTyping: boolean;
  onMessageDraftChange: (message: string) => void;
  onSelectedFileChange: (file: File | null) => void;
  onFileUpload: () => void;
  onLoadOlderMessages: () => void;
  onMessageSend: () => void;
};

export function ChatPanel({
  connectionState,
  readyUserId,
  conversationId,
  joinedConversation,
  messages,
  historyStatus,
  hasOlderMessages,
  attachmentMetadataById,
  attachmentBaseUrl,
  messageDraft,
  selectedFile,
  uploadedAttachment,
  uploadStatus,
  canSendMessage,
  isComposerDisabled,
  composerNotice,
  moderationWarning,
  moderationPolicies,
  isOtherUserTyping,
  onMessageDraftChange,
  onSelectedFileChange,
  onFileUpload,
  onLoadOlderMessages,
  onMessageSend,
}: ChatPanelProps) {
  const hasMessages = messages.length > 0;
  const timelineItems = buildMessageTimeline(messages);
  const messageModerationDetections = useMemo(
    () =>
      new Map(
        messages.map((message) => [
          message.id,
          detectModerationRisk(message.body, moderationPolicies),
        ]),
      ),
    [messages, moderationPolicies],
  );
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const previousFirstMessageIdRef = useRef("");
  const previousScrollHeightRef = useRef<number | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const messageList = messageListRef.current;
    const firstMessageId = messages[0]?.id ?? "";

    if (!messageList) {
      previousFirstMessageIdRef.current = firstMessageId;
      return;
    }

    if (
      previousScrollHeightRef.current !== null &&
      previousFirstMessageIdRef.current &&
      firstMessageId !== previousFirstMessageIdRef.current
    ) {
      const heightDelta =
        messageList.scrollHeight - previousScrollHeightRef.current;
      messageList.scrollTop += heightDelta;
      previousScrollHeightRef.current = null;
    }

    previousFirstMessageIdRef.current = firstMessageId;
  }, [messages]);

  function handleEmojiSelect(emoji: string) {
    const textArea = textAreaRef.current;
    const selectionStart = textArea?.selectionStart ?? messageDraft.length;
    const selectionEnd = textArea?.selectionEnd ?? messageDraft.length;
    const nextDraft = `${messageDraft.slice(
      0,
      selectionStart,
    )}${emoji}${messageDraft.slice(selectionEnd)}`;

    onMessageDraftChange(nextDraft);
    window.requestAnimationFrame(() => {
      textArea?.focus();
      const nextCursorPosition = selectionStart + emoji.length;
      textArea?.setSelectionRange(nextCursorPosition, nextCursorPosition);
    });
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    event.preventDefault();

    if (!isComposerDisabled && canSendMessage) {
      onMessageSend();
    }
  }

  function handleMessageListScroll() {
    const messageList = messageListRef.current;
    if (
      !messageList ||
      !hasOlderMessages ||
      historyStatus.state === "loading" ||
      historyStatus.state === "loadingOlder" ||
      messageList.scrollTop > 64
    ) {
      return;
    }

    previousScrollHeightRef.current = messageList.scrollHeight;
    onLoadOlderMessages();
  }

  return (
    <section className="chat-panel" aria-label="Chat area">
      <div className="chat-panel__header">
        <div>
          <p className="eyebrow">Conversation</p>
          <h2>{conversationId || "No conversation"}</h2>
          <p className="chat-panel__subtitle">
            {joinedConversation
              ? `Joined as ${joinedConversation.userId}`
              : "Join a conversation to load history"}
          </p>
        </div>
        <span
          className={`connection-dot connection-dot--${connectionState.state}`}
        >
          {connectionState.label}
        </span>
      </div>

      <div
        className="message-list"
        aria-label="Messages"
        onScroll={handleMessageListScroll}
        ref={messageListRef}
      >
        {historyStatus.state === "loading" ||
        historyStatus.state === "loadingOlder" ||
        historyStatus.state === "error" ? (
          <article
            className={`timeline-status timeline-status--${historyStatus.state}`}
            role={historyStatus.state === "error" ? "alert" : "status"}
          >
            <p>{historyStatus.label}</p>
          </article>
        ) : null}
        {readyUserId ? (
          <article className="timeline-status">
            <p>WebSocket accepted JWT for {readyUserId}.</p>
          </article>
        ) : null}
        {joinedConversation ? (
          <article className="timeline-status">
            <p>
              Joined {joinedConversation.conversationId} as{" "}
              {joinedConversation.userId}.
            </p>
          </article>
        ) : null}
        {!hasMessages ? (
          <article className="message-empty-state">
            <strong>No messages loaded yet</strong>
            <span>Join a conversation, then load history to begin.</span>
          </article>
        ) : null}
        {timelineItems.map((item) => {
          if (item.type === "day") {
            return (
              <div className="day-separator" key={item.id}>
                <span>{item.label}</span>
              </div>
            );
          }

          const message = item.message;
          const isOwnMessage = message.senderId === readyUserId;
          const senderLabel = isOwnMessage ? "You" : message.senderId;
          const messageModerationDetection =
            messageModerationDetections.get(message.id) ?? null;

          return (
            <article
              className={`message-row ${
                isOwnMessage ? "message-row--own" : "message-row--other"
              }`}
              key={message.id}
            >
              {!isOwnMessage ? (
                <span className="message-avatar" aria-hidden="true">
                  {getSenderInitial(message.senderId)}
                </span>
              ) : null}
              <div
                className={`message-bubble ${
                  isOwnMessage ? "message-bubble--own" : "message-bubble--other"
                } ${
                  messageModerationDetection ? "message-bubble--flagged" : ""
                }`}
              >
                {messageModerationDetection ? (
                  <span className="message-flag-label">
                    Flagged: {messageModerationDetection.label}
                  </span>
                ) : null}
                {message.body ? <p>{message.body}</p> : null}
                {message.attachmentId ? (
                  <a
                    className="attachment-card"
                    href={buildAttachmentUrl(
                      attachmentBaseUrl,
                      message.attachmentId,
                    )}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span>
                      {attachmentMetadataById[message.attachmentId]
                        ?.original_name ?? `Attachment ${message.attachmentId}`}
                    </span>
                    <small>
                      {formatAttachmentMeta(
                        attachmentMetadataById[message.attachmentId],
                      )}
                    </small>
                  </a>
                ) : null}
                <footer>
                  <span>{senderLabel}</span>
                  <time dateTime={message.createdAt}>
                    {formatMessageTime(message.createdAt)}
                  </time>
                </footer>
              </div>
            </article>
          );
        })}
      </div>

      <form
        className="composer-shell"
        aria-label="Message composer"
        onSubmit={(event) => {
          event.preventDefault();
          onMessageSend();
        }}
      >
        <div className="composer-input-stack">
          <div className="composer-tools">
            <button
              aria-expanded={isEmojiPickerOpen}
              className="emoji-toggle-button"
              disabled={isComposerDisabled}
              onClick={() => setIsEmojiPickerOpen((isOpen) => !isOpen)}
              type="button"
            >
              🙂
            </button>
            {isEmojiPickerOpen ? (
              <div className="emoji-picker" aria-label="Emoji picker">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    className="emoji-option"
                    key={emoji}
                    onClick={() => handleEmojiSelect(emoji)}
                    type="button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : null}
            <label
              className={`file-picker-button ${
                isComposerDisabled ? "file-picker-button--disabled" : ""
              }`}
            >
              <span>Attach file</span>
              <input
                disabled={isComposerDisabled}
                onChange={(event) =>
                  onSelectedFileChange(event.target.files?.[0] ?? null)
                }
                type="file"
              />
            </label>
          </div>
          {selectedFile ? (
            <div className="selected-file">
              <div>
                <span>{selectedFile.name}</span>
                <small
                  aria-live="polite"
                  className={`upload-status upload-status--${uploadStatus.state}`}
                >
                  {uploadStatus.label}
                </small>
                {uploadStatus.state === "uploading" ? (
                  <span
                    aria-label="Upload in progress"
                    className="upload-progress"
                    role="progressbar"
                  />
                ) : null}
                {uploadedAttachment ? (
                  <small className="upload-status">
                    Attachment ID: {uploadedAttachment.id}
                  </small>
                ) : null}
              </div>
              <div className="selected-file__actions">
                <button
                  disabled={
                    isComposerDisabled || uploadStatus.state === "uploading"
                  }
                  onClick={onFileUpload}
                  type="button"
                >
                  Upload
                </button>
                <button
                  aria-label="Clear selected file"
                  disabled={uploadStatus.state === "uploading"}
                  onClick={() => onSelectedFileChange(null)}
                  type="button"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : null}
          <textarea
            aria-label="Message text"
            className={moderationWarning ? "composer-textarea--risky" : ""}
            disabled={isComposerDisabled}
            onKeyDown={handleComposerKeyDown}
            onChange={(event) => onMessageDraftChange(event.target.value)}
            placeholder={
              isComposerDisabled
                ? "Connect and join a conversation to write"
                : "Write a message"
            }
            ref={textAreaRef}
            rows={1}
            value={messageDraft}
          />
          {isOtherUserTyping ? (
            <span
              aria-label="Other user is typing"
              className="typing-indicator"
              role="status"
            >
              ✍️
            </span>
          ) : null}
          {composerNotice ? (
            <span className="composer-notice">{composerNotice}</span>
          ) : null}
          {moderationWarning ? (
            <span className="composer-warning" role="status">
              {moderationWarning}
            </span>
          ) : null}
        </div>
        <button
          className="composer-send-button"
          disabled={isComposerDisabled || !canSendMessage}
          type="submit"
        >
          Send
        </button>
      </form>
    </section>
  );
}

function formatMessageTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function buildMessageTimeline(messages: ChatMessage[]): MessageTimelineItem[] {
  const items: MessageTimelineItem[] = [];
  let activeDayKey = "";

  for (const message of messages) {
    const timestamp = parseMessageTimestamp(message.createdAt);
    const dayKey = formatDayKey(timestamp);

    if (dayKey !== activeDayKey) {
      activeDayKey = dayKey;
      items.push({
        type: "day",
        id: `day-${dayKey}`,
        label: formatDayLabel(timestamp),
      });
    }

    items.push({
      type: "message",
      message,
    });
  }

  return items;
}

function parseMessageTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date();
  }

  return date;
}

function formatDayKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDayLabel(date: Date) {
  const today = startOfLocalDay(new Date());
  const messageDay = startOfLocalDay(date);
  const dayDifference = Math.round(
    (today.getTime() - messageDay.getTime()) / 86_400_000,
  );

  if (dayDifference === 0) {
    return "Today";
  }

  if (dayDifference === 1) {
    return "Yesterday";
  }

  if (dayDifference > 1 && dayDifference < 7) {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getSenderInitial(senderId: string) {
  return senderId.trim().slice(0, 1).toUpperCase() || "?";
}

function buildAttachmentUrl(apiBaseUrl: string, attachmentId: string) {
  return `${apiBaseUrl}/attachments/${encodeURIComponent(attachmentId)}`;
}

function formatAttachmentMeta(attachment?: AttachmentResponse) {
  if (!attachment) {
    return "Attachment metadata endpoint";
  }

  return `${formatFileSize(attachment.size_bytes)} · ${
    attachment.mime_type || "file"
  }`;
}

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
