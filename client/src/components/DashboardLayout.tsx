import { ReactNode, useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, ChevronDown } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import klipitLogo from "@assets/Klipit By Bova_1761061110237.png";

interface MenuItem {
  title: string;
  url?: string;
  icon: any;
  subItems?: Array<{
    title: string;
    url: string;
  }>;
}

interface DashboardLayoutProps {
  children: ReactNode;
  menuItems: MenuItem[];
  userType: "admin" | "employee";
}

export default function DashboardLayout({ children, menuItems, userType }: DashboardLayoutProps) {
  const [location] = useLocation();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  // Initialize all collapsible items as open by default
  useEffect(() => {
    const initialOpenState: Record<string, boolean> = {};
    menuItems.forEach(item => {
      if (item.subItems) {
        initialOpenState[item.title] = true;
      }
    });
    setOpenItems(initialOpenState);
  }, [menuItems]);

  const toggleItem = (title: string) => {
    setOpenItems(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const isItemActive = (item: MenuItem) => {
    if (item.url && location === item.url) return true;
    if (item.subItems) {
      return item.subItems.some(subItem => location === subItem.url);
    }
    return false;
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <div className="p-4 border-b">
              <div className="flex items-center justify-center">
                <img src={klipitLogo} alt="Klipit by Bova" className="h-16 w-auto" />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {userType === "admin" ? "Admin Dashboard" : "Employee Portal"}
              </p>
            </div>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    item.subItems ? (
                      <Collapsible
                        key={item.title}
                        open={openItems[item.title] !== false}
                        onOpenChange={() => toggleItem(item.title)}
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton isActive={isItemActive(item)}>
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                              <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${openItems[item.title] !== false ? 'rotate-180' : ''}`} />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.subItems.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton asChild isActive={location === subItem.url}>
                                    <Link href={subItem.url}>
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    ) : (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={location === item.url}>
                          <Link href={item.url!}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" data-testid="button-notifications">
                    <Bell className="h-4 w-4" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      3
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuItem>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">New leave request</p>
                      <p className="text-xs text-muted-foreground">From John Doe - 2 hours ago</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">Payslip generated</p>
                      <p className="text-xs text-muted-foreground">January 2024 - 5 hours ago</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">New announcement</p>
                      <p className="text-xs text-muted-foreground">Office holiday - 1 day ago</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/">
                <Button variant="outline" size="icon" data-testid="button-logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
