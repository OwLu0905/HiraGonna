import type { Metadata } from "next";

import { KanaChart } from "@/components/chart/kana-chart";

export const metadata: Metadata = {
  title: "五十音表（片假名）| HiraGonna",
};

export default function ChartPage() {
  return <KanaChart script="katakana" />;
}
