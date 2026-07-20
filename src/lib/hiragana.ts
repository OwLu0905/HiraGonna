export type VowelRow = "a" | "i" | "u" | "e" | "o"

export interface Kana {
  kana: string
  /** Canonical Hepburn romaji, e.g. "shi" */
  romaji: string
  /** Other accepted spellings, e.g. Kunrei "si" */
  alternates: string[]
  /** Consonant column of the gojūon table ("" for the vowel column, "n" for ん) */
  column: string
  /** Vowel row of the gojūon table (null for ん) */
  vowel: VowelRow | null
}

const k = (
  kana: string,
  romaji: string,
  column: string,
  vowel: VowelRow | null,
  alternates: string[] = []
): Kana => ({ kana, romaji, alternates, column, vowel })

/** The 46 basic hiragana (gojūon + ん). */
export const HIRAGANA: Kana[] = [
  k("あ", "a", "", "a"),
  k("い", "i", "", "i"),
  k("う", "u", "", "u"),
  k("え", "e", "", "e"),
  k("お", "o", "", "o"),
  k("か", "ka", "k", "a"),
  k("き", "ki", "k", "i"),
  k("く", "ku", "k", "u"),
  k("け", "ke", "k", "e"),
  k("こ", "ko", "k", "o"),
  k("さ", "sa", "s", "a"),
  k("し", "shi", "s", "i", ["si"]),
  k("す", "su", "s", "u"),
  k("せ", "se", "s", "e"),
  k("そ", "so", "s", "o"),
  k("た", "ta", "t", "a"),
  k("ち", "chi", "t", "i", ["ti"]),
  k("つ", "tsu", "t", "u", ["tu"]),
  k("て", "te", "t", "e"),
  k("と", "to", "t", "o"),
  k("な", "na", "n", "a"),
  k("に", "ni", "n", "i"),
  k("ぬ", "nu", "n", "u"),
  k("ね", "ne", "n", "e"),
  k("の", "no", "n", "o"),
  k("は", "ha", "h", "a"),
  k("ひ", "hi", "h", "i"),
  k("ふ", "fu", "h", "u", ["hu"]),
  k("へ", "he", "h", "e"),
  k("ほ", "ho", "h", "o"),
  k("ま", "ma", "m", "a"),
  k("み", "mi", "m", "i"),
  k("む", "mu", "m", "u"),
  k("め", "me", "m", "e"),
  k("も", "mo", "m", "o"),
  k("や", "ya", "y", "a"),
  k("ゆ", "yu", "y", "u"),
  k("よ", "yo", "y", "o"),
  k("ら", "ra", "r", "a"),
  k("り", "ri", "r", "i"),
  k("る", "ru", "r", "u"),
  k("れ", "re", "r", "e"),
  k("ろ", "ro", "r", "o"),
  k("わ", "wa", "w", "a"),
  k("を", "wo", "w", "o", ["o"]),
  k("ん", "n", "n-syllabic", null, ["nn"]),
]

/** Gojūon table axes: columns are consonant rows (行), rows are vowels (段). */
export const GOJUON_COLUMNS = ["", "k", "s", "t", "n", "h", "m", "y", "r", "w"] as const
export const GOJUON_VOWELS: VowelRow[] = ["a", "i", "u", "e", "o"]

export const COLUMN_LABELS: Record<string, string> = {
  "": "あ行",
  k: "か行",
  s: "さ行",
  t: "た行",
  n: "な行",
  h: "は行",
  m: "ま行",
  y: "や行",
  r: "ら行",
  w: "わ行",
}

export function findKana(column: string, vowel: VowelRow): Kana | undefined {
  return HIRAGANA.find((h) => h.column === column && h.vowel === vowel)
}

export function normalizeRomaji(input: string): string {
  return input.trim().toLowerCase()
}

/** Whether the given romaji input matches the kana (canonical or alternate spelling). */
export function isCorrectRomaji(kana: Kana, input: string): boolean {
  const normalized = normalizeRomaji(input)
  if (normalized.length === 0) return false
  return normalized === kana.romaji || kana.alternates.includes(normalized)
}

/** Fisher–Yates shuffle; `random` is injectable for tests. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export type SpeedBucket = "fast" | "medium" | "slow"

/** Answer-time thresholds for the summary heatmap: ≤2s green, ≤4s yellow, >4s red. */
export const SPEED_THRESHOLDS = { fastMs: 2000, mediumMs: 4000 } as const

export function speedBucket(timeMs: number): SpeedBucket {
  if (timeMs <= SPEED_THRESHOLDS.fastMs) return "fast"
  if (timeMs <= SPEED_THRESHOLDS.mediumMs) return "medium"
  return "slow"
}

export function formatSeconds(timeMs: number): string {
  return `${(timeMs / 1000).toFixed(1)}s`
}

export type KanaFont = "mincho" | "kyokasho"

export const FONT_LABELS: Record<KanaFont, string> = {
  mincho: "明朝体",
  kyokasho: "教科書体",
}

export function randomFont(random: () => number = Math.random): KanaFont {
  return random() < 0.5 ? "mincho" : "kyokasho"
}
