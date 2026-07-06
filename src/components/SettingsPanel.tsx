import type { AppConfig } from "../config/env";
import type { CurrentUserResponse } from "../api/httpClient";

type SettingsPanelProps = {
  config: AppConfig;
  backendStatus: {
    state: "idle" | "checking" | "ok" | "error";
    label: string;
  };
  authStatus: {
    state: "idle" | "checking" | "ok" | "error";
    label: string;
  };
  webSocketStatus: {
    state: "idle" | "connecting" | "connected" | "error";
    label: string;
  };
  readyUserId: string | null;
  conversationId: string;
  jwtToken: string;
  currentUser: CurrentUserResponse | null;
  onConfigChange: (config: AppConfig) => void;
  onJwtTokenChange: (token: string) => void;
  onJwtClear: () => void;
  onConversationIdChange: (conversationId: string) => void;
  onCheckCurrentUser: () => void;
  onWebSocketConnect: () => void;
  onWebSocketReconnect: () => void;
  onWebSocketDisconnect: () => void;
  onCheckHealth: () => void;
  onCheckReady: () => void;
};

export function SettingsPanel({
  config,
  backendStatus,
  authStatus,
  webSocketStatus,
  readyUserId,
  conversationId,
  jwtToken,
  currentUser,
  onConfigChange,
  onJwtTokenChange,
  onJwtClear,
  onConversationIdChange,
  onCheckCurrentUser,
  onWebSocketConnect,
  onWebSocketReconnect,
  onWebSocketDisconnect,
  onCheckHealth,
  onCheckReady,
}: SettingsPanelProps) {
  return (
    <aside className="settings-panel" aria-label="Demo setup">
      <section className="panel-section">
        <h2>Backend</h2>
        <label className="field">
          <span>API base URL</span>
          <input
            type="url"
            value={config.apiBaseUrl}
            onChange={(event) =>
              onConfigChange({ ...config, apiBaseUrl: event.target.value })
            }
            placeholder="http://localhost:8080"
          />
        </label>
        <label className="field">
          <span>WebSocket URL</span>
          <input
            type="url"
            value={config.wsBaseUrl}
            onChange={(event) =>
              onConfigChange({ ...config, wsBaseUrl: event.target.value })
            }
            placeholder="ws://localhost:8080/ws"
          />
        </label>
        <div className="button-row">
          <button type="button" onClick={onCheckHealth}>
            Check health
          </button>
          <button type="button" onClick={onCheckReady}>
            Check ready
          </button>
        </div>
        <div className={`backend-status backend-status--${backendStatus.state}`}>
          <span>Status</span>
          <strong>{backendStatus.label}</strong>
        </div>
      </section>

      <section className="panel-section">
        <h2>Demo JWT</h2>
        <label className="field">
          <span>Paste token</span>
          <textarea
            value={jwtToken}
            onChange={(event) => onJwtTokenChange(event.target.value)}
            placeholder="Paste manually generated JWT"
            rows={5}
            spellCheck={false}
          />
        </label>
        <button
          className="full-width-button"
          type="button"
          onClick={onCheckCurrentUser}
          disabled={!jwtToken.trim()}
        >
          Check current user
        </button>
        <button
          className="full-width-button full-width-button--secondary"
          type="button"
          onClick={onJwtClear}
          disabled={!jwtToken.trim() && !currentUser}
        >
          Clear demo JWT
        </button>
        <div className={`backend-status backend-status--${authStatus.state}`}>
          <span>Auth</span>
          <strong>{authStatus.label}</strong>
        </div>
        {currentUser ? (
          <dl className="config-list">
            <div>
              <dt>User ID</dt>
              <dd>{currentUser.user_id}</dd>
            </div>
            <div>
              <dt>Display name</dt>
              <dd>{currentUser.display_name}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{currentUser.role}</dd>
            </div>
          </dl>
        ) : null}
      </section>

      <section className="panel-section">
        <h2>Conversation</h2>
        <label className="field">
          <span>Conversation ID</span>
          <input
            type="text"
            value={conversationId}
            onChange={(event) => onConversationIdChange(event.target.value)}
            placeholder="conv-001"
          />
        </label>
        <button
          className="full-width-button"
          type="button"
          onClick={onWebSocketConnect}
          disabled={!jwtToken.trim()}
        >
          Connect WebSocket
        </button>
        <div className="button-row">
          <button
            type="button"
            onClick={onWebSocketReconnect}
            disabled={!jwtToken.trim()}
          >
            Reconnect
          </button>
          <button type="button" onClick={onWebSocketDisconnect}>
            Disconnect
          </button>
        </div>
        <div
          className={`backend-status backend-status--${webSocketStatus.state}`}
        >
          <span>WebSocket</span>
          <strong>{webSocketStatus.label}</strong>
        </div>
        {readyUserId ? (
          <dl className="config-list">
            <div>
              <dt>Ready user</dt>
              <dd>{readyUserId}</dd>
            </div>
          </dl>
        ) : null}
        <ul className="plain-list">
          <li>Join conversation</li>
          <li>Load message history</li>
        </ul>
      </section>
    </aside>
  );
}
