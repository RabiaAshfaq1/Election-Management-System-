/** Matches POLL-CS25-0042 */
export const POLL_SECRET_ID_PATTERN = /^POLL-([A-Z0-9]{2,10})-(\d{4})$/;

export function isPollSecretId(secretId: string): boolean {
  return POLL_SECRET_ID_PATTERN.test(secretId);
}

export interface ElectionSecretMeta {
  title: string;
  category?: string | null;
}

/**
 * Human-readable election code (e.g. CS25) from title/category.
 */
export function deriveElectionShortCode(
  title: string,
  category?: string | null
): string {
  const yearMatch = title.match(/\b(20\d{2})\b/);
  const yearSuffix = yearMatch ? yearMatch[1].slice(-2) : "";

  if (category?.trim()) {
    const fromCategory = category
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 4);
    if (fromCategory.length >= 2) {
      return `${fromCategory}${yearSuffix}`.slice(0, 8);
    }
  }

  const words = title.split(/\s+/).filter((w) => /[a-zA-Z0-9]/.test(w));
  const initials = words
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, "").charAt(0))
    .join("")
    .toUpperCase();

  const code = `${initials}${yearSuffix}`.replace(/[^A-Z0-9]/g, "");

  if (code.length >= 2) {
    return code.slice(0, 8);
  }

  return "ELEC";
}

const shortCodeCache = new Map<string, string>();

export function cacheElectionShortCode(
  electionId: string,
  meta: ElectionSecretMeta
): string {
  const code = deriveElectionShortCode(meta.title, meta.category);
  shortCodeCache.set(electionId, code);
  return code;
}

function resolveShortCode(
  electionId: string,
  meta?: ElectionSecretMeta
): string {
  const cached = shortCodeCache.get(electionId);
  if (cached) return cached;
  if (meta) return cacheElectionShortCode(electionId, meta);
  throw new Error(`Short code not set for election ${electionId}`);
}

/**
 * Build one secret voter ID: POLL-{shortCode}-{4 digit sequence}.
 */
export function generateSecretId(
  electionId: string,
  sequenceNumber: number,
  meta?: ElectionSecretMeta
): string {
  const shortCode = resolveShortCode(electionId, meta);
  const seq = String(Math.max(1, sequenceNumber)).padStart(4, "0");
  const code = shortCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `POLL-${code}-${seq}`;
}

/**
 * Generate a contiguous batch of secret IDs for an election.
 */
export function generateBatchSecretIds(
  electionId: string,
  count: number,
  meta: ElectionSecretMeta,
  startSequence = 1
): string[] {
  if (count <= 0) return [];
  cacheElectionShortCode(electionId, meta);
  return Array.from({ length: count }, (_, i) =>
    generateSecretId(electionId, startSequence + i)
  );
}

/**
 * Next sequence after existing POLL-* IDs for this election short code.
 */
export function getNextSequenceNumber(
  existingSecretIds: string[],
  electionId: string,
  meta: ElectionSecretMeta
): number {
  const shortCode = cacheElectionShortCode(electionId, meta);
  const prefix = `POLL-${shortCode.toUpperCase().replace(/[^A-Z0-9]/g, "")}-`;
  let max = 0;

  for (const id of existingSecretIds) {
    if (!id.startsWith(prefix)) continue;
    const seq = parseInt(id.slice(prefix.length), 10);
    if (!Number.isNaN(seq)) {
      max = Math.max(max, seq);
    }
  }

  return max + 1;
}

/** Display format: ****-****-XXXX (last 4 visible). */
export function maskSecretId(secretId: string): string {
  const suffix = secretId.slice(-4);
  return `****-****-${suffix}`;
}
