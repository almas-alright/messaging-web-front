import { useEffect, useRef, useState } from "react";
import type { SupportWidgetConfig } from "./config";
import "./supportWidget.css";

export type SupportWidgetState =
  | "collapsed"
  | "opening"
  | "open"
  | "minimized";

type SupportWidgetProps = {
  config: SupportWidgetConfig;
};

export function SupportWidget({ config }: SupportWidgetProps) {
  const [state, setState] = useState<SupportWidgetState>("collapsed");
  const openingTimerRef = useRef<number | null>(null);
  const panelId = "support-widget-panel";

  useEffect(() => {
    return () => {
      if (openingTimerRef.current !== null) {
        window.clearTimeout(openingTimerRef.current);
      }
    };
  }, []);

  function openWidget() {
    if (openingTimerRef.current !== null) {
      window.clearTimeout(openingTimerRef.current);
    }
    setState("opening");
    openingTimerRef.current = window.setTimeout(() => {
      setState("open");
      openingTimerRef.current = null;
    }, 180);
  }

  function collapseWidget() {
    if (openingTimerRef.current !== null) {
      window.clearTimeout(openingTimerRef.current);
      openingTimerRef.current = null;
    }
    setState("collapsed");
  }

  if (state === "collapsed") {
    return (
      <button
        className="support-widget-launcher"
        type="button"
        aria-controls={panelId}
        aria-expanded="false"
        onClick={openWidget}
        data-theme={config.theme}
      >
        <span aria-hidden="true">?</span>
        <strong>{config.brandName}</strong>
      </button>
    );
  }

  if (state === "minimized") {
    return (
      <div className="support-widget-minimized" data-theme={config.theme}>
        <button type="button" onClick={openWidget} aria-controls={panelId}>
          Open {config.brandName}
        </button>
        <button
          className="support-widget-icon-button"
          type="button"
          onClick={collapseWidget}
          aria-label="Close support"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <section
      className="support-widget-panel"
      id={panelId}
      role="dialog"
      aria-label={`${config.brandName} chat`}
      data-state={state}
      data-theme={config.theme}
    >
      <header className="support-widget-header">
        <div>
          <span className="support-widget-presence" aria-hidden="true" />
          <div>
            <strong>{config.brandName}</strong>
            <span>We are here to help</span>
          </div>
        </div>
        <div className="support-widget-header__actions">
          <button
            className="support-widget-icon-button"
            type="button"
            onClick={() => setState("minimized")}
            aria-label="Minimize support"
          >
            −
          </button>
          <button
            className="support-widget-icon-button"
            type="button"
            onClick={collapseWidget}
            aria-label="Close support"
          >
            ×
          </button>
        </div>
      </header>

      <div className="support-widget-body">
        <div className="support-widget-welcome" role="status">
          <span aria-hidden="true">?</span>
          <h2>How can we help?</h2>
          <p>Start a conversation with our support team.</p>
        </div>
      </div>

      <footer className="support-widget-footer">
        <input
          type="text"
          aria-label="Support message"
          placeholder="Messaging becomes available after you start a conversation"
          disabled
        />
        <button type="button" disabled aria-label="Send support message">
          Send
        </button>
      </footer>
    </section>
  );
}
