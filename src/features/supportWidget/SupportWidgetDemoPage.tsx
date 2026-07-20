import {
  isSupportWidgetConfigured,
  loadSupportWidgetConfig,
} from "./config";
import { SupportWidget } from "./SupportWidget";

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
      </section>
      <SupportWidget config={config} />
    </main>
  );
}
