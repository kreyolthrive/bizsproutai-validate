import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_SPRINT_SETTINGS } from "@/src/sprint/config";
import { getSprintSettingsFromDb, saveSprintSettingsToDb } from "@/src/sprint/server/settingsDb";
import { resolveOrCreateSprintSession } from "@/src/security/sprintSession";

export const runtime = "nodejs";

const MAX_PROJECT_KEY_LENGTH = 180;

function normalizeParam(value: string | null): string {
  return (value || "").trim();
}

export async function GET(request: NextRequest) {
  try {
    const projectKey = normalizeParam(request.nextUrl.searchParams.get("projectKey"));
    const session = resolveOrCreateSprintSession(request);

    if (!projectKey) {
      return NextResponse.json(
        { error: "Missing required query param: projectKey" },
        { status: 400 }
      );
    }

    if (projectKey.length > MAX_PROJECT_KEY_LENGTH) {
      return NextResponse.json(
        { error: `projectKey must be ${MAX_PROJECT_KEY_LENGTH} characters or fewer` },
        { status: 400 }
      );
    }

    const settings = await getSprintSettingsFromDb(session.sessionId, projectKey);
    const response = NextResponse.json({ success: true, settings });
    if (session.cookieToSet) {
      response.cookies.set(session.cookieToSet);
    }
    return response;
  } catch (error) {
    console.error("Sprint settings read error:", error);
    return NextResponse.json(
      { error: "Failed to load sprint settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const projectKey = normalizeParam(body?.projectKey ?? null);
    const session = resolveOrCreateSprintSession(request);

    if (!projectKey) {
      return NextResponse.json(
        { error: "Missing required field: projectKey" },
        { status: 400 }
      );
    }

    if (projectKey.length > MAX_PROJECT_KEY_LENGTH) {
      return NextResponse.json(
        { error: `projectKey must be ${MAX_PROJECT_KEY_LENGTH} characters or fewer` },
        { status: 400 }
      );
    }

    const settingsPatch = typeof body?.settings === "object" && body.settings !== null
      ? body.settings
      : DEFAULT_SPRINT_SETTINGS;

    const settings = await saveSprintSettingsToDb(session.sessionId, projectKey, settingsPatch);
    const response = NextResponse.json({ success: true, settings });
    if (session.cookieToSet) {
      response.cookies.set(session.cookieToSet);
    }
    return response;
  } catch (error) {
    console.error("Sprint settings write error:", error);
    return NextResponse.json(
      { error: "Failed to save sprint settings" },
      { status: 500 }
    );
  }
}
