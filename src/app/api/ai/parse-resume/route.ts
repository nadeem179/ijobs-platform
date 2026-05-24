import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { resumeText } = await req.json();

    if (!resumeText) {
      return NextResponse.json({ error: "Resume text is required" }, { status: 400 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3003",
        "X-Title": process.env.OPENROUTER_SITE_NAME || "Diplotix",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a resume parser. Return only valid JSON. No markdown. No explanation.",
          },
          {
            role: "user",
            content: `
Extract resume details into this JSON shape:

{
  "full_name": "",
  "headline": "",
  "about": "",
  "phone": "",
  "location": "",
  "designation": "",
  "current_title": "",
  "current_company": "",
  "total_experience_years": 0,
  "total_experience_months": 0,
  "skills": [],
  "tools": [],
  "languages": [],
  "experiences": [],
  "education": [],
  "certifications": [],
  "projects": []
}

Resume text:
${resumeText}
`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "OpenRouter request failed" },
        { status: 500 }
      );
    }

    const content = data?.choices?.[0]?.message?.content || "{}";

    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error("[OPENROUTER_RESUME_PARSE_ERROR]", error);
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 });
  }
}