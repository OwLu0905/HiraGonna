"use client"

import { Crosshair, RotateCcw, X } from "lucide-react"

import { KanaGrid } from "@/components/kana-grid"
import { Button } from "@/components/ui/button"
import {
  formatSeconds,
  SET_LABELS,
  speedBucket,
  SPEED_THRESHOLDS,
  type KanaSet,
  type SpeedBucket,
} from "@/lib/hiragana"
import {
  usePracticeStore,
  weakKanaFrom,
  type AnswerRecord,
} from "@/lib/practice-store"
import { cn } from "@/lib/utils"

/* Status palette (semantic tokens), used as tinted cell fills.
   Time text + the ✗ marker carry the meaning alongside color. */
const BUCKET_STYLES: Record<SpeedBucket, string> = {
  fast: "bg-success/20",
  medium: "bg-warning/25",
  slow: "bg-destructive/20",
}

const BUCKET_LABELS: Record<SpeedBucket, string> = {
  fast: `≤ ${SPEED_THRESHOLDS.fastMs / 1000}s`,
  medium: `${SPEED_THRESHOLDS.fastMs / 1000}–${SPEED_THRESHOLDS.mediumMs / 1000}s`,
  slow: `> ${SPEED_THRESHOLDS.mediumMs / 1000}s`,
}

export function SummaryHeatmap() {
  const deck = usePracticeStore((s) => s.deck)
  const answers = usePracticeStore((s) => s.answers)
  const start = usePracticeStore((s) => s.start)
  const reset = usePracticeStore((s) => s.reset)

  const script = deck[0]?.script ?? "hiragana"
  const byKana = new Map<string, AnswerRecord>(
    answers.map((a) => [a.kana.kana, a])
  )
  const correctCount = answers.filter((a) => a.correct).length
  const weakKana = weakKanaFrom(answers)
  const sets = (Object.keys(SET_LABELS) as KanaSet[]).filter((set) =>
    deck.some((k) => k.set === set)
  )
  const totalMs = answers.reduce((sum, a) => sum + a.timeMs, 0)
  const avgMs = answers.length > 0 ? totalMs / answers.length : 0

  return (
    <div className="flex flex-1 justify-center">
      <div className="flex w-full max-w-4xl flex-col gap-6">
        <header className="flex flex-col gap-1.5">
          <h1 className="font-mincho text-2xl font-semibold">成績總表</h1>
          <p className="text-sm text-muted-foreground">
            顏色代表每個字的作答時間（顯示題目到送出）。
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="已作答" value={`${answers.length} / ${deck.length}`} />
            <Stat
              label="答對"
              value={`${correctCount} / ${answers.length}`}
              data-testid="stat-correct"
            />
            <Stat label="平均時間" value={formatSeconds(avgMs)} />
            <Stat label="總時間" value={formatSeconds(totalMs)} />
          </dl>
        </header>
        <div className="flex flex-col gap-4">
          {sets.map((set) => (
            <section key={set} className="flex flex-col gap-1.5">
              {sets.length > 1 && (
                <h3 className="text-sm font-medium text-muted-foreground">
                  {SET_LABELS[set]}
                </h3>
              )}
              <KanaGrid
                set={set}
                script={script}
                renderKana={(kana) => {
                  const answer = byKana.get(kana.kana)
                  return <HeatmapCell kana={kana.kana} answer={answer} />
                }}
              />
            </section>
          ))}
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {(Object.keys(BUCKET_STYLES) as SpeedBucket[]).map((bucket) => (
              <li key={bucket} className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className={cn("size-3 rounded-sm", BUCKET_STYLES[bucket])}
                />
                {BUCKET_LABELS[bucket]}
              </li>
            ))}
            <li className="flex items-center gap-1.5">
              <X aria-hidden className="size-3 text-destructive" />
              答錯
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="size-3 rounded-sm bg-muted" />
              未作答
            </li>
          </ul>
        </div>
        <footer className="flex flex-wrap gap-2">
          {weakKana.length > 0 && (
            <Button onClick={() => start({ deck: weakKana })}>
              <Crosshair data-icon="inline-start" />
              只練弱點（{weakKana.length}）
            </Button>
          )}
          {/* Re-practice the same deck (start() would fall back to hiragana). */}
          <Button
            variant={weakKana.length > 0 ? "secondary" : "default"}
            onClick={() => start({ deck })}
          >
            <RotateCcw data-icon="inline-start" />
            再練習一次
          </Button>
          <Button variant="ghost" onClick={reset}>
            回到開始
          </Button>
        </footer>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  ...props
}: { label: string; value: string } & React.ComponentProps<"div">) {
  return (
    <div {...props}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

function HeatmapCell({
  kana,
  answer,
}: {
  kana: string
  answer: AnswerRecord | undefined
}) {
  return (
    <div
      data-testid={`heatmap-${kana}`}
      data-bucket={answer ? speedBucket(answer.timeMs) : "none"}
      className={cn(
        "relative flex flex-col items-center gap-0.5 rounded-md px-1 py-2",
        answer
          ? BUCKET_STYLES[speedBucket(answer.timeMs)]
          : "bg-muted text-muted-foreground"
      )}
    >
      {answer && !answer.correct && (
        <span className="absolute top-0.5 right-0.5 text-destructive">
          <X aria-hidden className="size-3.5" />
          <span className="sr-only">答錯</span>
        </span>
      )}
      <span lang="ja" className="text-xl leading-none">
        {kana}
      </span>
      <span className="text-2xs text-muted-foreground tabular-nums">
        {answer ? formatSeconds(answer.timeMs) : "—"}
      </span>
    </div>
  )
}
