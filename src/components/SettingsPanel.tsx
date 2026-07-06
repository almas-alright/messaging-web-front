import type { AppConfig } from "../config/env";

type SettingsPanelProps = {
  config: AppConfig;
};

export function SettingsPanel({ config }: SettingsPanelProps) {
  return (
    <aside className="settings-panel" aria-label="Demo setup">
      <section className="panel-section">
        <h2>Backend</h2>
        <dl className="config-list">
          <div>
            <dt>API base URL</dt>
            <dd>{config.apiBaseUrl}</dd>
          </div>
          <div>
            <dt>WebSocket URL</dt>
            <dd>{config.wsBaseUrl}</dd>
          </div>
        </dl>
      </section>

      <section className="panel-section">
        <h2>Coming next</h2>
        <ul className="plain-list">
          <li>Editable backend URLs</li>
          <li>Manual JWT paste</li>
          <li>Health and readiness checks</li>
        </ul>
      </section>
    </aside>
  );
}
