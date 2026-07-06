export function ChatPreview() {
  return (
    <section className="chat-preview" aria-label="Chat preview">
      <div className="chat-preview__header">
        <div>
          <p className="eyebrow">Local demo</p>
          <h1>Messaging web front</h1>
        </div>
        <span className="status-pill">Skeleton</span>
      </div>
      <div className="chat-preview__body">
        <p>
          The app shell is ready. Next phases will add backend settings, JWT
          auth, WebSocket connection, conversation history, chat UI, emoji, and
          file messages.
        </p>
      </div>
    </section>
  );
}
