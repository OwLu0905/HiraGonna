import {
  findKana,
  GOJUON_COLUMNS,
  GOJUON_VOWELS,
  HIRAGANA,
  type Kana,
} from "@/lib/hiragana"
import { cn } from "@/lib/utils"

const COLUMN_HEADERS = ["a", "k", "s", "t", "n", "h", "m", "y", "r", "w", "ん"]

const kanaN = HIRAGANA.find((h) => h.column === "n-syllabic")!

interface KanaGridProps {
  renderKana: (kana: Kana) => React.ReactNode
  className?: string
}

/**
 * Gojūon layout: consonant columns (行) on the x-axis, vowel rows (段) on the
 * y-axis, plus a final column for the syllabic ん.
 */
export function KanaGrid({ renderKana, className }: KanaGridProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <div
        role="table"
        aria-label="五十音表"
        className="grid min-w-max gap-1.5"
        style={{ gridTemplateColumns: "auto repeat(11, minmax(3.5rem, 1fr))" }}
      >
        <div role="columnheader" />
        {COLUMN_HEADERS.map((header) => (
          <div
            role="columnheader"
            key={header}
            className="pb-1 text-center font-mono text-xs text-muted-foreground"
          >
            {header}
          </div>
        ))}
        {GOJUON_VOWELS.map((vowel, rowIndex) => (
          <div role="row" key={vowel} className="contents">
            <div
              role="rowheader"
              className="flex items-center pr-2 font-mono text-xs text-muted-foreground"
            >
              {vowel}
            </div>
            {GOJUON_COLUMNS.map((column) => {
              const kana = findKana(column, vowel)
              return kana ? (
                <div role="cell" key={column}>
                  {renderKana(kana)}
                </div>
              ) : (
                <div role="cell" key={column} aria-hidden />
              )
            })}
            {rowIndex === 0 ? (
              <div role="cell">{renderKana(kanaN)}</div>
            ) : (
              <div role="cell" aria-hidden />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
