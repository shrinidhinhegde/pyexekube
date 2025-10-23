"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {HomeIcon, FolderIcon, Info, History} from "lucide-react";
import {SideNavFooter} from "@/components/sidenav/SideNavFooter";
import SideNavHeader from "@/components/sidenav/SideNavHeader";
const sideNavItems = [
  {
    title: "Code Base",
    link: "/",
    icon: HomeIcon,
  },
  {
    title: "File Manager",
    link: "/files",
    icon: FolderIcon,
  },
  {
    title: "Execution History",
    link: "/executions",
    icon: History,
  },
  {
    title: "How It Works",
    link: "/info",
    icon: Info,
  },
];

export function SideNav() {

  return (
    <Sidebar collapsible="icon" className="list-none">
      <SideNavHeader/>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sideNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.link}>
                      <item.icon/>
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SideNavFooter/>
    </Sidebar>
  )
}