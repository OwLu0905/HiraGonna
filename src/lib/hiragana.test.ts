import { describe, expect, test } from "vitest"

import {
  findKana,
  formatSeconds,
  GOJUON_COLUMNS,
  GOJUON_VOWELS,
  HIRAGANA,
  isCorrectRomaji,
  randomFont,
  shuffle,
  speedBucket,
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

describe("isCorrectRomaji", () => {
  const shi = HIRAGANA.find((h) => h.kana === "し")!
  const a = HIRAGANA.find((h) => h.kana === "あ")!
  const n = HIRAGANA.find((h) => h.kana === "ん")!

  test("accepts the canonical spelling", () => {
    expect(isCorrectRomaji(shi, "shi")).toBe(true)
    expect(isCorrectRomaji(a, "a")).toBe(true)
  })

  test("accepts alternate spellings (Kunrei-shiki etc.)", () => {
    expect(isCorrectRomaji(shi, "si")).toBe(true)
    expect(isCorrectRomaji(n, "nn")).toBe(true)
    expect(isCorrectRomaji(HIRAGANA.find((h) => h.kana === "ふ")!, "hu")).toBe(true)
  })

  test("ignores case and surrounding whitespace", () => {
    expect(isCorrectRomaji(shi, "  SHI ")).toBe(true)
  })

  test("rejects wrong or empty input", () => {
    expect(isCorrectRomaji(shi, "chi")).toBe(false)
    expect(isCorrectRomaji(shi, "")).toBe(false)
    expect(isCorrectRomaji(shi, "   ")).toBe(false)
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
