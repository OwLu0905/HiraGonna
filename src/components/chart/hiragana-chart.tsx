"use client"

import * as React from "react"

import { KanaGrid } from "@/components/kana-grid"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FONT_LABELS, type KanaFont } from "@/lib/hiragana"

export function HiraganaChart() {
  const [font, setFont] = React.useState<KanaFont>("kyokasho")

  return (
    <div className="flex flex-1 justify-center">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-col gap-1.5">
              <CardTitle>五十音表（平假名）</CardTitle>
              <CardDescription>
                橫軸是子音（行），縱軸是母音（段）。
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" data-testid="current-font">
                目前字體：{FONT_LABELS[font]}
              </Badge>
              {(Object.keys(FONT_LABELS) as KanaFont[]).map((key) => (
                <Button
                  key={key}
                  size="sm"
                  variant={font === key ? "default" : "outline"}
                  aria-pressed={font === key}
                  onClick={() => setFont(key)}
                >
                  {FONT_LABELS[key]}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <KanaGrid
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
        </CardContent>
      </Card>
    </div>
  )
}
