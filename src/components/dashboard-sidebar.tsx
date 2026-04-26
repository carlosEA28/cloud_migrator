"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Home, Link2, Move } from "lucide-react"
import Image from "next/image"
import logo from "../../public/Icon.svg"
import {authClient} from "@/lib/auth_client";

interface DashboardSidebarProps {
  activePath?: string
}


const dashboardNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Providers",
    url: "/dashboard/providers",
    icon: Link2,
  },
  {
    title: "Transfers",
    url: "/dashboard/transfers",
    icon: Move,
  },
]

export function DashboardSidebar({ activePath = "/" }: DashboardSidebarProps) {

  const user = authClient.useSession()


  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return activePath === "/dashboard"
    }
    return activePath.startsWith(url)
  }

  return (
    <Sidebar className="">
      <SidebarHeader className="flex flex-col gap-3 pb-4 pt-2 bg-[#111118] gap-6">
        <div className="flex items-center gap-2 px-2">
          <Image src={logo} alt="Cloud Migrator" width={24} height={20} />
          <span className="text-sm font-semibold text-[#15e6c2]">Cloud Migrator</span>
        </div>
        <a href="/dashboard/transfer" className="text-center w-full rounded-none bg-[#15e6c2] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#12292a] hover:bg-[#1ff5d2]">
          + New Migration
        </a>
      </SidebarHeader>
      <SidebarContent className="bg-[#111118] ">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[10px] p-6 uppercase tracking-wider text-[#7f899a]">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1">
            <SidebarMenu>
              {dashboardNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <a
                    href={item.url}
                    className={`flex h-9 w-full items-center gap-2 rounded-none px-3 text-[13px] ${
                      isActive(item.url)
                        ? "bg-[#15e6c2]/10 text-[#15e6c2]"
                        : "text-[#b5becd] hover:bg-[#232a3b] hover:text-white"
                    }`}
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mt-auto border-t border-[#2c3240] p-3 bg-[#111118]">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#2c3240] text-xs font-medium text-white">
            {user?.data?.user.name[0].toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-white">{user?.data?.user.name}</span>
            <span className="text-[10px] text-[#7f899a]">{user?.data?.user.email}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}