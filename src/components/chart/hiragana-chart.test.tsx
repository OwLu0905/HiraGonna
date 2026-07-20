import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test } from "vitest"

import { HiraganaChart } from "@/components/chart/hiragana-chart"
import { HIRAGANA } from "@/lib/hiragana"

describe("HiraganaChart", () => {
  test("renders all 46 kana with romaji in the gojūon grid", () => {
    render(<HiraganaChart />)
    for (const { kana } of HIRAGANA) {
      // getAllByText: ん also appears as its column header.
      expect(screen.getAllByText(kana).length).toBeGreaterThan(0)
    }
    expect(screen.getByText("shi")).toBeInTheDocument()
    expect(screen.getByRole("table", { name: "五十音表" })).toBeInTheDocument()
  })

  test("toggles between Kyōkasho and Mincho fonts and labels the current one", async () => {
    const user = userEvent.setup()
    render(<HiraganaChart />)

    expect(screen.getByTestId("current-font")).toHaveTextContent("教科書体")
    expect(screen.getByText("あ")).toHaveClass("font-kyokasho")

    await user.click(screen.getByRole("button", { name: "明朝体" }))

    expect(screen.getByTestId("current-font")).toHaveTextContent("明朝体")
    expect(screen.getByText("あ")).toHaveClass("font-mincho")
    expect(screen.getByRole("button", { name: "明朝体" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
  })
})
