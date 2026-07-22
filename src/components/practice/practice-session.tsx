"use client";

import * as React from "react";
import { ArrowRight, Check, CircleStop, Crosshair, Play, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { SummaryHeatmap } from "@/components/practice/summary-heatmap";
import {
  kanaByGlyph,
  SCRIPT_LABELS,
  SCRIPT_SETS,
  SET_LABELS,
  type KanaSet,
  type Script,
} from "@/lib/hiragana";
import { useHistoryStore, weakGlyphs } from "@/lib/history-store";
import { usePracticeStore, type PracticeMode } from "@/lib/practice-store";
import { cn } from "@/lib/utils";

const MODE_LABELS: Record<PracticeMode, string> = {
  typing: "輸入模式",
  choice: "選擇模式",
};

export function PracticeSession({
  script = "hiragana",
}: {
  script?: Script;
}) {
  const phase = usePracticeStore((s) => s.phase);

  if (phase === "idle") return <StartScreen script={script} />;
  if (phase === "summary") return <SummaryHeatmap />;
  return <QuestionScreen />;
}

const ALL_SETS = Object.keys(SET_LABELS) as KanaSet[];

const SCRIPT_SAMPLES: Record<Script, string> = {
  hiragana: "あいうえお",
  katakana: "アイウエオ",
};

const subscribeNoop = () => () => {};

function StartScreen({ script }: { script: Script }) {
  const start = usePracticeStore((s) => s.start);
  const byKana = useHistoryStore((s) => s.byKana);
  const [selected, setSelected] = React.useState<KanaSet[]>(["basic"]);
  const [mode, setMode] = React.useState<PracticeMode>(
    () => usePracticeStore.getState().mode,
  );

  // History lives in localStorage; render it only after hydration so the
  // first client render matches the (storage-less) server render.
  const hydrated = React.useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const weakDeck = hydrated
    ? weakGlyphs(byKana)
        .map((glyph) => kanaByGlyph(glyph, script))
        .filter((kana) => kana !== undefined)
    : [];

  const kanaSets = SCRIPT_SETS[script];
  const availableSets = ALL_SETS.filter((s) => kanaSets[s].length > 0);
  const deck = availableSets
    .filter((s) => selected.includes(s))
    .flatMap((s) => kanaSets[s]);

  function toggle(set: KanaSet) {
    setSelected((prev) =>
      prev.includes(set) ? prev.filter((s) => s !== set) : [...prev, set],
    );
  }

  return (
    <div className="flex flex-1 justify-center pt-6 md:pt-14">
      <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <h1 className="font-mincho text-3xl font-semibold">
            {SCRIPT_LABELS[script]}練習
          </h1>
          <p className="max-w-sm text-sm text-balance text-muted-foreground">
            選擇要練習的範圍，隨機出題。看字輸入羅馬拼音，
            完成後會依作答時間顯示成績總表。
          </p>
        </div>
        <p className="font-mincho text-6xl tracking-widest text-muted-foreground/70">
          {SCRIPT_SAMPLES[script]}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {availableSets.map((set) => (
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
              {SET_LABELS[set]}（{kanaSets[set].length}）
            </Button>
          ))}
        </div>
        <div
          role="group"
          aria-label="作答模式"
          className="flex items-center gap-1"
        >
          {(Object.keys(MODE_LABELS) as PracticeMode[]).map((m) => (
            <Button
              key={m}
              size="sm"
              variant={mode === m ? "secondary" : "ghost"}
              className={cn(mode !== m && "text-muted-foreground")}
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
            >
              {MODE_LABELS[m]}
            </Button>
          ))}
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              size="lg"
              disabled={deck.length === 0}
              onClick={() => start({ deck, mode })}
            >
              <Play data-icon="inline-start" />
              開始練習（{deck.length} 題）
            </Button>
            {weakDeck.length > 0 && (
              <Button
                size="lg"
                variant="secondary"
                onClick={() => start({ deck: weakDeck, mode })}
              >
                <Crosshair data-icon="inline-start" />
                練歷史弱點（{weakDeck.length}）
              </Button>
            )}
          </div>
          {deck.length === 0 && (
            <p className="text-xs text-muted-foreground">請至少選擇一個範圍</p>
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionScreen() {
  const phase = usePracticeStore((s) => s.phase);
  const mode = usePracticeStore((s) => s.mode);
  const deck = usePracticeStore((s) => s.deck);
  const fonts = usePracticeStore((s) => s.fonts);
  const choices = usePracticeStore((s) => s.choices);
  const currentIndex = usePracticeStore((s) => s.currentIndex);
  const answers = usePracticeStore((s) => s.answers);
  const submit = usePracticeStore((s) => s.submit);
  const next = usePracticeStore((s) => s.next);
  const endSession = usePracticeStore((s) => s.endSession);

  const [input, setInput] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const kana = deck[currentIndex];
  const font = fonts[currentIndex];
  const choiceList = choices[currentIndex] ?? [];
  const revealed = phase === "revealed";
  const lastAnswer = revealed ? answers[answers.length - 1] : undefined;

  React.useEffect(() => {
    if (phase === "question" && mode === "typing") inputRef.current?.focus();
  }, [phase, mode, currentIndex]);

  function advance() {
    setInput("");
    next();
  }

  function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();
    if (revealed) {
      advance();
    } else if (input.trim().length > 0) {
      submit(input);
    }
  }

  if (!kana) return null;

  return (
    <div className="mx-auto flex w-full max-w-xl min-h-0 flex-1 flex-col">
      {/* Session status: top bar on desktop (DOM order), moved below the
          answer area on mobile via `order` — low enough to stay out of the
          kana's way, high enough to stay above the keyboard. */}
      <div className="order-2 flex shrink-0 flex-col-reverse md:flex-col gap-2 pt-20 md:pt-0 md:order-0 md:pb-2">
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
        <Progress
          value={answers.length}
          max={deck.length}
          aria-label="進度"
          className="[&_[data-slot=progress-indicator]]:bg-vermillion"
        />
      </div>

      {/* The column must NEVER overflow its container at any viewport height,
          or the browser gains a scrollable ancestor to "reveal" the focused
          input with. On mobile the zone hugs the top (natural height); on
          desktop it flexes and centers its content. */}
      <div className="order-1 flex min-h-0 flex-col items-center gap-3 pt-1 md:order-0 md:flex-1 md:justify-center md:gap-8 md:pt-12 md:pb-12">
        {/* Shrinks (never grows) so the column stays anchored to the top on
            mobile: the keyboard compressing the app only removes the empty
            space below the input — nothing above it moves. */}
        <div className="flex min-h-10 w-full min-w-0 shrink items-center justify-center overflow-hidden">
          <p
            lang="ja"
            data-testid="question-kana"
            className={`text-6xl leading-none md:text-kana ${font === "mincho" ? "font-mincho" : "font-kyokasho"}`}
          >
            {kana.kana}
          </p>
        </div>

        {/* Fixed-height feedback slot so revealing never moves the kana. */}
        <div
          role="status"
          className="flex min-h-14 shrink-0 flex-col items-center justify-center gap-1 text-center md:min-h-20 md:gap-1.5"
        >
          {revealed && lastAnswer && (
            <>
              {lastAnswer.correct ? (
                <Badge className="bg-success/15 text-foreground">
                  <Check aria-hidden className="text-success" />
                  答對了
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <X aria-hidden />
                  答錯了（你輸入：{lastAnswer.input.trim() || "—"}）
                </Badge>
              )}
              <p className="text-lg font-semibold md:text-xl">
                {kana.kana} = {kana.romaji}
                {kana.alternates.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    （也可以：{kana.alternates.join(", ")}）
                  </span>
                )}
              </p>
            </>
          )}
        </div>

        {mode === "typing" ? (
          /* The input stays mounted and focused across question/reveal so the
             mobile keyboard never collapses; Enter submits, then advances. */
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-60 flex-col items-center gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.nativeEvent.isComposing)
                  e.preventDefault();
              }}
              placeholder="羅馬拼音或假名…"
              enterKeyHint="go"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label="羅馬拼音"
              className="h-10 rounded-none border-0 border-b border-input bg-transparent px-1 text-center text-lg focus-visible:border-vermillion focus-visible:ring-0 md:text-lg dark:bg-transparent"
            />
            <p className="text-xs text-muted-foreground">
              {revealed
                ? currentIndex + 1 >= deck.length
                  ? "按 Enter 看成績總表"
                  : "按 Enter 下一題"
                : "按 Enter 送出"}
            </p>
          </form>
        ) : (
          <div className="flex w-full flex-col items-center gap-5">
            <div className="grid w-full max-w-sm grid-cols-3 gap-2">
              {choiceList.map((romaji) => {
                const isAnswer = romaji === kana.romaji;
                const isPicked = revealed && lastAnswer?.input === romaji;
                return (
                  <Button
                    key={romaji}
                    variant="secondary"
                    size="lg"
                    disabled={revealed}
                    onClick={() => submit(romaji)}
                    className={cn(
                      "font-mono",
                      revealed &&
                        isAnswer &&
                        "bg-success/20 text-foreground disabled:opacity-100",
                      revealed &&
                        isPicked &&
                        !isAnswer &&
                        "bg-destructive/15 text-destructive disabled:opacity-100",
                    )}
                  >
                    {romaji}
                  </Button>
                );
              })}
            </div>
            {revealed && (
              <Button type="button" autoFocus onClick={advance}>
                {currentIndex + 1 >= deck.length ? "看成績總表" : "下一題"}
                <ArrowRight data-icon="inline-end" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
