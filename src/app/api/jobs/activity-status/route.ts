import { NextRequest, NextResponse } from "next/server";
import { runJobActivityStatusSync } from "@/lib/jobs/activity-status-runner";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.JOB_ACTIVITY_CRON_SECRET?.trim();
  if (!secret) return true;

  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const headerSecret = request.headers.get("x-cron-secret");

  return bearer === secret || headerSecret === secret;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun = request.nextUrl.searchParams.get("dryRun") === "true";

  try {
    const result = await runJobActivityStatusSync({ dryRun });
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to sync job activity status";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

