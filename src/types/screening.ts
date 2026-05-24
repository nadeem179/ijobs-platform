export type ScreeningQuestionType =
  | "text"
  | "checkboxes"
  | "multiple_choice"
  | "single_choice";

export interface ScreeningQuestion {
  id: string;
  question: string;
  type: ScreeningQuestionType;
  required: boolean;
  options: string[];
}

export interface ScreeningAnswer {
  question_id: string;
  question: string;
  type: ScreeningQuestionType;
  answer: string | string[];
}

export const OPTION_SCREENING_TYPES: ScreeningQuestionType[] = [
  "checkboxes",
  "multiple_choice",
  "single_choice",
];

export function screeningTypeNeedsOptions(type: ScreeningQuestionType) {
  return OPTION_SCREENING_TYPES.includes(type);
}

export function createScreeningQuestion(): ScreeningQuestion {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `question-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    question: "",
    type: "text",
    required: false,
    options: [],
  };
}

function normalizeScreeningQuestionType(value: unknown): ScreeningQuestionType | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");

  if (
    normalized === "text" ||
    normalized === "free_text" ||
    normalized === "textarea" ||
    normalized === "short_text"
  ) {
    return "text";
  }

  if (
    normalized === "checkboxes" ||
    normalized === "checkbox" ||
    normalized === "checkbox_group" ||
    normalized === "checkboxes_group"
  ) {
    return "checkboxes";
  }

  if (
    normalized === "multiple_choice" ||
    normalized === "multi_choice" ||
    normalized === "multiple"
  ) {
    return "multiple_choice";
  }

  if (
    normalized === "single_choice" ||
    normalized === "single" ||
    normalized === "radio" ||
    normalized === "radio_group"
  ) {
    return "single_choice";
  }

  return null;
}

function parseJsonString(value: string): unknown {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) return value;

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function normalizeOptions(value: unknown) {
  const parsed = typeof value === "string" ? parseJsonString(value) : value;
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((option) => {
      if (typeof option === "string") return option.trim();
      if (option && typeof option === "object") {
        const row = option as Record<string, unknown>;
        const label = row.label ?? row.value ?? row.option ?? row.text;
        return typeof label === "string" ? label.trim() : "";
      }
      return "";
    })
    .filter(Boolean);
}

function getQuestionText(row: Record<string, unknown>) {
  const value = row.question ?? row.label ?? row.text ?? row.title ?? row.prompt;
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeScreeningQuestions(value: unknown): ScreeningQuestion[] {
  if (value == null) return [];

  const parsedValue = typeof value === "string" ? parseJsonString(value) : value;

  if (typeof parsedValue === "string") {
    const question = parsedValue.trim();
    return question
      ? [
          {
            id: "legacy-0",
            question,
            type: "text",
            required: false,
            options: [],
          },
        ]
      : [];
  }

  if (!Array.isArray(parsedValue)) {
    if (parsedValue && typeof parsedValue === "object") {
      const singleQuestion = normalizeScreeningQuestionItem(parsedValue, 0);
      return singleQuestion ? [singleQuestion] : [];
    }

    return [];
  }

  return parsedValue
    .flatMap((item, index): ScreeningQuestion[] => {
      if (typeof item === "string") {
        const parsedItem = parseJsonString(item);
        if (Array.isArray(parsedItem)) {
          return normalizeScreeningQuestions(parsedItem);
        }

        const normalizedItem = normalizeScreeningQuestionItem(parsedItem, index);
        return normalizedItem ? [normalizedItem] : [];
      }

      const normalizedItem = normalizeScreeningQuestionItem(item, index);
      return normalizedItem ? [normalizedItem] : [];
    });
}

function normalizeScreeningQuestionItem(
  item: unknown,
  index: number
): ScreeningQuestion | null {
  if (typeof item === "string") {
    const question = item.trim();
    if (!question) return null;

    return {
      id: `legacy-${index}`,
      question,
      type: "text",
      required: false,
      options: [],
    };
  }

  if (!item || typeof item !== "object") return null;

  const row = item as Record<string, unknown>;
  const question = getQuestionText(row);
  if (!question) return null;
  const type = normalizeScreeningQuestionType(row.type) ?? "text";
  const options = normalizeOptions(row.options);

  return {
    id: typeof row.id === "string" && row.id.trim() ? row.id : `question-${index}`,
    question,
    type,
    required: row.required === true || row.required === "true",
    options: screeningTypeNeedsOptions(type) ? options : [],
  };
}
