import type { ModerationPolicyResponse } from "../api/httpClient";

export type ModerationDetection = {
  policyKey: string;
  label: string;
};

type DetectionRule = {
  policy: ModerationPolicyResponse;
  test: (message: string) => boolean;
};

const systemDetectors: Record<string, RegExp> = {
  mobile_number: /(?:\+?\d[\s().-]?){7,}\d/g,
  email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  link: /\b(?:https?:\/\/|www\.)[^\s<]+|\b[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s<]*)?/gi,
};

export function detectModerationRisk(
  message: string,
  policies: ModerationPolicyResponse[],
) {
  const draft = message.trim();
  if (!draft) {
    return null;
  }

  for (const rule of policiesToRules(policies)) {
    if (rule.test(draft)) {
      return {
        policyKey: rule.policy.key,
        label: rule.policy.label,
      };
    }
  }

  return null;
}

function policiesToRules(policies: ModerationPolicyResponse[]): DetectionRule[] {
  return policies
    .map((policy) => {
      if (policy.type === "system_detector") {
        return systemDetectorRule(policy);
      }

      return textMatchRule(policy);
    })
    .filter((rule): rule is DetectionRule => rule !== null);
}

function systemDetectorRule(
  policy: ModerationPolicyResponse,
): DetectionRule | null {
  const detector = systemDetectors[policy.value];
  if (!detector) {
    return null;
  }

  return {
    policy,
    test: (message) => {
      detector.lastIndex = 0;
      return detector.test(message);
    },
  };
}

function textMatchRule(policy: ModerationPolicyResponse): DetectionRule | null {
  const value = policy.value.trim();
  if (!value) {
    return null;
  }

  return {
    policy,
    test: (message) =>
      message.toLocaleLowerCase().includes(value.toLocaleLowerCase()),
  };
}
