import { create } from "zustand"

import {
  HIRAGANA,
  isCorrectRomaji,
  randomFont,
  shuffle,
  speedBucket,
  type Kana,
  type KanaFont,
} from "@/lib/hiragana"

export type PracticePhase = "idle" | "question" | "revealed" | "summary"

export interface AnswerRecord {
  kana: Kana
  input: string
  correct: boolean
  /** Time from the question being shown until submit (reveal time excluded). */
  timeMs: number
  font: KanaFont
}

export interface PracticeState {
  phase: PracticePhase
  deck: Kana[]
  /** Per-question display font, fixed when the session starts. */
  fonts: KanaFont[]
  currentIndex: number
  answers: AnswerRecord[]
  /** Timestamp when the current question was shown; null outside "question". */
  questionShownAt: number | null

  /** Starts a session over `deck` (defaults to all 46), shuffled. */
  start: (options?: { random?: () => number; now?: number; deck?: Kana[] }) => void
  submit: (input: string, now?: number) => void
  next: (now?: number) => void
  endSession: () => void
  reset: () => void
}

/** Kana worth re-practicing: answered wrong, or in the slow (red) bucket. */
export function weakKanaFrom(answers: AnswerRecord[]): Kana[] {
  return answers
    .filter((a) => !a.correct || speedBucket(a.timeMs) === "slow")
    .map((a) => a.kana)
}

export const usePracticeStore = create<PracticeState>()((set, get) => ({
  phase: "idle",
  deck: [],
  fonts: [],
  currentIndex: 0,
  answers: [],
  questionShownAt: null,

  start: ({ random = Math.random, now = Date.now(), deck: source = HIRAGANA } = {}) => {
    if (source.length === 0) return
    const deck = shuffle(source, random)
    set({
      phase: "question",
      deck,
      fonts: deck.map(() => randomFont(random)),
      currentIndex: 0,
      answers: [],
      questionShownAt: now,
    })
  },

  submit: (input, now = Date.now()) => {
    const { phase, deck, fonts, currentIndex, answers, questionShownAt } = get()
    if (phase !== "question" || questionShownAt === null) return
    const kana = deck[currentIndex]
    set({
      phase: "revealed",
      answers: [
        ...answers,
        {
          kana,
          input,
          correct: isCorrectRomaji(kana, input),
          timeMs: now - questionShownAt,
          font: fonts[currentIndex],
        },
      ],
      questionShownAt: null,
    })
  },

  next: (now = Date.now()) => {
    const { phase, deck, currentIndex } = get()
    if (phase !== "revealed") return
    if (currentIndex + 1 >= deck.length) {
      set({ phase: "summary", questionShownAt: null })
    } else {
      set({ phase: "question", currentIndex: currentIndex + 1, questionShownAt: now })
    }
  },

  endSession: () => {
    const { phase, answers } = get()
    if (phase !== "question" && phase !== "revealed") return
    set(
      answers.length > 0
        ? { phase: "summary", questionShownAt: null }
        : { phase: "idle", deck: [], fonts: [], currentIndex: 0, questionShownAt: null }
    )
  },

  reset: () => {
    set({
      phase: "idle",
      deck: [],
      fonts: [],
      currentIndex: 0,
      answers: [],
      questionShownAt: null,
    })
  },
}))
