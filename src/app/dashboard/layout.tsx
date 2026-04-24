"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { usePathname } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isProviderSlugPage = /^\/dashboard\/providers\/[^/]+$/.test(pathname)

  return (
    <SidebarProvider>
      {!isProviderSlugPage && <DashboardSidebar activePath={pathname} />}
      <main className="flex-1 bg-[#0d1117] min-h-screen flex flex-col">
        {children}
      </main>
    </SidebarProvider>
  )
}