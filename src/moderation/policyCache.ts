import type {
  ModerationPolicyListResponse,
  ModerationPolicyResponse,
} from "../api/httpClient";

const moderationPolicyStorageKey = "messaging-web-front:moderation-policies";

export type CachedModerationPolicies = {
  version: string;
  fetchedAt: string;
  policies: ModerationPolicyResponse[];
};

export function normalizeModerationPolicyListResponse(
  response: unknown,
): ModerationPolicyListResponse {
  const parsed =
    response && typeof response === "object"
      ? (response as Partial<ModerationPolicyListResponse>)
      : {};

  return {
    version: typeof parsed.version === "string" ? parsed.version : "",
    policies: Array.isArray(parsed.policies)
      ? parsed.policies.filter(isPolicyLike)
      : [],
  };
}

export function loadCachedModerationPolicies(): CachedModerationPolicies | null {
  try {
    const raw = window.localStorage.getItem(moderationPolicyStorageKey);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<CachedModerationPolicies>;
    if (
      typeof parsed.version !== "string" ||
      typeof parsed.fetchedAt !== "string" ||
      !Array.isArray(parsed.policies)
    ) {
      return null;
    }

    return {
      version: parsed.version,
      fetchedAt: parsed.fetchedAt,
      policies: parsed.policies.filter(isPolicyLike),
    };
  } catch {
    return null;
  }
}

export function saveCachedModerationPolicies(
  response: ModerationPolicyListResponse,
): CachedModerationPolicies {
  const normalizedResponse = normalizeModerationPolicyListResponse(response);
  const cache = {
    version: normalizedResponse.version,
    fetchedAt: new Date().toISOString(),
    policies: normalizedResponse.policies,
  };
  window.localStorage.setItem(
    moderationPolicyStorageKey,
    JSON.stringify(cache),
  );
  return cache;
}

function isPolicyLike(value: unknown): value is ModerationPolicyResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const policy = value as Partial<ModerationPolicyResponse>;
  return (
    typeof policy.key === "string" &&
    typeof policy.label === "string" &&
    typeof policy.type === "string" &&
    typeof policy.value === "string" &&
    typeof policy.severity === "string" &&
    typeof policy.action === "string"
  );
}
