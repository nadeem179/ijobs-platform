/**
 * Resume Parsing Service (Mock)
 *
 * Simulates resume extraction with realistic delays.
 * Prepares the architecture for real AI parsing integration.
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ParsedResume {
  name: string;
  headline: string;
  location: string;
  skills: string[];
  experience: {
    company: string;
    role: string;
    years: string;
  }[];
  education: string[];
  links: string[];
}

const MOCK_PARSED: ParsedResume = {
  name: "Jane Doe",
  headline: "Senior Product Designer",
  location: "San Francisco, CA",
  skills: [
    "Product Design",
    "Design Systems",
    "Figma",
    "User Research",
    "Prototyping",
    "UI/UX",
    "Interaction Design",
    "Design Strategy",
  ],
  experience: [
    { company: "Linear", role: "Senior Product Designer", years: "Jan 2022 — Present" },
    { company: "Stripe", role: "Product Designer II", years: "Mar 2019 — Dec 2021" },
    { company: "Figma", role: "Product Designer", years: "Jun 2017 — Feb 2019" },
  ],
  education: ["BFA in Communication Design, Carnegie Mellon University (2013 — 2017)"],
  links: ["linkedin.com/in/janedoe", "github.com/janedoe"],
};

interface ParseResult {
  success: boolean;
  data: ParsedResume | null;
  error: string | null;
}

/**
 * Mock resume parsing.
 * Simulates extracting fields from a file.
 * Replace with real AI parsing when ready.
 */
export async function parseResume(file: File): Promise<ParseResult> {
  // Validate file type
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      data: null,
      error: "Please upload a PDF or DOCX file.",
    };
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return {
      success: false,
      data: null,
      error: "File size must be under 5MB.",
    };
  }

  // Simulate parsing delay (1.5–3 seconds)
  const parseTime = 1500 + Math.random() * 1500;
  await delay(parseTime);

  // Simulate occasional failure (10% chance)
  if (Math.random() < 0.1) {
    return {
      success: false,
      data: null,
      error: "We couldn't extract all fields from this file. Please enter them manually.",
    };
  }

  return {
    success: true,
    data: { ...MOCK_PARSED },
    error: null,
  };
}

/**
 * File validation without parsing.
 * Use before upload to give early feedback.
 */
export function validateResumeFile(file: File): string | null {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!allowedTypes.includes(file.type)) return "Please upload a PDF or DOCX file.";
  if (file.size > 5 * 1024 * 1024) return "File size must be under 5MB.";
  return null;
}