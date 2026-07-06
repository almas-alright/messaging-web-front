export function ChatPanel() {
  return (
    <section className="chat-panel" aria-label="Chat area">
      <div className="chat-panel__header">
        <div>
          <p className="eyebrow">Conversation</p>
          <h2>conv-001</h2>
        </div>
        <span className="connection-dot">Not connected</span>
      </div>

      <div className="message-list" aria-label="Messages">
        <article className="message-bubble message-bubble--other">
          <p>Backend configuration lands in the next phase.</p>
        </article>
        <article className="message-bubble message-bubble--own">
          <p>Then JWT, WebSocket, history, send, emoji, and files.</p>
        </article>
      </div>

      <div className="composer-shell" aria-label="Message composer preview">
        <span>Message composer placeholder</span>
      </div>
    </section>
  );
}
