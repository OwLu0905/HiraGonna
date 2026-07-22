import {
  findKana,
  GRID_DEFS,
  SCRIPT_SETS,
  SET_LABELS,
  type Kana,
  type KanaSet,
  type Script,
} from "@/lib/hiragana"
import { cn } from "@/lib/utils"

interface KanaGridProps {
  set?: KanaSet
  script?: Script
  renderKana: (kana: Kana) => React.ReactNode
  className?: string
}

/**
 * Gojūon-style layout for one kana set: consonant columns (行) on the x-axis,
 * vowel rows (段) on the y-axis; the basic set adds a final column for ん/ン.
 */
export function KanaGrid({
  set = "basic",
  script = "hiragana",
  renderKana,
  className,
}: KanaGridProps) {
  const def = GRID_DEFS[set]
  const kanaN = SCRIPT_SETS[script].basic.find((k) => k.column === "n-syllabic")!
  const columnCount = def.columns.length + (def.includeN ? 1 : 0)

  return (
    <div className={cn("overflow-x-auto", className)}>
      <div
        role="table"
        aria-label={`五十音表 ${SET_LABELS[set]}`}
        className="grid min-w-max gap-1.5"
        style={{
          gridTemplateColumns: `auto repeat(${columnCount}, minmax(3.5rem, 1fr))`,
        }}
      >
        <div role="columnheader" />
        {def.headers.map((header, i) => (
          <div
            role="columnheader"
            key={def.columns[i]}
            className="pb-1 text-center font-mono text-xs text-muted-foreground"
          >
            {header}
          </div>
        ))}
        {def.includeN && (
          <div
            role="columnheader"
            className="pb-1 text-center font-mono text-xs text-muted-foreground"
          >
            {kanaN.kana}
          </div>
        )}
        {def.vowels.map((vowel, rowIndex) => (
          <div role="row" key={vowel} className="contents">
            <div
              role="rowheader"
              className="flex items-center pr-2 font-mono text-xs text-muted-foreground"
            >
              {vowel}
            </div>
            {def.columns.map((column) => {
              const kana = findKana(column, vowel, script, set)
              return kana ? (
                <div role="cell" key={column}>
                  {renderKana(kana)}
                </div>
              ) : (
                <div role="cell" key={column} aria-hidden />
              )
            })}
            {def.includeN &&
              (rowIndex === 0 ? (
                <div role="cell">{renderKana(kanaN)}</div>
              ) : (
                <div role="cell" aria-hidden />
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}
