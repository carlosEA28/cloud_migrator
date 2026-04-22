"use client"

import { usePathname } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function DashboardPage() {
  const pathname = usePathname()

  return <DashboardSidebar activePath={pathname} />
}
