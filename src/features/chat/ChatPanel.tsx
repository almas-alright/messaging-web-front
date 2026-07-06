import { useRef, useState, type KeyboardEvent } from "react";
import type { AttachmentResponse } from "../../api/httpClient";
import type { ChatMessage, ConnectionState } from "../../types/chat";

const EMOJI_OPTIONS = ["👍", "😊", "😂", "🔥", "🎉", "🙏", "❤️", "✅"];

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
  onMessageDraftChange: (message: string) => void;
  onSelectedFileChange: (file: File | null) => void;
  onFileUpload: () => void;
  onMessageSend: () => void;
};

export function ChatPanel({
  connectionState,
  readyUserId,
  conversationId,
  joinedConversation,
  messages,
  messageDraft,
  selectedFile,
  uploadedAttachment,
  uploadStatus,
  canSendMessage,
  isComposerDisabled,
  composerNotice,
  onMessageDraftChange,
  onSelectedFileChange,
  onFileUpload,
  onMessageSend,
}: ChatPanelProps) {
  const hasMessages = messages.length > 0;
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

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

      <div className="message-list" aria-label="Messages">
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
        {messages.map((message) => {
          const isOwnMessage = message.senderId === readyUserId;
          const senderLabel = isOwnMessage ? "You" : message.senderId;

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
                }`}
              >
                <p>{message.body}</p>
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
                  className={`upload-status upload-status--${uploadStatus.state}`}
                >
                  {uploadStatus.label}
                </small>
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
          {composerNotice ? (
            <span className="composer-notice">{composerNotice}</span>
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

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getSenderInitial(senderId: string) {
  return senderId.trim().slice(0, 1).toUpperCase() || "?";
}
