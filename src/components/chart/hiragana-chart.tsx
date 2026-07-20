"use client"

import * as React from "react"

import { KanaGrid } from "@/components/kana-grid"
import { Button } from "@/components/ui/button"
import {
  FONT_LABELS,
  SET_LABELS,
  type KanaFont,
  type KanaSet,
} from "@/lib/hiragana"
import { cn } from "@/lib/utils"

export function HiraganaChart() {
  const [font, setFont] = React.useState<KanaFont>("kyokasho")

  return (
    <div className="flex flex-1 justify-center">
      <div className="flex w-full max-w-4xl flex-col gap-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-mincho text-2xl font-semibold">
              五十音表（平假名）
            </h1>
            <p className="text-sm text-muted-foreground">
              橫軸是子音（行），縱軸是母音（段）。
            </p>
          </div>
          <div role="group" aria-label="字體" className="flex items-center gap-1">
            {(Object.keys(FONT_LABELS) as KanaFont[]).map((key) => (
              <Button
                key={key}
                size="sm"
                variant={font === key ? "secondary" : "ghost"}
                className={cn(font !== key && "text-muted-foreground")}
                aria-pressed={font === key}
                onClick={() => setFont(key)}
              >
                {FONT_LABELS[key]}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-8">
          {(Object.keys(SET_LABELS) as KanaSet[]).map((set) => (
            <section key={set} className="flex flex-col gap-1.5">
              <h3 className="text-sm font-medium text-muted-foreground">
                {SET_LABELS[set]}
              </h3>
              <KanaGrid
                set={set}
                renderKana={(kana) => (
                  <div className="flex flex-col items-center gap-0.5 rounded-lg border bg-card px-1 py-2">
                    <span
                      lang="ja"
                      className={`text-2xl leading-none ${font === "mincho" ? "font-mincho" : "font-kyokasho"}`}
                    >
                      {kana.kana}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {kana.romaji}
                    </span>
                  </div>
                )}
              />
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
