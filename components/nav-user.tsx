"use client"

import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar"
import { UserAccountDropdown } from "@/components/user-account-dropdown"
import { JSX } from "react";

/**
 * NavUser component for the sidebar navigation
 * Uses the UserAccountDropdown component with the sidebar variant
 * @component
 * @returns {JSX.Element} Sidebar user navigation with dropdown
 */
export function NavUser(): JSX.Element {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserAccountDropdown variant="sidebar" />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
