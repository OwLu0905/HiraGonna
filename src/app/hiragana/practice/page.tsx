import type { Metadata } from "next";

import { PracticeSession } from "@/components/practice/practice-session";

export const metadata: Metadata = {
  title: "平假名練習 | HiraGonna",
};

export default function PracticePage() {
  return <PracticeSession />;
}
