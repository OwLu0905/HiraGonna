export type VowelRow = "a" | "i" | "u" | "e" | "o"

export type KanaSet = "basic" | "voiced" | "contracted"

export const SET_LABELS: Record<KanaSet, string> = {
  basic: "清音",
  voiced: "濁音・半濁音",
  contracted: "拗音",
}

export interface Kana {
  kana: string
  /** Canonical Hepburn romaji, e.g. "shi" */
  romaji: string
  /** Other accepted spellings, e.g. Kunrei "si" */
  alternates: string[]
  /** Consonant column of its gojūon-style table ("" for the vowel column, "n-syllabic" for ん) */
  column: string
  /** Vowel row of its table (null for ん) */
  vowel: VowelRow | null
  set: KanaSet
}

const makeKana =
  (set: KanaSet) =>
  (
    kana: string,
    romaji: string,
    column: string,
    vowel: VowelRow | null,
    alternates: string[] = []
  ): Kana => ({ kana, romaji, alternates, column, vowel, set })

const k = makeKana("basic")

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

const v = makeKana("voiced")

/** The 25 voiced (濁音) and semi-voiced (半濁音) kana. */
export const VOICED: Kana[] = [
  v("が", "ga", "g", "a"),
  v("ぎ", "gi", "g", "i"),
  v("ぐ", "gu", "g", "u"),
  v("げ", "ge", "g", "e"),
  v("ご", "go", "g", "o"),
  v("ざ", "za", "z", "a"),
  v("じ", "ji", "z", "i", ["zi"]),
  v("ず", "zu", "z", "u"),
  v("ぜ", "ze", "z", "e"),
  v("ぞ", "zo", "z", "o"),
  v("だ", "da", "d", "a"),
  v("ぢ", "ji", "d", "i", ["di", "dji"]),
  v("づ", "zu", "d", "u", ["du", "dzu"]),
  v("で", "de", "d", "e"),
  v("ど", "do", "d", "o"),
  v("ば", "ba", "b", "a"),
  v("び", "bi", "b", "i"),
  v("ぶ", "bu", "b", "u"),
  v("べ", "be", "b", "e"),
  v("ぼ", "bo", "b", "o"),
  v("ぱ", "pa", "p", "a"),
  v("ぴ", "pi", "p", "i"),
  v("ぷ", "pu", "p", "u"),
  v("ぺ", "pe", "p", "e"),
  v("ぽ", "po", "p", "o"),
]

const c = makeKana("contracted")

/** The 33 contracted sounds (拗音), rows a / u / o only. */
export const CONTRACTED: Kana[] = [
  c("きゃ", "kya", "ky", "a"),
  c("きゅ", "kyu", "ky", "u"),
  c("きょ", "kyo", "ky", "o"),
  c("しゃ", "sha", "sh", "a", ["sya"]),
  c("しゅ", "shu", "sh", "u", ["syu"]),
  c("しょ", "sho", "sh", "o", ["syo"]),
  c("ちゃ", "cha", "ch", "a", ["tya", "cya"]),
  c("ちゅ", "chu", "ch", "u", ["tyu", "cyu"]),
  c("ちょ", "cho", "ch", "o", ["tyo", "cyo"]),
  c("にゃ", "nya", "ny", "a"),
  c("にゅ", "nyu", "ny", "u"),
  c("にょ", "nyo", "ny", "o"),
  c("ひゃ", "hya", "hy", "a"),
  c("ひゅ", "hyu", "hy", "u"),
  c("ひょ", "hyo", "hy", "o"),
  c("みゃ", "mya", "my", "a"),
  c("みゅ", "myu", "my", "u"),
  c("みょ", "myo", "my", "o"),
  c("りゃ", "rya", "ry", "a"),
  c("りゅ", "ryu", "ry", "u"),
  c("りょ", "ryo", "ry", "o"),
  c("ぎゃ", "gya", "gy", "a"),
  c("ぎゅ", "gyu", "gy", "u"),
  c("ぎょ", "gyo", "gy", "o"),
  c("じゃ", "ja", "j", "a", ["jya", "zya"]),
  c("じゅ", "ju", "j", "u", ["jyu", "zyu"]),
  c("じょ", "jo", "j", "o", ["jyo", "zyo"]),
  c("びゃ", "bya", "by", "a"),
  c("びゅ", "byu", "by", "u"),
  c("びょ", "byo", "by", "o"),
  c("ぴゃ", "pya", "py", "a"),
  c("ぴゅ", "pyu", "py", "u"),
  c("ぴょ", "pyo", "py", "o"),
]

export const KANA_SETS: Record<KanaSet, Kana[]> = {
  basic: HIRAGANA,
  voiced: VOICED,
  contracted: CONTRACTED,
}

export const ALL_KANA: Kana[] = [...HIRAGANA, ...VOICED, ...CONTRACTED]

/** Gojūon table axes: columns are consonant rows (行), rows are vowels (段). */
export const GOJUON_COLUMNS = ["", "k", "s", "t", "n", "h", "m", "y", "r", "w"] as const
export const GOJUON_VOWELS: VowelRow[] = ["a", "i", "u", "e", "o"]

export interface KanaGridDef {
  /** Column keys in display order, matching Kana.column. */
  columns: readonly string[]
  /** Header label per column. */
  headers: readonly string[]
  vowels: readonly VowelRow[]
  /** Append the syllabic ん as a trailing column (basic set only). */
  includeN: boolean
}

export const GRID_DEFS: Record<KanaSet, KanaGridDef> = {
  basic: {
    columns: GOJUON_COLUMNS,
    headers: ["a", "k", "s", "t", "n", "h", "m", "y", "r", "w"],
    vowels: GOJUON_VOWELS,
    includeN: true,
  },
  voiced: {
    columns: ["g", "z", "d", "b", "p"],
    headers: ["g", "z", "d", "b", "p"],
    vowels: GOJUON_VOWELS,
    includeN: false,
  },
  contracted: {
    columns: ["ky", "sh", "ch", "ny", "hy", "my", "ry", "gy", "j", "by", "py"],
    headers: ["ky", "sh", "ch", "ny", "hy", "my", "ry", "gy", "j", "by", "py"],
    vowels: ["a", "u", "o"],
    includeN: false,
  },
}

/** Looks up a kana by table position (columns are unique across all sets). */
export function findKana(column: string, vowel: VowelRow): Kana | undefined {
  return ALL_KANA.find((h) => h.column === column && h.vowel === vowel)
}

/** trim, fullwidth latin/digits → halfwidth, lowercase, katakana → hiragana. */
export function normalizeAnswer(input: string): string {
  return input
    .trim()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0xfee0)
    )
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
}

/**
 * Whether the input answers the kana: romaji (canonical or alternate spelling)
 * or the kana itself — flick-keyboard users type the kana directly, which
 * proves the same kana→sound mapping.
 */
export function isCorrectAnswer(kana: Kana, input: string): boolean {
  const normalized = normalizeAnswer(input)
  if (normalized.length === 0) return false
  return (
    normalized === kana.romaji ||
    kana.alternates.includes(normalized) ||
    normalized === kana.kana
  )
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

/**
 * Romaji choices for choice mode: the correct reading plus distractors,
 * preferring kana from the same column (行) or vowel row (段) since those are
 * the confusable ones. Returned shuffled; readings are unique.
 */
export function buildChoices(
  kana: Kana,
  count = 6,
  random: () => number = Math.random
): string[] {
  const pool = KANA_SETS[kana.set].filter((k) => k.romaji !== kana.romaji)
  const near = pool.filter(
    (k) =>
      k.column === kana.column || (k.vowel !== null && k.vowel === kana.vowel)
  )
  const far = pool.filter((k) => !near.includes(k))

  const distractors: string[] = []
  for (const candidate of [...shuffle(near, random), ...shuffle(far, random)]) {
    if (distractors.length >= count - 1) break
    if (!distractors.includes(candidate.romaji)) distractors.push(candidate.romaji)
  }
  return shuffle([kana.romaji, ...distractors], random)
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
