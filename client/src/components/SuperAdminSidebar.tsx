import { Home, Users, Globe, WifiOff, ShoppingCart, CreditCard, UserCog, Puzzle, Headphones, Settings, FileText } from "lucide-react";
import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const mainMenuItems = [
  { title: "Dashboard", url: "/superadmin", icon: Home },
  { title: "Customers", url: "/superadmin/customers", icon: Users },
  { title: "Domain Requests", url: "/superadmin/domain-requests", icon: Globe },
  { title: "Offline Requests", url: "/superadmin/offline-requests", icon: WifiOff },
  { title: "Orders", url: "/superadmin/orders", icon: ShoppingCart },
  { title: "Plans", url: "/superadmin/plans", icon: CreditCard },
  { title: "Users", url: "/superadmin/users", icon: UserCog },
  { title: "Addons", url: "/superadmin/addons", icon: Puzzle },
  { title: "Support", url: "/superadmin/support", icon: Headphones },
  { title: "Settings", url: "/superadmin/settings", icon: Settings },
];

const toolsItems = [
  { title: "Audit Logs", url: "/superadmin/audit-logs", icon: FileText },
];

export function SuperAdminSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <a href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>TOOLS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <a href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
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
