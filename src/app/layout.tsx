import type { Metadata } from "next";
import { Geist, Geist_Mono, Klee_One, Noto_Serif_JP } from "next/font/google";
import "./globals.css";

import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-mincho",
  weight: ["400", "600"],
  preload: false,
});

const kleeOne = Klee_One({
  variable: "--font-kyokasho",
  weight: ["400", "600"],
  preload: false,
});

export const metadata: Metadata = {
  title: "HiraGonna",
  description: "日本語五十音（平假名）練習",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSerifJP.variable} ${kleeOne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger />
              <Separator
                orientation="vertical"
                className="h-4 data-vertical:self-center"
              />
              <span className="text-sm font-medium">HiraGonna</span>
            </header>
            <div className="flex flex-1 flex-col p-4 md:p-8">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
