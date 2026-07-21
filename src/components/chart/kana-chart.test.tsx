import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test } from "vitest"

import { KanaChart } from "@/components/chart/kana-chart"
import { ALL_KANA, KATAKANA_SETS } from "@/lib/hiragana"

describe("KanaChart", () => {
  test("renders every kana (basic, voiced, contracted) with romaji", () => {
    render(<KanaChart />)
    for (const { kana } of ALL_KANA) {
      // getAllByText: ん also appears as its column header.
      expect(screen.getAllByText(kana).length).toBeGreaterThan(0)
    }
    expect(screen.getByText("shi")).toBeInTheDocument()
    expect(screen.getByRole("table", { name: "五十音表 清音" })).toBeInTheDocument()
    expect(
      screen.getByRole("table", { name: "五十音表 濁音・半濁音" })
    ).toBeInTheDocument()
    expect(screen.getByRole("table", { name: "五十音表 拗音" })).toBeInTheDocument()
  })

  test("katakana script renders katakana glyphs with the same romaji", () => {
    render(<KanaChart script="katakana" />)
    expect(
      screen.getByRole("heading", { name: "五十音表（片假名）" })
    ).toBeInTheDocument()
    for (const { kana } of KATAKANA_SETS.basic) {
      // getAllByText: ン also appears as its column header.
      expect(screen.getAllByText(kana).length).toBeGreaterThan(0)
    }
    expect(screen.getByText("キャ")).toBeInTheDocument()
    expect(screen.queryByText("あ")).not.toBeInTheDocument()
  })

  test("toggles between Kyōkasho and Mincho fonts and marks the current one", async () => {
    const user = userEvent.setup()
    render(<KanaChart />)

    expect(screen.getByRole("button", { name: "教科書体" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    expect(screen.getByText("あ")).toHaveClass("font-kyokasho")

    await user.click(screen.getByRole("button", { name: "明朝体" }))

    expect(screen.getByText("あ")).toHaveClass("font-mincho")
    expect(screen.getByRole("button", { name: "明朝体" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    expect(screen.getByRole("button", { name: "教科書体" })).toHaveAttribute(
      "aria-pressed",
      "false"
    )
  })
})
