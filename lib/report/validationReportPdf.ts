import fs from "node:fs";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from "pdf-lib";
import type { DynamicValidationResult, FrameworkDecision, Locale } from "@/src/validation/types";
import { resolveFrameworkDecision, resolveOverallScore100 } from "@/src/validation/decision";

type ValidationPdfInput = {
  idea: string;
  email?: string;
  locale: Locale;
  result: DynamicValidationResult;
  generatedAt: string;
};

export type ValidationPdfDocument = {
  filename: string;
  bytes: Uint8Array;
};

const PAGE = {
  width: 595.28,
  height: 841.89,
  marginX: 42,
  marginTop: 48,
  marginBottom: 42,
};

function resolveReportScore(result: DynamicValidationResult): number {
  return resolveOverallScore100(result);
}

function decisionLabel(decision: FrameworkDecision): string {
  if (decision === "GO") return "Promising — Ready to Execute";
  if (decision === "CONDITIONAL_GO") return "Promising — Needs Validation";
  if (decision === "NEED_WORK") return "Early Stage — Validate Before Building";
  return "High Risk — Improve or Pivot";
}

function getDecision(result: DynamicValidationResult): FrameworkDecision {
  return resolveFrameworkDecision(result);
}

function safeSegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let current = words[0];

  for (let i = 1; i < words.length; i += 1) {
    const candidate = `${current} ${words[i]}`;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

async function tryEmbedLogo(pdfDoc: PDFDocument) {
  const candidates = [
    "bizsprouai-logo.png",
    "bizsprouai logo.png",
    "bizsproutai logo.png",
    "bizsproutai logo.jpg",
    "company-logo.png",
    "logo.png",
    "bizsproutai-logo.png",
    "company-logo.jpg",
    "logo.jpg",
  ];
  for (const file of candidates) {
    const abs = path.join(process.cwd(), "public", file);
    if (!fs.existsSync(abs)) continue;

    const bytes = fs.readFileSync(abs);
    try {
      if (file.endsWith(".png")) {
        return await pdfDoc.embedPng(bytes);
      }
      return await pdfDoc.embedJpg(bytes);
    } catch {
      return null;
    }
  }
  return null;
}

function ensureSpace(
  pdfDoc: PDFDocument,
  currentPage: PDFPage,
  y: number,
  needed: number
): { page: PDFPage; y: number } {
  if (y - needed >= PAGE.marginBottom) {
    return { page: currentPage, y };
  }
  const newPage = pdfDoc.addPage([PAGE.width, PAGE.height]);
  return { page: newPage, y: PAGE.height - PAGE.marginTop };
}

function drawSectionTitle(page: PDFPage, y: number, title: string, fontBold: PDFFont): number {
  page.drawText(title, {
    x: PAGE.marginX,
    y,
    size: 12,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.27),
  });
  return y - 18;
}

function drawParagraph(
  page: PDFPage,
  y: number,
  text: string,
  font: PDFFont,
  size = 10.5
): number {
  const maxWidth = PAGE.width - PAGE.marginX * 2;
  const lines = wrapText(text, font, size, maxWidth);
  let nextY = y;
  for (const line of lines) {
    page.drawText(line, {
      x: PAGE.marginX,
      y: nextY,
      size,
      font,
      color: rgb(0.18, 0.23, 0.33),
    });
    nextY -= size + 3;
  }
  return nextY - 6;
}

function drawBullets(
  page: PDFPage,
  y: number,
  items: string[],
  font: PDFFont,
  size = 10.5
): number {
  const width = PAGE.width - PAGE.marginX * 2 - 14;
  let nextY = y;
  for (const item of items) {
    const lines = wrapText(item, font, size, width);
    for (let i = 0; i < lines.length; i += 1) {
      const x = PAGE.marginX + (i === 0 ? 10 : 20);
      if (i === 0) {
        page.drawText("•", {
          x: PAGE.marginX,
          y: nextY,
          size: 12,
          font,
          color: rgb(0.2, 0.24, 0.36),
        });
      }
      page.drawText(lines[i], {
        x,
        y: nextY,
        size,
        font,
        color: rgb(0.18, 0.23, 0.33),
      });
      nextY -= size + 3;
    }
    nextY -= 3;
  }
  return nextY - 4;
}

export async function buildValidationReportPdf(input: ValidationPdfInput): Promise<ValidationPdfDocument> {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

  let page = pdfDoc.addPage([PAGE.width, PAGE.height]);
  let y = PAGE.height - PAGE.marginTop;

  page.drawRectangle({
    x: PAGE.marginX,
    y: y - 88,
    width: PAGE.width - PAGE.marginX * 2,
    height: 88,
    color: rgb(0.06, 0.22, 0.49),
  });

  const logo = await tryEmbedLogo(pdfDoc);
  if (logo) {
    const logoHeight = 34;
    const logoWidth = (logo.width / logo.height) * logoHeight;
    page.drawImage(logo, {
      x: PAGE.marginX + 16,
      y: y - 64,
      width: logoWidth,
      height: logoHeight,
    });
  }

  page.drawText("BizSproutAI Business Validation Report", {
    x: PAGE.marginX + 60,
    y: y - 36,
    size: 16,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText(`Generated ${input.generatedAt}`, {
    x: PAGE.marginX + 60,
    y: y - 56,
    size: 9.5,
    font: fontRegular,
    color: rgb(0.89, 0.94, 1),
  });

  const decision = getDecision(input.result);
  const score = resolveReportScore(input.result);

  page.drawRectangle({
    x: PAGE.width - PAGE.marginX - 130,
    y: y - 70,
    width: 114,
    height: 44,
    color: rgb(1, 1, 1),
  });
  page.drawText(`${decisionLabel(decision)}`, {
    x: PAGE.width - PAGE.marginX - 122,
    y: y - 44,
    size: 10.5,
    font: fontBold,
    color: rgb(0.09, 0.18, 0.36),
  });
  page.drawText(`${score}/100`, {
    x: PAGE.width - PAGE.marginX - 122,
    y: y - 61,
    size: 9.5,
    font: fontMono,
    color: rgb(0.32, 0.36, 0.45),
  });

  y -= 108;

  const summary = input.result.summary;
  const gates = input.result.frameworkReport?.gates ?? [];
  const top = summary.topOpportunities.slice(0, 4);
  const risks = summary.biggestRisks.slice(0, 4);
  const actions = input.result.nextActions.slice(0, 6);
  const demand = input.result.frameworkReport?.problemDemand.total;
  const competition = input.result.frameworkReport?.solutionValidation.differentiation;
  const modelMargin = input.result.frameworkReport?.businessModelValidation.margin;

  const metricCards: Array<{ label: string; value: string }> = [
    {
      label: "Demand",
      value: typeof demand === "number" ? `${demand}/20` : "n/a",
    },
    {
      label: "Competition",
      value: typeof competition === "number" ? `${competition}/5` : "n/a",
    },
    {
      label: "Model Margin",
      value: typeof modelMargin === "number" ? `${modelMargin}%` : "n/a",
    },
  ];

  const cardGap = 12;
  const cardWidth = (PAGE.width - PAGE.marginX * 2 - cardGap * 2) / 3;
  const cardY = y - 54;
  metricCards.forEach((card, idx) => {
    const x = PAGE.marginX + idx * (cardWidth + cardGap);
    page.drawRectangle({
      x,
      y: cardY,
      width: cardWidth,
      height: 46,
      color: rgb(0.95, 0.97, 1),
      borderColor: rgb(0.83, 0.88, 0.97),
      borderWidth: 1,
    });
    page.drawText(card.label, {
      x: x + 10,
      y: cardY + 29,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.31, 0.39, 0.52),
    });
    page.drawText(card.value, {
      x: x + 10,
      y: cardY + 13,
      size: 12,
      font: fontBold,
      color: rgb(0.09, 0.18, 0.36),
    });
  });

  y = cardY - 18;

  const breakdown = [
    `Category: ${input.result.category}`,
    `Country: ${input.result.country.code}`,
    `Framework: ${input.result.framework?.label ?? "General"}`,
    `Locale: ${input.locale}`,
    `Email: ${input.email ?? "not provided"}`,
  ];

  const sections: Array<{ title: string; lines?: string[]; bullets?: string[] }> = [
    { title: "Submitted Idea", lines: [input.idea] },
    { title: "Decision Summary", lines: [summary.oneLiner] },
    { title: "Context", bullets: breakdown },
    { title: "Top Opportunities", bullets: top.length ? top : ["n/a"] },
    { title: "Biggest Risks", bullets: risks.length ? risks : ["n/a"] },
    { title: "Next Actions (30-Day Preview)", bullets: actions.length ? actions : ["n/a"] },
    {
      title: "Gate Analysis",
      bullets:
        gates.length > 0
          ? gates.map((gate) => {
              if (gate.status === "BLOCKED") {
                return `Gate ${gate.gate} ${gate.name}: BLOCKED (waiting for Gate ${gate.blockedByGate})`;
              }
              return `Gate ${gate.gate} ${gate.name}: ${gate.status} (${gate.score}/${gate.maxScore})`;
            })
          : ["n/a"],
    },
  ];

  for (const section of sections) {
    ({ page, y } = ensureSpace(pdfDoc, page, y, 56));

    page.drawRectangle({
      x: PAGE.marginX,
      y: y - 6,
      width: PAGE.width - PAGE.marginX * 2,
      height: 1,
      color: rgb(0.89, 0.91, 0.95),
    });
    y -= 16;

    y = drawSectionTitle(page, y, section.title, fontBold);

    if (section.lines) {
      for (const paragraph of section.lines) {
        ({ page, y } = ensureSpace(pdfDoc, page, y, 44));
        y = drawParagraph(page, y, paragraph, fontRegular);
      }
    }

    if (section.bullets) {
      ({ page, y } = ensureSpace(pdfDoc, page, y, 44));
      y = drawBullets(page, y, section.bullets, fontRegular);
    }
  }

  ({ page, y } = ensureSpace(pdfDoc, page, y, 22));
  page.drawText("Generated by BizSproutAI", {
    x: PAGE.marginX,
    y: y - 2,
    size: 9,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.54),
  });

  const filenameIdea = input.idea.split(/\s+/).slice(0, 6).join("-");
  const filename = `bizsproutai-validation-${safeSegment(filenameIdea || "report")}.pdf`;
  const bytes = await pdfDoc.save();
  return { filename, bytes };
}
