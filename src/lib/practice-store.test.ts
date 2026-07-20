import { beforeEach, describe, expect, test } from "vitest"

import { HIRAGANA } from "@/lib/hiragana"
import {
  usePracticeStore,
  weakKanaFrom,
  type AnswerRecord,
} from "@/lib/practice-store"

const store = usePracticeStore

/** Deterministic rng so deck order and fonts are stable across a test. */
const fixedRng = () => 0.42

beforeEach(() => {
  store.getState().reset()
})

describe("start", () => {
  test("deals a full shuffled deck and shows the first question", () => {
    store.getState().start({ random: fixedRng, now: 1000 })
    const s = store.getState()
    expect(s.phase).toBe("question")
    expect(s.deck).toHaveLength(46)
    expect(new Set(s.deck.map((k) => k.kana)).size).toBe(46)
    expect(s.fonts).toHaveLength(46)
    expect(s.currentIndex).toBe(0)
    expect(s.answers).toEqual([])
    expect(s.questionShownAt).toBe(1000)
  })
})

describe("start with a custom deck (weak-point review)", () => {
  test("uses only the given kana, shuffled", () => {
    const weak = HIRAGANA.slice(0, 5)
    store.getState().start({ random: fixedRng, now: 0, deck: weak })
    const s = store.getState()
    expect(s.deck).toHaveLength(5)
    expect(new Set(s.deck.map((k) => k.kana))).toEqual(
      new Set(weak.map((k) => k.kana))
    )
    expect(s.fonts).toHaveLength(5)
  })

  test("an empty deck does not start a session", () => {
    store.getState().start({ deck: [] })
    expect(store.getState().phase).toBe("idle")
  })

  test("completing a short deck reaches the summary", () => {
    store.getState().start({ random: fixedRng, now: 0, deck: HIRAGANA.slice(0, 2) })
    store.getState().submit("a", 10)
    store.getState().next(20)
    store.getState().submit("a", 30)
    store.getState().next(40)
    expect(store.getState().phase).toBe("summary")
    expect(store.getState().answers).toHaveLength(2)
  })
})

describe("weakKanaFrom", () => {
  const record = (
    kana: (typeof HIRAGANA)[number],
    correct: boolean,
    timeMs: number
  ): AnswerRecord => ({ kana, input: "x", correct, timeMs, font: "mincho" })

  test("collects wrong answers and slow (red bucket) answers", () => {
    const answers = [
      record(HIRAGANA[0], true, 1000), // fast + correct → not weak
      record(HIRAGANA[1], false, 1000), // wrong → weak
      record(HIRAGANA[2], true, 5000), // slow → weak
      record(HIRAGANA[3], true, 3000), // medium + correct → not weak
    ]
    expect(weakKanaFrom(answers).map((k) => k.kana)).toEqual([
      HIRAGANA[1].kana,
      HIRAGANA[2].kana,
    ])
  })

  test("returns empty when everything was fast and correct", () => {
    expect(weakKanaFrom([record(HIRAGANA[0], true, 500)])).toEqual([])
  })
})

describe("submit", () => {
  test("records the answer with the question→submit duration", () => {
    store.getState().start({ random: fixedRng, now: 1000 })
    const kana = store.getState().deck[0]
    store.getState().submit(kana.romaji, 3500)

    const s = store.getState()
    expect(s.phase).toBe("revealed")
    expect(s.answers).toHaveLength(1)
    expect(s.answers[0].correct).toBe(true)
    expect(s.answers[0].timeMs).toBe(2500)
    expect(s.answers[0].kana).toEqual(kana)
  })

  test("marks wrong input as incorrect", () => {
    store.getState().start({ random: fixedRng, now: 0 })
    store.getState().submit("definitely-wrong", 100)
    expect(store.getState().answers[0].correct).toBe(false)
  })

  test("does nothing outside the question phase", () => {
    store.getState().start({ random: fixedRng, now: 0 })
    store.getState().submit("a", 100)
    store.getState().submit("a", 200)
    expect(store.getState().answers).toHaveLength(1)
  })
})

describe("next / timing between questions", () => {
  test("advances and restarts the timer at the new question, excluding reveal time", () => {
    store.getState().start({ random: fixedRng, now: 1000 })
    store.getState().submit("x", 2000)
    // 8 seconds pass while the answer is shown — must NOT count.
    store.getState().next(10000)

    const s = store.getState()
    expect(s.phase).toBe("question")
    expect(s.currentIndex).toBe(1)
    expect(s.questionShownAt).toBe(10000)

    store.getState().submit("y", 11500)
    expect(store.getState().answers[1].timeMs).toBe(1500)
  })

  test("does nothing while a question is still open", () => {
    store.getState().start({ random: fixedRng, now: 0 })
    store.getState().next(50)
    expect(store.getState().currentIndex).toBe(0)
    expect(store.getState().phase).toBe("question")
  })

  test("after the 46th answer, next moves to the summary", () => {
    store.getState().start({ random: fixedRng, now: 0 })
    for (let i = 0; i < HIRAGANA.length; i++) {
      store.getState().submit("a", i * 10 + 5)
      store.getState().next(i * 10 + 10)
    }
    const s = store.getState()
    expect(s.phase).toBe("summary")
    expect(s.answers).toHaveLength(46)
  })
})

describe("endSession", () => {
  test("with answered questions, jumps to the summary", () => {
    store.getState().start({ random: fixedRng, now: 0 })
    store.getState().submit("a", 100)
    store.getState().endSession()
    expect(store.getState().phase).toBe("summary")
    expect(store.getState().answers).toHaveLength(1)
  })

  test("with nothing answered, returns to idle", () => {
    store.getState().start({ random: fixedRng, now: 0 })
    store.getState().endSession()
    expect(store.getState().phase).toBe("idle")
    expect(store.getState().deck).toEqual([])
  })
})

describe("reset", () => {
  test("clears everything back to idle", () => {
    store.getState().start({ random: fixedRng, now: 0 })
    store.getState().submit("a", 100)
    store.getState().reset()
    const s = store.getState()
    expect(s.phase).toBe("idle")
    expect(s.answers).toEqual([])
    expect(s.deck).toEqual([])
  })
})
