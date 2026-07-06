import type { ChatMessage, ConnectionState } from "../../types/chat";

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
};

export function ChatPanel({
  connectionState,
  readyUserId,
  conversationId,
  joinedConversation,
  messages,
}: ChatPanelProps) {
  const hasMessages = messages.length > 0;

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

          return (
            <article
              className={`message-row ${
                isOwnMessage ? "message-row--own" : "message-row--other"
              }`}
              key={message.id}
            >
              <div
                className={`message-bubble ${
                  isOwnMessage ? "message-bubble--own" : "message-bubble--other"
                }`}
              >
                <p>{message.body}</p>
                <footer>
                  <span>{isOwnMessage ? "You" : message.senderId}</span>
                  <time dateTime={message.createdAt}>
                    {formatMessageTime(message.createdAt)}
                  </time>
                </footer>
              </div>
            </article>
          );
        })}
      </div>

      <div className="composer-shell" aria-label="Message composer preview">
        <span>Message composer placeholder</span>
      </div>
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
