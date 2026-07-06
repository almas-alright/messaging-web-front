import type { AppConfig } from "../../config/env";

type ChatPreviewProps = {
  config: AppConfig;
};

export function ChatPreview({ config }: ChatPreviewProps) {
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
        <dl className="config-list">
          <div>
            <dt>API</dt>
            <dd>{config.apiBaseUrl}</dd>
          </div>
          <div>
            <dt>WebSocket</dt>
            <dd>{config.wsBaseUrl}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
