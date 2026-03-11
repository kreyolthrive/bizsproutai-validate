import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_SPRINT_SETTINGS } from "@/src/sprint/config";
import { getSprintSettingsFromDb, saveSprintSettingsToDb } from "@/src/sprint/server/settingsDb";

export const runtime = "nodejs";

function normalizeParam(value: string | null): string {
  return (value || "").trim();
}

export async function GET(request: NextRequest) {
  try {
    const userId = normalizeParam(request.nextUrl.searchParams.get("userId"));
    const projectKey = normalizeParam(request.nextUrl.searchParams.get("projectKey"));

    if (!userId || !projectKey) {
      return NextResponse.json(
        { error: "Missing required query params: userId, projectKey" },
        { status: 400 }
      );
    }

    const settings = getSprintSettingsFromDb(userId, projectKey);
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to load sprint settings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = normalizeParam(body?.userId ?? null);
    const projectKey = normalizeParam(body?.projectKey ?? null);

    if (!userId || !projectKey) {
      return NextResponse.json(
        { error: "Missing required fields: userId, projectKey" },
        { status: 400 }
      );
    }

    const settingsPatch = typeof body?.settings === "object" && body.settings !== null
      ? body.settings
      : DEFAULT_SPRINT_SETTINGS;

    const settings = saveSprintSettingsToDb(userId, projectKey, settingsPatch);
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to save sprint settings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

