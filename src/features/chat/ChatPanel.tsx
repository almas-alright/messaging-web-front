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
  return (
    <section className="chat-panel" aria-label="Chat area">
      <div className="chat-panel__header">
        <div>
          <p className="eyebrow">Conversation</p>
          <h2>{conversationId || "No conversation"}</h2>
        </div>
        <span className={`connection-dot connection-dot--${connectionState.state}`}>
          {connectionState.label}
        </span>
      </div>

      <div className="message-list" aria-label="Messages">
        <article className="message-bubble message-bubble--other">
          <p>Backend configuration lands in the next phase.</p>
        </article>
        <article className="message-bubble message-bubble--own">
          <p>Then JWT, WebSocket, history, send, emoji, and files.</p>
        </article>
        {readyUserId ? (
          <article className="message-bubble message-bubble--system">
            <p>WebSocket accepted JWT for {readyUserId}.</p>
          </article>
        ) : null}
        {joinedConversation ? (
          <article className="message-bubble message-bubble--system">
            <p>
              Joined {joinedConversation.conversationId} as{" "}
              {joinedConversation.userId}.
            </p>
          </article>
        ) : null}
        {messages.map((message) => (
          <article
            className={`message-bubble ${
              message.senderId === readyUserId
                ? "message-bubble--own"
                : "message-bubble--other"
            }`}
            key={message.id}
          >
            <p>{message.body}</p>
            <small>{message.senderId}</small>
          </article>
        ))}
      </div>

      <div className="composer-shell" aria-label="Message composer preview">
        <span>Message composer placeholder</span>
      </div>
    </section>
  );
}
