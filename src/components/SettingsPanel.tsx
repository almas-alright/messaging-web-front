import type { AppConfig } from "../config/env";

type SettingsPanelProps = {
  config: AppConfig;
  backendStatus: {
    state: "idle" | "checking" | "ok" | "error";
    label: string;
  };
  jwtToken: string;
  onConfigChange: (config: AppConfig) => void;
  onJwtTokenChange: (token: string) => void;
  onCheckHealth: () => void;
  onCheckReady: () => void;
};

export function SettingsPanel({
  config,
  backendStatus,
  jwtToken,
  onConfigChange,
  onJwtTokenChange,
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
      </section>

      <section className="panel-section">
        <h2>Coming next</h2>
        <ul className="plain-list">
          <li>Save demo JWT locally</li>
          <li>Authenticated current user</li>
          <li>Clear demo auth</li>
        </ul>
      </section>
    </aside>
  );
}
