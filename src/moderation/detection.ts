import type { ModerationPolicyResponse } from "../api/httpClient";

export type ModerationDetection = {
  policyKey: string;
  label: string;
  matchedType: string;
  matchedText: string;
};

type DetectionRule = {
  policy: ModerationPolicyResponse;
  detect: (message: string) => string | null;
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
    const matchedText = rule.detect(draft);
    if (matchedText) {
      return {
        policyKey: rule.policy.key,
        label: rule.policy.label,
        matchedType:
          rule.policy.type === "system_detector"
            ? rule.policy.value
            : rule.policy.type,
        matchedText,
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
    detect: (message) => {
      detector.lastIndex = 0;
      const match = detector.exec(message);
      return match?.[0] ?? null;
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
    detect: (message) => {
      const matchIndex = message
        .toLocaleLowerCase()
        .indexOf(value.toLocaleLowerCase());

      if (matchIndex < 0) {
        return null;
      }

      return message.slice(matchIndex, matchIndex + value.length);
    },
  };
}
