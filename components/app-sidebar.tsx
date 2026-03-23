"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
  LayoutDashboard,
  Activity,
  Pill,
  Brain,
  Settings,
  LogOut,
} from "lucide-react"
import Link from "next/link"

 function AppSidebar() {

  interface MenuType {
    title: string
    url: string
    icon: any
  }

  const menuItems: MenuType[] = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Health Analysis", url: "/healthAnalysis", icon: Activity },
    { title: "Add Medication", url: "/addMedication", icon: Pill },
    { title: "AI Recommendation", url: "/recommendation", icon: Brain },
    { title: "Settings", url: "/settings", icon: Settings },
  ]

  return (
    <Sidebar className="bg-white/10 backdrop-blur-xl border-r border-white/10">

      {/* HEADER */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-col items-center justify-center py-6">
              <img
                className="w-20 h-20 rounded-full object-cover border-4 border-primary/30 shadow-md"
                src="https://images.unsplash.com/photo-1527980965255-d3b416303d12"
                alt="profile"
              />
              <h2 className="text-lg font-semibold mt-3">Welcome Joe</h2>
              <p className="text-sm text-muted-foreground">
                Health Dashboard
              </p>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>

            {menuItems.map((item, index) => {
              const Icon = item.icon

              return (
                <SidebarMenuItem key={index}>
                  <Link href={item.url}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl
                    cursor-pointer
                    text-muted-foreground
                    hover:bg-white/10 hover:text-foreground
                    hover:shadow-md hover:shadow-primary/10
                    hover:scale-[1.02]
                    transition-all duration-300 ease-in-out
                    group"
                  >
                    <Icon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                    <span className="font-medium tracking-wide">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuItem>
              )
            })}

          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <button
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl
              cursor-pointer
              text-red-500
              hover:bg-red-500/10 hover:text-red-600
              hover:scale-[1.02]
              hover:shadow-md hover:shadow-red-500/20
              transition-all duration-300 ease-in-out
              group"
            >
              <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110" />
              <span className="font-medium tracking-wide">
                Logout
              </span>
            </button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

    </Sidebar>
  )
}
export default AppSidebar