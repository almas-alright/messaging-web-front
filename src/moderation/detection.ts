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

const wordLikePolicyTypes = new Set<ModerationPolicyResponse["type"]>([
  "word",
  "platform_name",
  "communication_app",
  "blocked_word",
]);

const phraseLikePolicyTypes = new Set<ModerationPolicyResponse["type"]>([
  "phrase",
  "blocked_phrase",
]);

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

  if (wordLikePolicyTypes.has(policy.type)) {
    return wordMatchRule(policy, value);
  }

  if (!phraseLikePolicyTypes.has(policy.type)) {
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

function wordMatchRule(
  policy: ModerationPolicyResponse,
  value: string,
): DetectionRule | null {
  const expression = maskedWordExpression(value);
  if (!expression) {
    return null;
  }

  return {
    policy,
    detect: (message) => {
      expression.lastIndex = 0;
      const match = expression.exec(message);
      return match?.[1] ?? null;
    },
  };
}

function maskedWordExpression(value: string) {
  const pattern = Array.from(value)
    .map((character) => {
      if (character === "*") {
        return String.raw`\S`;
      }

      return escapeRegExp(character);
    })
    .join("");

  if (!pattern) {
    return null;
  }

  return new RegExp(String.raw`(?:^|[^a-z0-9])(${pattern})(?=$|[^a-z0-9])`, "i");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
