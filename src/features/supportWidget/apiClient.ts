import type { SupportWidgetConfig } from "./config";

export type StartSupportSessionRequest = {
  tenant_id: string;
  email: string;
};

export type StartSupportSessionResponse = {
  session_id: string;
  tenant_id: string;
  conversation_id: string;
  status: "active" | string;
  access_token: string;
  token_type: "bearer" | string;
  expires_at: string;
};

export type SupportApiClient = {
  startSession: (
    request: StartSupportSessionRequest,
  ) => Promise<StartSupportSessionResponse>;
};

export class SupportApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "SupportApiError";
    this.status = status;
  }
}

export function createSupportApiClient(
  config: Pick<SupportWidgetConfig, "apiBaseUrl">,
): SupportApiClient {
  return {
    startSession: (request) =>
      requestJson<StartSupportSessionResponse>(
        config.apiBaseUrl,
        "/support/sessions/start",
        request,
      ),
  };
}

async function requestJson<T>(apiBaseUrl: string, path: string, body: unknown) {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
  } catch {
    throw new SupportApiError(
      "Support is temporarily unavailable. Please try again.",
      0,
    );
  }

  if (!response.ok) {
    throw new SupportApiError(supportStatusMessage(response.status), response.status);
  }
  return response.json() as Promise<T>;
}

function supportStatusMessage(status: number) {
  if (status === 400 || status === 422) {
    return "Please check the information and try again.";
  }
  if (status === 429) {
    return "Please wait a moment before trying again.";
  }
  return "Support is temporarily unavailable. Please try again.";
}
