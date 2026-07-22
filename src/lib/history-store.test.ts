import { beforeEach, describe, expect, test } from "vitest"

import { HIRAGANA } from "@/lib/hiragana"
import { isWeak, useHistoryStore, weakGlyphs, type KanaResult } from "@/lib/history-store"
import type { AnswerRecord } from "@/lib/practice-store"

const a = HIRAGANA.find((k) => k.kana === "あ")!

function answer(overrides: Partial<AnswerRecord> = {}): AnswerRecord {
  return { kana: a, input: "a", correct: true, timeMs: 1000, font: "mincho", ...overrides }
}

beforeEach(() => {
  useHistoryStore.getState().clear()
})

describe("useHistoryStore", () => {
  test("records answers most-recent-first under the kana glyph", () => {
    useHistoryStore.getState().record(answer({ timeMs: 1000 }), 10)
    useHistoryStore.getState().record(answer({ timeMs: 2000, correct: false }), 20)

    const results = useHistoryStore.getState().byKana["あ"]
    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({ correct: false, timeMs: 2000, at: 20 })
    expect(results[1]).toEqual({ correct: true, timeMs: 1000, at: 10 })
  })

  test("caps stored results at 10 per kana", () => {
    for (let i = 0; i < 12; i++) {
      useHistoryStore.getState().record(answer({ timeMs: i }), i)
    }
    const results = useHistoryStore.getState().byKana["あ"]
    expect(results).toHaveLength(10)
    expect(results[0].timeMs).toBe(11)
    expect(results[9].timeMs).toBe(2)
  })

  test("persists to localStorage", () => {
    useHistoryStore.getState().record(answer(), 10)
    const raw = localStorage.getItem("hiragonna-history")
    expect(raw).toContain("あ")
  })
})

describe("isWeak", () => {
  const result = (overrides: Partial<KanaResult> = {}): KanaResult => ({
    correct: true,
    timeMs: 1000,
    at: 0,
    ...overrides,
  })

  test("no history is not weak", () => {
    expect(isWeak([])).toBe(false)
  })

  test("a wrong answer in the last 3 attempts is weak", () => {
    expect(isWeak([result(), result({ correct: false }), result()])).toBe(true)
  })

  test("an old wrong answer beyond the last 3 is forgiven", () => {
    expect(
      isWeak([result(), result(), result(), result({ correct: false })])
    ).toBe(false)
  })

  test("slow average over the last 3 attempts is weak", () => {
    // (11000 + 1000 + 1000) / 3 ≈ 4333ms > the 4000ms slow threshold.
    expect(isWeak([result({ timeMs: 11000 }), result(), result()])).toBe(true)
    expect(isWeak([result(), result(), result()])).toBe(false)
  })
})

describe("weakGlyphs", () => {
  test("returns only glyphs whose recent history is weak", () => {
    const fast: KanaResult = { correct: true, timeMs: 1000, at: 0 }
    const wrong: KanaResult = { correct: false, timeMs: 1000, at: 0 }
    expect(weakGlyphs({ あ: [fast], い: [wrong], ア: [wrong] })).toEqual(["い", "ア"])
  })
})
