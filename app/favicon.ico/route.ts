import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const iconPath = path.join(process.cwd(), "public", "bizsproutai-logo.png");
  const iconBuffer = await fs.readFile(iconPath);

  return new NextResponse(iconBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, immutable, no-transform, max-age=31536000",
    },
  });
}
