import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  createSupportApiClient,
  SupportApiError,
} from "./apiClient";
import type { SupportWidgetConfig } from "./config";
import {
  saveSupportVisitorSession,
  type SupportVisitorSession,
} from "./visitorSessionStorage";
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
  const [email, setEmail] = useState("");
  const [visitorSession, setVisitorSession] =
    useState<SupportVisitorSession | null>(null);
  const [startStatus, setStartStatus] = useState<{
    state: "idle" | "submitting" | "success" | "error";
    message: string;
  }>({ state: "idle", message: "" });
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

  async function handleWelcomeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!config.tenantId) {
      setStartStatus({
        state: "error",
        message: "Support is not configured for this page.",
      });
      return;
    }

    setStartStatus({ state: "submitting", message: "Starting support…" });
    try {
      const response = await createSupportApiClient(config).startSession({
        tenant_id: config.tenantId,
        email: email.trim(),
      });
      const session = saveSupportVisitorSession(config.tenantId, response);
      setVisitorSession(session);
      setEmail("");
      setStartStatus({
        state: "success",
        message: "Your support conversation is ready.",
      });
    } catch (error) {
      setStartStatus({
        state: "error",
        message: friendlyStartError(error),
      });
    }
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
        {visitorSession ? (
          <div className="support-widget-welcome" role="status">
            <span aria-hidden="true">✓</span>
            <h2>Conversation started</h2>
            <p>{startStatus.message}</p>
          </div>
        ) : (
          <form className="support-widget-welcome-form" onSubmit={handleWelcomeSubmit}>
            <div className="support-widget-welcome">
              <span aria-hidden="true">?</span>
              <h2>How can we help?</h2>
              <p>Enter your email to start a private support conversation.</p>
            </div>
            <label>
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                disabled={startStatus.state === "submitting"}
              />
            </label>
            {startStatus.message ? (
              <p
                className={`support-widget-start-status support-widget-start-status--${startStatus.state}`}
                role={startStatus.state === "error" ? "alert" : "status"}
              >
                {startStatus.message}
              </p>
            ) : null}
            <button
              className="support-widget-start-button"
              type="submit"
              disabled={startStatus.state === "submitting"}
            >
              {startStatus.state === "submitting"
                ? "Starting…"
                : "Start conversation"}
            </button>
          </form>
        )}
      </div>

      <footer className="support-widget-footer">
        <input
          type="text"
          aria-label="Support message"
          placeholder={
            visitorSession
              ? "Messaging is ready for the next step"
              : "Start a conversation to send messages"
          }
          disabled
        />
        <button type="button" disabled aria-label="Send support message">
          Send
        </button>
      </footer>
    </section>
  );
}

function friendlyStartError(error: unknown) {
  if (error instanceof SupportApiError) {
    return error.message;
  }
  return "Support is temporarily unavailable. Please try again.";
}
