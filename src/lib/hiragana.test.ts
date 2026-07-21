import { describe, expect, test } from "vitest"

import {
  ALL_KANA,
  buildChoices,
  CONTRACTED,
  findKana,
  formatSeconds,
  GOJUON_COLUMNS,
  GOJUON_VOWELS,
  GRID_DEFS,
  HIRAGANA,
  isCorrectAnswer,
  KATAKANA_SETS,
  normalizeAnswer,
  randomFont,
  shuffle,
  speedBucket,
  toKatakana,
  VOICED,
} from "@/lib/hiragana"

describe("HIRAGANA data", () => {
  test("contains exactly 46 kana", () => {
    expect(HIRAGANA).toHaveLength(46)
  })

  test("kana and romaji are unique", () => {
    expect(new Set(HIRAGANA.map((h) => h.kana)).size).toBe(46)
    expect(new Set(HIRAGANA.map((h) => h.romaji)).size).toBe(46)
  })

  test("gojūon grid positions plus ん cover all 46", () => {
    const gridKana = GOJUON_COLUMNS.flatMap((column) =>
      GOJUON_VOWELS.map((vowel) => findKana(column, vowel))
    ).filter((k) => k !== undefined)
    expect(gridKana).toHaveLength(45)
    expect(HIRAGANA.filter((h) => h.column === "n-syllabic")).toHaveLength(1)
  })

  test("や行 only has ya/yu/yo and わ行 only has wa/wo", () => {
    expect(findKana("y", "i")).toBeUndefined()
    expect(findKana("y", "e")).toBeUndefined()
    expect(findKana("w", "i")).toBeUndefined()
    expect(findKana("w", "u")).toBeUndefined()
    expect(findKana("w", "e")).toBeUndefined()
    expect(findKana("y", "a")?.kana).toBe("や")
    expect(findKana("w", "o")?.kana).toBe("を")
  })
})

describe("KATAKANA data (derived from hiragana)", () => {
  test("toKatakana shifts hiragana to katakana, including small kana", () => {
    expect(toKatakana("あ")).toBe("ア")
    expect(toKatakana("きゃ")).toBe("キャ")
    expect(toKatakana("shi")).toBe("shi")
  })

  test("mirrors hiragana sets glyph-for-glyph with the same readings", () => {
    expect(KATAKANA_SETS.basic).toHaveLength(46)
    expect(KATAKANA_SETS.voiced).toHaveLength(25)
    expect(KATAKANA_SETS.contracted).toHaveLength(33)
    const shi = KATAKANA_SETS.basic.find((k) => k.kana === "シ")!
    expect(shi.romaji).toBe("shi")
    expect(shi.script).toBe("katakana")
    expect(shi.column).toBe("s")
  })

  test("findKana resolves katakana table positions", () => {
    expect(findKana("y", "a", "katakana")?.kana).toBe("ヤ")
    expect(findKana("", "a", "katakana")?.kana).toBe("ア")
    expect(findKana("y", "i", "katakana")).toBeUndefined()
  })

  test("katakana questions accept romaji, katakana, or hiragana input", () => {
    const shi = KATAKANA_SETS.basic.find((k) => k.kana === "シ")!
    expect(isCorrectAnswer(shi, "shi")).toBe(true)
    expect(isCorrectAnswer(shi, "シ")).toBe(true)
    expect(isCorrectAnswer(shi, "し")).toBe(true)
    expect(isCorrectAnswer(shi, "chi")).toBe(false)
  })
})

describe("VOICED and CONTRACTED data", () => {
  test("25 voiced/semi-voiced and 33 contracted kana", () => {
    expect(VOICED).toHaveLength(25)
    expect(CONTRACTED).toHaveLength(33)
  })

  test("kana are unique across all sets", () => {
    expect(new Set(ALL_KANA.map((k) => k.kana)).size).toBe(ALL_KANA.length)
  })

  test("every grid position resolves within its own set", () => {
    for (const [set, def] of Object.entries(GRID_DEFS)) {
      for (const column of def.columns) {
        for (const vowel of def.vowels) {
          const kana = findKana(column, vowel)
          if (kana) expect(kana.set).toBe(set)
        }
      }
    }
    // Grids (plus ん) cover every kana exactly once.
    const covered = Object.values(GRID_DEFS).flatMap((def) =>
      def.columns.flatMap((column) =>
        def.vowels.map((vowel) => findKana(column, vowel))
      )
    ).filter((kana) => kana !== undefined)
    expect(covered).toHaveLength(ALL_KANA.length - 1)
  })

  test("contracted grid only has a/u/o rows", () => {
    expect(GRID_DEFS.contracted.vowels).toEqual(["a", "u", "o"])
    expect(CONTRACTED.every((k) => ["a", "u", "o"].includes(k.vowel!))).toBe(true)
  })

  test("voiced homophones accept IME spellings", () => {
    const di = VOICED.find((k) => k.kana === "ぢ")!
    const du = VOICED.find((k) => k.kana === "づ")!
    expect(isCorrectAnswer(di, "ji")).toBe(true)
    expect(isCorrectAnswer(di, "di")).toBe(true)
    expect(isCorrectAnswer(du, "zu")).toBe(true)
    expect(isCorrectAnswer(du, "du")).toBe(true)
  })

  test("contracted sounds accept Kunrei/IME spellings", () => {
    const ja = CONTRACTED.find((k) => k.kana === "じゃ")!
    const sha = CONTRACTED.find((k) => k.kana === "しゃ")!
    const cha = CONTRACTED.find((k) => k.kana === "ちゃ")!
    expect(isCorrectAnswer(ja, "ja")).toBe(true)
    expect(isCorrectAnswer(ja, "zya")).toBe(true)
    expect(isCorrectAnswer(ja, "jya")).toBe(true)
    expect(isCorrectAnswer(sha, "sya")).toBe(true)
    expect(isCorrectAnswer(cha, "tya")).toBe(true)
  })
})

describe("isCorrectAnswer", () => {
  const shi = HIRAGANA.find((h) => h.kana === "し")!
  const a = HIRAGANA.find((h) => h.kana === "あ")!
  const n = HIRAGANA.find((h) => h.kana === "ん")!

  test("accepts the canonical spelling", () => {
    expect(isCorrectAnswer(shi, "shi")).toBe(true)
    expect(isCorrectAnswer(a, "a")).toBe(true)
  })

  test("accepts alternate spellings (Kunrei-shiki etc.)", () => {
    expect(isCorrectAnswer(shi, "si")).toBe(true)
    expect(isCorrectAnswer(n, "nn")).toBe(true)
    expect(isCorrectAnswer(HIRAGANA.find((h) => h.kana === "ふ")!, "hu")).toBe(true)
  })

  test("ignores case and surrounding whitespace", () => {
    expect(isCorrectAnswer(shi, "  SHI ")).toBe(true)
  })

  test("rejects wrong or empty input", () => {
    expect(isCorrectAnswer(shi, "chi")).toBe(false)
    expect(isCorrectAnswer(shi, "")).toBe(false)
    expect(isCorrectAnswer(shi, "   ")).toBe(false)
  })

  test("accepts the kana itself (flick-keyboard input)", () => {
    expect(isCorrectAnswer(shi, "し")).toBe(true)
    expect(isCorrectAnswer(a, "あ")).toBe(true)
    expect(isCorrectAnswer(shi, "ち")).toBe(false)
  })

  test("accepts katakana via normalization", () => {
    expect(isCorrectAnswer(shi, "シ")).toBe(true)
  })

  test("accepts fullwidth latin via normalization", () => {
    expect(isCorrectAnswer(shi, "ｓｈｉ")).toBe(true)
    expect(isCorrectAnswer(shi, "ＳＨＩ")).toBe(true)
  })
})

describe("normalizeAnswer", () => {
  test("trims, lowercases, and converts fullwidth latin", () => {
    expect(normalizeAnswer(" ＦＵ ")).toBe("fu")
  })

  test("converts katakana to hiragana", () => {
    expect(normalizeAnswer("キャ")).toBe("きゃ")
  })
})

describe("buildChoices", () => {
  const shi = HIRAGANA.find((h) => h.kana === "し")!

  test("returns unique choices including the correct reading", () => {
    const choices = buildChoices(shi, 6)
    expect(choices).toHaveLength(6)
    expect(new Set(choices).size).toBe(6)
    expect(choices).toContain("shi")
  })

  test("all choices are readings from the same kana set", () => {
    const readings = new Set(HIRAGANA.map((k) => k.romaji))
    for (const c of buildChoices(shi, 6)) {
      expect(readings.has(c)).toBe(true)
    }
  })

  test("is deterministic with an injected random", () => {
    const fixed = () => 0.42
    expect(buildChoices(shi, 6, fixed)).toEqual(buildChoices(shi, 6, fixed))
  })
})

describe("shuffle", () => {
  test("keeps all elements and does not mutate the input", () => {
    const original = [...HIRAGANA]
    const shuffled = shuffle(HIRAGANA)
    expect(HIRAGANA).toEqual(original)
    expect(shuffled).toHaveLength(46)
    expect(new Set(shuffled.map((h) => h.kana)).size).toBe(46)
  })

  test("is deterministic given an injected random source", () => {
    let seed = 0
    const rng = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }
    const a = shuffle([1, 2, 3, 4, 5], rng)
    seed = 0
    const b = shuffle([1, 2, 3, 4, 5], rng)
    expect(a).toEqual(b)
    expect(a).not.toEqual([1, 2, 3, 4, 5])
  })
})

describe("speedBucket (heatmap thresholds)", () => {
  test("≤2s is fast (green)", () => {
    expect(speedBucket(0)).toBe("fast")
    expect(speedBucket(2000)).toBe("fast")
  })

  test("2–4s is medium (yellow)", () => {
    expect(speedBucket(2001)).toBe("medium")
    expect(speedBucket(4000)).toBe("medium")
  })

  test(">4s is slow (red)", () => {
    expect(speedBucket(4001)).toBe("slow")
    expect(speedBucket(60000)).toBe("slow")
  })
})

describe("helpers", () => {
  test("formatSeconds renders one decimal place", () => {
    expect(formatSeconds(1234)).toBe("1.2s")
    expect(formatSeconds(0)).toBe("0.0s")
  })

  test("randomFont maps the random source to both fonts", () => {
    expect(randomFont(() => 0.1)).toBe("mincho")
    expect(randomFont(() => 0.9)).toBe("kyokasho")
  })
})
