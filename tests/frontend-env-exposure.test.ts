// @vitest-environment node

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "..");
const FRONTEND_DIRS = ["components", "lib", "app"];
const SOURCE_FILE_PATTERN = /\.(ts|tsx|js|jsx)$/;

function walk(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(absolute));
      continue;
    }
    if (SOURCE_FILE_PATTERN.test(entry.name)) {
      files.push(absolute);
    }
  }

  return files;
}

describe("frontend env exposure", () => {
  it("uses only NEXT_PUBLIC env variables from client components", () => {
    const offenders: Array<{ file: string; variable: string }> = [];

    for (const relativeDir of FRONTEND_DIRS) {
      const absoluteDir = path.join(ROOT, relativeDir);
      if (!fs.existsSync(absoluteDir)) continue;

      for (const file of walk(absoluteDir)) {
        const contents = fs.readFileSync(file, "utf8");
        const isClientComponent =
          contents.startsWith('"use client"') ||
          contents.startsWith("'use client'");

        if (!isClientComponent) continue;

        for (const match of contents.matchAll(/process\.env\.([A-Z0-9_]+)/g)) {
          const variable = match[1];
          if (variable && !variable.startsWith("NEXT_PUBLIC_")) {
            offenders.push({
              file: path.relative(ROOT, file),
              variable,
            });
          }
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
