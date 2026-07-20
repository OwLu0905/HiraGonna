import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, test } from "vitest"

import { PracticeSession } from "@/components/practice/practice-session"
import { usePracticeStore } from "@/lib/practice-store"

beforeEach(() => {
  usePracticeStore.getState().reset()
})

function currentKana() {
  const s = usePracticeStore.getState()
  return s.deck[s.currentIndex]
}

describe("practice flow", () => {
  test("shows the start screen and starts a 46-question session", async () => {
    const user = userEvent.setup()
    render(<PracticeSession />)

    await user.click(screen.getByRole("button", { name: /開始練習/ }))

    expect(screen.getByText("已回答 0 / 46")).toBeInTheDocument()
    expect(screen.getByTestId("question-kana")).toHaveTextContent(
      currentKana().kana
    )
    expect(screen.getByRole("textbox", { name: "羅馬拼音" })).toHaveFocus()
  })

  test("set selection builds the deck (voiced only → 25 questions)", async () => {
    const user = userEvent.setup()
    render(<PracticeSession />)

    // Default is basic only.
    expect(
      screen.getByRole("button", { name: /開始練習（46 題）/ })
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /濁音・半濁音/ }))
    expect(
      screen.getByRole("button", { name: /開始練習（71 題）/ })
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /^清音/ }))
    await user.click(screen.getByRole("button", { name: /開始練習（25 題）/ }))

    expect(screen.getByText("已回答 0 / 25")).toBeInTheDocument()
    expect(usePracticeStore.getState().deck.every((k) => k.set === "voiced")).toBe(
      true
    )
  })

  test("start button is disabled when no set is selected", async () => {
    const user = userEvent.setup()
    render(<PracticeSession />)

    await user.click(screen.getByRole("button", { name: /^清音/ }))
    expect(screen.getByRole("button", { name: /開始練習（0 題）/ })).toBeDisabled()
    expect(screen.getByText("請至少選擇一個範圍")).toBeInTheDocument()
  })

  test("submit reveals the answer without advancing; 下一題 advances", async () => {
    const user = userEvent.setup()
    render(<PracticeSession />)
    await user.click(screen.getByRole("button", { name: /開始練習/ }))

    const first = currentKana()
    await user.keyboard(`${first.romaji}{Enter}`)

    // Revealed, correct, and still on the same kana.
    expect(screen.getByText("答對了")).toBeInTheDocument()
    expect(screen.getByTestId("question-kana")).toHaveTextContent(first.kana)
    expect(screen.getByText("已回答 1 / 46")).toBeInTheDocument()
    expect(screen.getByText(/字體：(明朝体|教科書体)/)).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /下一題/ }))

    const second = currentKana()
    expect(usePracticeStore.getState().currentIndex).toBe(1)
    expect(screen.getByTestId("question-kana")).toHaveTextContent(second.kana)
    expect(screen.getByRole("textbox", { name: "羅馬拼音" })).toHaveValue("")
  })

  test("a wrong answer is marked and shows the correct romaji", async () => {
    const user = userEvent.setup()
    render(<PracticeSession />)
    await user.click(screen.getByRole("button", { name: /開始練習/ }))

    const first = currentKana()
    await user.keyboard("zzz{Enter}")

    expect(screen.getByText(/答錯了/)).toBeInTheDocument()
    expect(
      screen.getByText(new RegExp(`${first.kana} = ${first.romaji}`))
    ).toBeInTheDocument()
  })

  test("submit button is disabled while the input is empty", async () => {
    const user = userEvent.setup()
    render(<PracticeSession />)
    await user.click(screen.getByRole("button", { name: /開始練習/ }))

    expect(screen.getByRole("button", { name: "送出" })).toBeDisabled()
  })

  test("結束 Session after answering shows the summary heatmap", async () => {
    const user = userEvent.setup()
    render(<PracticeSession />)
    await user.click(screen.getByRole("button", { name: /開始練習/ }))

    const first = currentKana()
    await user.keyboard(`${first.romaji}{Enter}`)
    await user.click(screen.getByRole("button", { name: /下一題/ }))
    await user.click(screen.getByRole("button", { name: /結束 Session/ }))

    expect(screen.getByText("成績總表")).toBeInTheDocument()
    const cell = screen.getByTestId(`heatmap-${first.kana}`)
    expect(cell.dataset.bucket).toMatch(/fast|medium|slow/)
    // Unanswered kana render as neutral cells.
    const unanswered = usePracticeStore
      .getState()
      .deck.find((k) => k.kana !== first.kana)!
    expect(screen.getByTestId(`heatmap-${unanswered.kana}`).dataset.bucket).toBe(
      "none"
    )
  })

  test("結束 Session with no answers returns to the start screen", async () => {
    const user = userEvent.setup()
    render(<PracticeSession />)
    await user.click(screen.getByRole("button", { name: /開始練習/ }))
    await user.click(screen.getByRole("button", { name: /結束 Session/ }))

    expect(screen.getByRole("button", { name: /開始練習/ })).toBeInTheDocument()
  })

  test("summary offers weak-point review after a wrong answer", async () => {
    const user = userEvent.setup()
    render(<PracticeSession />)
    await user.click(screen.getByRole("button", { name: /開始練習/ }))

    const missed = currentKana()
    await user.keyboard("zzz{Enter}")
    await user.click(screen.getByRole("button", { name: /下一題/ }))
    await user.keyboard(`${currentKana().romaji}{Enter}`)
    await user.click(screen.getByRole("button", { name: /下一題/ }))
    await user.click(screen.getByRole("button", { name: /結束 Session/ }))

    await user.click(screen.getByRole("button", { name: /只練弱點（1）/ }))

    // New round contains only the missed kana.
    expect(screen.getByText("已回答 0 / 1")).toBeInTheDocument()
    expect(screen.getByTestId("question-kana")).toHaveTextContent(missed.kana)
  })

  test("summary hides weak-point review when everything was fast and correct", async () => {
    const user = userEvent.setup()
    render(<PracticeSession />)
    await user.click(screen.getByRole("button", { name: /開始練習/ }))
    await user.keyboard(`${currentKana().romaji}{Enter}`)
    await user.click(screen.getByRole("button", { name: /下一題/ }))
    await user.click(screen.getByRole("button", { name: /結束 Session/ }))

    expect(screen.getByText("成績總表")).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /只練弱點/ })
    ).not.toBeInTheDocument()
  })

  test("summary shows stats and can restart", async () => {
    const user = userEvent.setup()
    render(<PracticeSession />)
    await user.click(screen.getByRole("button", { name: /開始練習/ }))
    await user.keyboard(`${currentKana().romaji}{Enter}`)
    await user.click(screen.getByRole("button", { name: /下一題/ }))
    await user.click(screen.getByRole("button", { name: /結束 Session/ }))

    const correctStat = screen.getByTestId("stat-correct")
    expect(within(correctStat).getByText("1 / 1")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /再練習一次/ }))
    expect(screen.getByText("已回答 0 / 46")).toBeInTheDocument()
  })
})
