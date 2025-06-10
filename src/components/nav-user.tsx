"use client";

import { ChevronsUpDown, LogOut, ScrollText, UserRoundPen } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAlert } from "@/context/alert-context";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useOrder } from "@/context/order-context";
import { formatAvatar } from "@/lib/utils";
import { googleLogout } from "@react-oauth/google";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, logout } = useAuth();
  const { showAlert } = useAlert();
  const { totalItems, clearCart } = useCart();
  const { resetOrderInfo } = useOrder();
  const route = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleLogOut = () => {
    toggleMenu();
    showAlert({
      title: "Sign Out?",
      description: `Are you sure you want to sign out? ${
        totalItems > 0 ? "Your cart will be cleared." : ""
      }`,
      onConfirm: () => {
        clearCart();
        resetOrderInfo();
        googleLogout();
        logout();
      },
      confirmText: "Sign Out",
      cancelText: "Cancel",
    });
  };
  const userFirstName = user?.firstName; // Assuming 'user' and 'firstName' exist

  let initials = "";
  if (userFirstName && userFirstName.length >= 2) {
    initials = userFirstName.slice(0, 2).toUpperCase();
  } else if (userFirstName && userFirstName.length === 1) {
    initials = userFirstName.toUpperCase();
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild onClick={toggleMenu}>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={formatAvatar(user?.avatar ?? "") ?? ""}
                  alt={user?.firstName}
                />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={formatAvatar(user?.avatar ?? "") ?? ""}
                    alt={user?.firstName}
                  />
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator /> */}
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => route.push("/dashboard/account")}
              >
                <UserRoundPen />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => route.push("/dashboard/orders")}>
                <ScrollText />
                Orders
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogOut}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
