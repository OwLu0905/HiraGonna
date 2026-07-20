"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Pencil, Table2 } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const hiraganaItems = [
  { title: "練習", href: "/hiragana/practice", icon: Pencil },
  { title: "五十音表", href: "/hiragana/chart", icon: Table2 },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary font-mincho text-lg text-primary-foreground">
            ひ
          </span>
          <span className="text-base font-semibold">HiraGonna</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Hiragana</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {hiraganaItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
