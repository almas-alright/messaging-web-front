import type { AppConfig } from "../config/env";

type SettingsPanelProps = {
  config: AppConfig;
  onConfigChange: (config: AppConfig) => void;
};

export function SettingsPanel({ config, onConfigChange }: SettingsPanelProps) {
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
        <dl className="config-list">
          <div>
            <dt>WebSocket URL</dt>
            <dd>{config.wsBaseUrl}</dd>
          </div>
        </dl>
      </section>

      <section className="panel-section">
        <h2>Coming next</h2>
        <ul className="plain-list">
          <li>Editable WebSocket URL</li>
          <li>Manual JWT paste</li>
          <li>Health and readiness checks</li>
        </ul>
      </section>
    </aside>
  );
}
