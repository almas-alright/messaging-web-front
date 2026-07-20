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

export type SendSupportEmailCodeRequest = {
  email: string;
};

export type SendSupportEmailCodeResponse = {
  message: string;
};

export type VerifySupportEmailCodeRequest = {
  email: string;
  code: string;
};

export type VerifySupportEmailCodeResponse = {
  verified: boolean;
};

export type SupportApiClient = {
  startSession: (
    request: StartSupportSessionRequest,
  ) => Promise<StartSupportSessionResponse>;
  sendEmailCode: (
    request: SendSupportEmailCodeRequest,
    visitorToken: string,
  ) => Promise<SendSupportEmailCodeResponse>;
  verifyEmailCode: (
    request: VerifySupportEmailCodeRequest,
    visitorToken: string,
  ) => Promise<VerifySupportEmailCodeResponse>;
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
    sendEmailCode: (request, visitorToken) =>
      requestJson<SendSupportEmailCodeResponse>(
        config.apiBaseUrl,
        "/support/email/send-code",
        request,
        visitorToken,
      ),
    verifyEmailCode: (request, visitorToken) =>
      requestJson<VerifySupportEmailCodeResponse>(
        config.apiBaseUrl,
        "/support/email/verify-code",
        request,
        visitorToken,
      ),
  };
}

async function requestJson<T>(
  apiBaseUrl: string,
  path: string,
  body: unknown,
  accessToken?: string,
) {
  let response: Response;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (accessToken?.trim()) {
      headers.Authorization = `Bearer ${accessToken.trim()}`;
    }
    response = await fetch(`${apiBaseUrl}${path}`, {
      body: JSON.stringify(body),
      headers,
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
