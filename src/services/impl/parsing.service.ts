const MAX_RESUME_SIZE = 5 * 1024 * 1024;

const allowedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/rtf",
];

const decoder = new TextDecoder("utf-8");

export type ParsedResume = {
  name?: string;
  full_name?: string;
  headline?: string;
  about?: string;
  phone?: string;
  location?: string;
  designation?: string;
  current_title?: string;
  current_company?: string;
  total_experience_years?: number;
  total_experience_months?: number;
  skills?: string[];
  tools?: string[];
  languages?: Array<string | { language?: string; fluency?: string }>;
  experiences?: Array<Record<string, unknown>>;
  education?: Array<Record<string, unknown> | string>;
  certifications?: Array<Record<string, unknown>>;
  projects?: Array<Record<string, unknown>>;
};

type ParseResult =
  | {
      success: true;
      data: ParsedResume;
      error: null;
    }
  | {
      success: false;
      data: null;
      error: string;
    };

function stripXml(input: string) {
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanPdfString(input: string) {
  return input
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\");
}

async function inflateZipEntry(bytes: Uint8Array) {
  if (typeof DecompressionStream === "undefined") {
    return decoder.decode(bytes);
  }
  const copy = Uint8Array.from(bytes);
  const blob = new Blob([copy.buffer]);
  const stream = blob.stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Response(stream).text();
}

async function extractDocxText(file: File) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  for (let offset = 0; offset < bytes.length - 30; offset += 1) {
    if (
      bytes[offset] === 0x50 &&
      bytes[offset + 1] === 0x4b &&
      bytes[offset + 2] === 0x03 &&
      bytes[offset + 3] === 0x04
    ) {
      const view = new DataView(buffer, offset);
      const method = view.getUint16(8, true);
      const compressedSize = view.getUint32(18, true);
      const nameLength = view.getUint16(26, true);
      const extraLength = view.getUint16(28, true);
      const nameStart = offset + 30;
      const name = decoder.decode(bytes.slice(nameStart, nameStart + nameLength));
      const dataStart = nameStart + nameLength + extraLength;
      const dataEnd = dataStart + compressedSize;
      if (name !== "word/document.xml") continue;
      const entry = bytes.slice(dataStart, dataEnd);
      const xml = method === 0 ? decoder.decode(entry) : await inflateZipEntry(entry);
      return stripXml(xml);
    }
  }
  return "";
}

function extractPdfText(file: File) {
  return file.arrayBuffer().then((buffer) => {
    const raw = new TextDecoder("latin1").decode(buffer);
    const chunkMatches = raw.match(/\((?:\\.|[^\\)])*\)\s*(?:Tj|TJ)/g) || [];
    const chunks = chunkMatches
      .map((chunk) => {
        const text = chunk.match(/\((?:\\.|[^\\)])*\)/)?.[0] || "";
        return cleanPdfString(text.slice(1, -1));
      })
      .filter(Boolean);

    if (chunks.length > 0) return chunks.join(" ");

    return raw
      .replace(/[^\x20-\x7E\n\r\t]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  });
}

export async function extractResumeText(file: File) {
  if (!allowedTypes.includes(file.type)) {
    return "";
  }

  if (file.size > MAX_RESUME_SIZE) {
    return "";
  }

  if (file.type === "text/plain" || file.type === "text/rtf") {
    return file.text();
  }

  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return extractDocxText(file);
  }

  if (file.type === "application/pdf") {
    return extractPdfText(file);
  }

  return file.text();
}

export async function parseResume(file: File): Promise<ParseResult> {
  const validationError = validateResumeFile(file);
  if (validationError) {
    return { success: false, data: null, error: validationError };
  }

  const resumeText = (await extractResumeText(file)).trim();
  if (!resumeText) {
    return {
      success: false,
      data: null,
      error: "We could not extract readable text from this file. Please continue manually.",
    };
  }

  const response = await fetch("/api/ai/parse-resume", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ resumeText }),
  });

  const data = await response.json();
  if (!response.ok) {
    return {
      success: false,
      data: null,
      error: data?.error || "We could not parse this resume.",
    };
  }

  return {
    success: true,
    data,
    error: null,
  };
}

export function validateResumeFile(file: File): string | null {
  if (!allowedTypes.includes(file.type)) return "Please upload a PDF, DOCX, or text file.";
  if (file.size > MAX_RESUME_SIZE) return "File size must be under 5MB.";
  return null;
}
