import { ThemeToggle } from "./theme-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function DashboardHeader() {
  return (
    <header className="h-16 border-b bg-card/50 backdrop-blur flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold">Business Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </header>
  )
}