"use client"

import * as React from "react"
import { ArrowRight, Check, CircleStop, Play, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { SummaryHeatmap } from "@/components/practice/summary-heatmap"
import {
  FONT_LABELS,
  KANA_SETS,
  SET_LABELS,
  type KanaSet,
} from "@/lib/hiragana"
import { usePracticeStore } from "@/lib/practice-store"

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
    <div className="flex flex-1 items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">平假名練習</CardTitle>
          <CardDescription>
            選擇要練習的範圍，隨機出題。看字輸入羅馬拼音，
            完成後會依作答時間顯示成績總表。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <p className="font-mincho text-5xl tracking-widest text-muted-foreground">
            あいうえお
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {ALL_SETS.map((set) => (
              <Button
                key={set}
                size="sm"
                variant={selected.includes(set) ? "default" : "outline"}
                aria-pressed={selected.includes(set)}
                onClick={() => toggle(set)}
              >
                {selected.includes(set) && <Check data-icon="inline-start" />}
                {SET_LABELS[set]}（{KANA_SETS[set].length}）
              </Button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex-col items-center gap-1.5">
          <Button size="lg" disabled={deck.length === 0} onClick={() => start({ deck })}>
            <Play data-icon="inline-start" />
            開始練習（{deck.length} 題）
          </Button>
          {deck.length === 0 && (
            <p className="text-xs text-muted-foreground">請至少選擇一個範圍</p>
          )}
        </CardFooter>
      </Card>
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
    <div className="flex flex-1 items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>
              已回答 {answers.length} / {deck.length}
            </CardTitle>
            <Button variant="destructive" size="sm" onClick={endSession}>
              <CircleStop data-icon="inline-start" />
              結束 Session
            </Button>
          </div>
          <Progress value={answers.length} max={deck.length} className="mt-2" />
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <p
            lang="ja"
            data-testid="question-kana"
            className={`text-8xl leading-none ${font === "mincho" ? "font-mincho" : "font-kyokasho"}`}
          >
            {kana.kana}
          </p>

          {revealed && lastAnswer ? (
            <div
              role="status"
              className="flex flex-col items-center gap-2 text-center"
            >
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
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="輸入羅馬拼音…"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label="羅馬拼音"
              />
              <Button type="submit" disabled={input.trim().length === 0}>
                送出
              </Button>
            </form>
          )}
        </CardContent>
        {revealed && (
          <CardFooter className="justify-center">
            <form onSubmit={handleSubmit}>
              <Button type="submit" autoFocus>
                {currentIndex + 1 >= deck.length ? "看成績總表" : "下一題"}
                <ArrowRight data-icon="inline-end" />
              </Button>
            </form>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
