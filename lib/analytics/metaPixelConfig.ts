const DEFAULT_META_PIXEL_IDS = ["1089915446436683", "774581073628901"];

function parsePixelIds(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

const configuredMetaPixelIds = parsePixelIds(process.env.NEXT_PUBLIC_META_PIXEL_IDS);

export const META_PIXEL_IDS = unique(
  configuredMetaPixelIds.length ? configuredMetaPixelIds : DEFAULT_META_PIXEL_IDS
);
