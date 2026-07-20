import {
  isSupportWidgetConfigured,
  loadSupportWidgetConfig,
} from "./config";
import { SupportWidget } from "./SupportWidget";

const embedExample = `<div id="messaging-support-widget"></div>
<script>
  window.MessagingSupportWidgetConfig = {
    tenantId: "demo-tenant",
    apiBaseUrl: "http://localhost:8080",
    wsUrl: "ws://localhost:8080/ws",
    brandName: "Support",
    theme: "light"
  };
</script>`;

export function SupportWidgetDemoPage() {
  const config = loadSupportWidgetConfig();
  const isConfigured = isSupportWidgetConfigured(config);

  return (
    <main className="support-widget-demo">
      <header className="support-widget-demo__header">
        <a href="/">Messaging app</a>
        <span>Widget host preview</span>
      </header>
      <section className="support-widget-demo__hero">
        <p>Example host website</p>
        <h1>A quiet place to test the support experience.</h1>
        <p>
          This page represents a product site. Use the floating launcher to
          preview the isolated support widget shell.
        </p>
        <div className="support-widget-demo__status">
          <strong>{isConfigured ? "Public config loaded" : "Tenant config needed"}</strong>
          <span>
            {isConfigured
              ? `${config.brandName} · ${config.theme} theme`
              : "Set VITE_SUPPORT_WIDGET_TENANT_ID to enable backend flows."}
          </span>
        </div>
        <section className="support-widget-demo__embed" aria-labelledby="embed-title">
          <div>
            <p>Host initialization</p>
            <h2 id="embed-title">Public config only</h2>
            <span>
              Define this object before loading the frontend bundle. Visitor
              tokens are issued at runtime and never belong in host config.
            </span>
          </div>
          <pre tabIndex={0}>
            <code>{embedExample}</code>
          </pre>
          <small>
            Allowed fields: tenant id, API URL, WebSocket URL, brand name, and
            theme. Do not include access tokens, signing keys, or backend
            secrets.
          </small>
        </section>
      </section>
      <SupportWidget config={config} />
    </main>
  );
}
