"use client"

import * as React from "react"
import { ArrowRight, Check, CircleStop, Play, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SummaryHeatmap } from "@/components/practice/summary-heatmap"
import {
  FONT_LABELS,
  KANA_SETS,
  SET_LABELS,
  type KanaSet,
} from "@/lib/hiragana"
import { usePracticeStore } from "@/lib/practice-store"
import { cn } from "@/lib/utils"

export function PracticeSession() {
  const phase = usePracticeStore((s) => s.phase)

  if (phase === "idle") return <StartScreen />
  if (phase === "summary") return <SummaryHeatmap />
  return <QuestionScreen />
}

const ALL_SETS = Object.keys(SET_LABELS) as KanaSet[]

function StartScreen() {
  const start = usePracticeStore((s) => s.start)
  const [selected, setSelected] = React.useState<KanaSet[]>(["basic"])

  const deck = ALL_SETS.filter((s) => selected.includes(s)).flatMap(
    (s) => KANA_SETS[s]
  )

  function toggle(set: KanaSet) {
    setSelected((prev) =>
      prev.includes(set) ? prev.filter((s) => s !== set) : [...prev, set]
    )
  }

  return (
    <div className="flex flex-1 justify-center pt-6 md:pt-14">
      <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <h1 className="font-mincho text-3xl font-semibold">平假名練習</h1>
          <p className="max-w-sm text-sm text-balance text-muted-foreground">
            選擇要練習的範圍，隨機出題。看字輸入羅馬拼音，
            完成後會依作答時間顯示成績總表。
          </p>
        </div>
        <p className="font-mincho text-6xl tracking-widest text-muted-foreground/70">
          あいうえお
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {ALL_SETS.map((set) => (
            <Button
              key={set}
              size="sm"
              variant={selected.includes(set) ? "default" : "secondary"}
              aria-pressed={selected.includes(set)}
              onClick={() => toggle(set)}
            >
              <Check
                data-icon="inline-start"
                className={cn(
                  "transition-[opacity,scale] duration-150",
                  selected.includes(set)
                    ? "scale-100 opacity-100"
                    : "scale-50 opacity-0",
                )}
              />
              {SET_LABELS[set]}（{KANA_SETS[set].length}）
            </Button>
          ))}
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <Button size="lg" disabled={deck.length === 0} onClick={() => start({ deck })}>
            <Play data-icon="inline-start" />
            開始練習（{deck.length} 題）
          </Button>
          {deck.length === 0 && (
            <p className="text-xs text-muted-foreground">請至少選擇一個範圍</p>
          )}
        </div>
      </div>
    </div>
  )
}

function QuestionScreen() {
  const phase = usePracticeStore((s) => s.phase)
  const deck = usePracticeStore((s) => s.deck)
  const fonts = usePracticeStore((s) => s.fonts)
  const currentIndex = usePracticeStore((s) => s.currentIndex)
  const answers = usePracticeStore((s) => s.answers)
  const submit = usePracticeStore((s) => s.submit)
  const next = usePracticeStore((s) => s.next)
  const endSession = usePracticeStore((s) => s.endSession)

  const [input, setInput] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const kana = deck[currentIndex]
  const font = fonts[currentIndex]
  const revealed = phase === "revealed"
  const lastAnswer = revealed ? answers[answers.length - 1] : undefined

  React.useEffect(() => {
    if (phase === "question") inputRef.current?.focus()
  }, [phase, currentIndex])

  function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault()
    if (revealed) {
      setInput("")
      next()
    } else if (input.trim().length > 0) {
      submit(input)
    }
  }

  if (!kana) return null

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground tabular-nums">
          已回答 {answers.length} / {deck.length}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={endSession}
        >
          <CircleStop data-icon="inline-start" />
          結束 Session
        </Button>
      </div>
      <div
        role="progressbar"
        aria-label="進度"
        aria-valuemin={0}
        aria-valuemax={deck.length}
        aria-valuenow={answers.length}
        className="mt-2 h-0.5 overflow-hidden rounded-full bg-border/70"
      >
        <div
          className="h-full rounded-full bg-vermillion transition-[width] duration-300"
          style={{ width: `${(answers.length / deck.length) * 100}%` }}
        />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-10 py-12">
        <p
          lang="ja"
          data-testid="question-kana"
          className={`text-8xl leading-none md:text-[7.5rem] ${font === "mincho" ? "font-mincho" : "font-kyokasho"}`}
        >
          {kana.kana}
        </p>

        {revealed && lastAnswer ? (
          <div role="status" className="flex flex-col items-center gap-3 text-center">
            {lastAnswer.correct ? (
              <Badge className="bg-[#0ca30c]/15 text-foreground">
                <Check aria-hidden className="text-[#0ca30c]" />
                答對了
              </Badge>
            ) : (
              <Badge variant="destructive">
                <X aria-hidden />
                答錯了（你輸入：{lastAnswer.input.trim() || "—"}）
              </Badge>
            )}
            <p className="text-2xl font-semibold">
              {kana.kana} = {kana.romaji}
              {kana.alternates.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  （也可以：{kana.alternates.join(", ")}）
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              字體：{FONT_LABELS[font]}
            </p>
            <form onSubmit={handleSubmit} className="mt-2">
              <Button type="submit" autoFocus>
                {currentIndex + 1 >= deck.length ? "看成績總表" : "下一題"}
                <ArrowRight data-icon="inline-end" />
              </Button>
            </form>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-60 flex-col items-center gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="輸入羅馬拼音…"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="羅馬拼音"
              className="h-10 rounded-none border-0 border-b border-input bg-transparent px-1 text-center text-lg focus-visible:border-vermillion focus-visible:ring-0 md:text-lg dark:bg-transparent"
            />
            <p className="text-xs text-muted-foreground">按 Enter 送出</p>
          </form>
        )}
      </div>
    </div>
  )
}
