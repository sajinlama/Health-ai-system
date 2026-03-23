"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"
import {
 
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
     <div className="flex">
      <QueryClientProvider client={queryClient}>
         <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 p-6">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
     
    </QueryClientProvider>
   
    </div>
  )
}