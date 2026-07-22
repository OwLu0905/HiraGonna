import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { speedBucket } from "@/lib/hiragana"
import type { AnswerRecord } from "@/lib/practice-store"

export interface KanaResult {
  correct: boolean
  timeMs: number
  at: number
}

/** Per-kana cap; older results roll off. */
const MAX_RESULTS = 10

export interface HistoryState {
  /** Glyph → most-recent-first results (glyphs are unique within a script). */
  byKana: Record<string, KanaResult[]>
  record: (answer: AnswerRecord, at?: number) => void
  clear: () => void
}

/**
 * Cross-session answer history, persisted to localStorage. Read it only after
 * mount — the server render has no storage, and showing persisted data during
 * hydration would mismatch.
 */
export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      byKana: {},
      record: ({ kana, correct, timeMs }, at = Date.now()) =>
        set((state) => ({
          byKana: {
            ...state.byKana,
            [kana.kana]: [
              { correct, timeMs, at },
              ...(state.byKana[kana.kana] ?? []),
            ].slice(0, MAX_RESULTS),
          },
        })),
      clear: () => set({ byKana: {} }),
    }),
    {
      name: "hiragonna-history",
      storage: createJSONStorage(() => localStorage),
    }
  )
)

/** Weak = any of the last 3 attempts wrong, or their average time in the slow bucket. */
export function isWeak(results: KanaResult[]): boolean {
  if (results.length === 0) return false
  const recent = results.slice(0, 3)
  if (recent.some((r) => !r.correct)) return true
  const avgMs = recent.reduce((sum, r) => sum + r.timeMs, 0) / recent.length
  return speedBucket(avgMs) === "slow"
}

/** Glyphs currently worth re-practicing, across both scripts. */
export function weakGlyphs(byKana: Record<string, KanaResult[]>): string[] {
  return Object.keys(byKana).filter((glyph) => isWeak(byKana[glyph]))
}
