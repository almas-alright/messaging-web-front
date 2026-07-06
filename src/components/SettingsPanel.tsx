import type { AppConfig } from "../config/env";

type SettingsPanelProps = {
  config: AppConfig;
  onConfigChange: (config: AppConfig) => void;
  onCheckHealth: () => void;
  onCheckReady: () => void;
};

export function SettingsPanel({
  config,
  onConfigChange,
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
      </section>

      <section className="panel-section">
        <h2>Coming next</h2>
        <ul className="plain-list">
          <li>Manual JWT paste</li>
          <li>Backend connection status</li>
          <li>Saved local demo settings</li>
        </ul>
      </section>
    </aside>
  );
}
