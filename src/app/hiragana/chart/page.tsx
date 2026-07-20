import type { Metadata } from "next";

import { HiraganaChart } from "@/components/chart/hiragana-chart";

export const metadata: Metadata = {
  title: "五十音表 | HiraGonna",
};

export default function ChartPage() {
  return <HiraganaChart />;
}
