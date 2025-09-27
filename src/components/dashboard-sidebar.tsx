import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  Archive, 
  Calculator, 
  FileText, 
  ClipboardList,
  LogIn,
  UserPlus,
  XCircle,
  CheckCircle,
  Loader
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

import { useAuth } from "@/context/AuthContext";
import { rolePermissions } from "@/config/roles";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Employees", url: "/employees", icon: Users },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Products", url: "/products", icon: Package },
  { title: "OrderCustomer", url: "/order/customer", icon: ShoppingCart },
  { title: "orders_canceled", url: "/orderscanceled", icon: XCircle },
  { title: "orders_completed", url: "/orderscompleted", icon: CheckCircle },
  { title: "Order_Processing", url: "/OrderProcessing", icon: Loader },
  { title: "Orders_Pending", url: "/OrdersPending", icon: Loader },
  { title: "Packages", url: "/packages", icon: Archive },
];
const authItems = [
  { title: "Login", url: "/login", icon: LogIn },
  { title: "Register", url: "/register", icon: UserPlus },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { role } = useAuth(); // ✅ هنا بنجيب الدور
  const allowed = rolePermissions[role] || [];

  return (
    <Sidebar collapsible="icon" className="bg-sidebar-background border-sidebar-border">
      <SidebarTrigger className="m-2 self-end text-sidebar-foreground" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems
                .filter((item) => allowed.includes(item.title))
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={({ isActive }) =>
                          `flex items-center px-3 py-2 rounded-md transition-colors ${
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }`
                        }
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {state === "expanded" && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {authItems
                .filter((item) => allowed.includes(item.title))
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          `flex items-center px-3 py-2 rounded-md transition-colors ${
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }`
                        }
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {state === "expanded" && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
