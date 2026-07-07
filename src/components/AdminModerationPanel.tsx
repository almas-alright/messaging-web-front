import type {
  AdminModerationFlagResponse,
  AdminModerationFlagStatus,
} from "../api/httpClient";

const REVIEW_STATUSES: Exclude<AdminModerationFlagStatus, "open">[] = [
  "reviewed",
  "ignored",
  "escalated",
];

type AdminModerationPanelProps = {
  flags: AdminModerationFlagResponse[];
  status: {
    state: "idle" | "loading" | "ok" | "error";
    label: string;
  };
  updatingFlagId: string | null;
  onRefresh: () => void;
  onStatusUpdate: (
    flagId: string,
    status: Exclude<AdminModerationFlagStatus, "open">,
  ) => void;
};

export function AdminModerationPanel({
  flags,
  status,
  updatingFlagId,
  onRefresh,
  onStatusUpdate,
}: AdminModerationPanelProps) {
  return (
    <section className="admin-panel" aria-label="Admin moderation flags">
      <div className="admin-panel__header">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>Moderation flags</h2>
        </div>
        <button
          className="full-width-button full-width-button--compact"
          disabled={status.state === "loading"}
          onClick={onRefresh}
          type="button"
        >
          Refresh
        </button>
      </div>

      <div className={`backend-status backend-status--${status.state}`}>
        <span>Review queue</span>
        <strong>{status.label}</strong>
      </div>

      {flags.length === 0 ? (
        <div className="admin-empty-state">
          <strong>No flags loaded</strong>
          <span>Use an admin JWT and refresh the review queue.</span>
        </div>
      ) : (
        <div className="admin-flag-list">
          {flags.map((flag) => (
            <article className="admin-flag-item" key={flag.id}>
              <div className="admin-flag-item__meta">
                <strong>{flag.conversation_id}</strong>
                <span>{flag.sender_id || "unknown sender"}</span>
              </div>

              <dl className="admin-flag-grid">
                <div>
                  <dt>Type</dt>
                  <dd>{flag.matched_type || "unknown"}</dd>
                </div>
                <div>
                  <dt>Severity</dt>
                  <dd>
                    <span
                      className={`severity-pill severity-pill--${flag.severity}`}
                    >
                      {flag.severity}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{flag.status}</dd>
                </div>
                <div>
                  <dt>Detected</dt>
                  <dd>{formatDateTime(flag.detected_at)}</dd>
                </div>
              </dl>

              <p className="admin-flag-excerpt">
                {flag.message_excerpt || "No excerpt provided"}
              </p>

              <div className="admin-flag-actions">
                {REVIEW_STATUSES.map((nextStatus) => (
                  <button
                    disabled={
                      updatingFlagId === flag.id || flag.status === nextStatus
                    }
                    key={nextStatus}
                    onClick={() => onStatusUpdate(flag.id, nextStatus)}
                    type="button"
                  >
                    {formatStatusAction(nextStatus)}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function formatStatusAction(status: Exclude<AdminModerationFlagStatus, "open">) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDateTime(value?: string) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    hour12: true,
  }).format(date);
}
