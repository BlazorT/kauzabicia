"use client";

import * as React from "react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { ModeToggle } from "./ui/theme-menu";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
}) {
  const [activeTeam] = React.useState(teams[0]);
  const { open } = useSidebar();

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2 w-full">
          <SidebarMenuButton
            size="lg"
            className="flex-1 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Image src={"/logo.jpeg"} alt="logo" width={60} height={60} />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{activeTeam.name}</span>
              <span className="truncate text-xs">{activeTeam.plan}</span>
            </div>
          </SidebarMenuButton>
          {open && (
            <div className="flex-shrink-0">
              <ModeToggle />
            </div>
          )}
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
