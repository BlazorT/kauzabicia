"use client";

import { useAlert } from "@/context/alert-context";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { googleLogout } from "@react-oauth/google";
import {
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  LogOut,
  PackageSearch,
  ScrollText,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { formatAvatar } from "@/lib/utils";
import Image from "next/image";
import { useOrder } from "@/context/order-context";
import { USER_ROLE } from "@/constants/constants";

const HeaderProfile = () => {
  const { user, logout } = useAuth();
  const { showAlert } = useAlert();
  const { resetOrderInfo } = useOrder();
  const { totalItems, clearCart } = useCart();
  const route = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileImgError, setIsProfileImgError] = useState(false);

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

  if (!user) {
    return (
      <Button asChild>
        <Link href="/auth/signin">Sign In</Link>
      </Button>
    );
  }

  const userAvatar = user ? formatAvatar(user?.avatar) : null;
  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger
        className="flex gap-1 items-center outline-none"
        onClick={toggleMenu}
      >
        {userAvatar && !isProfileImgError ? (
          <div className="w-8 h-8 rounded-full overflow-hidden relative">
            <Image
              src={userAvatar}
              onError={() => setIsProfileImgError(true)}
              fill
              alt="profile"
            />
          </div>
        ) : (
          <User />
        )}
        <p className="font-bold hidden lg:block">{user.firstName}</p>
        {!isMenuOpen ? (
          <ChevronDown className="text-primary hidden lg:block" />
        ) : (
          <ChevronUp className="text-primary hidden lg:block" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="start"
        className="min-w-60 mt-2 p-2 space-y-2"
      >
        {/* <DropdownMenuSeparator /> */}
        <DropdownMenuItem
          className="gap-3"
          onClick={() => {
            if (user?.roleId !== USER_ROLE.USER) {
              route.push("/dashboard/account");
            } else {
              route.push("/account");
            }
          }}
        >
          {userAvatar && !isProfileImgError ? (
            <div className="w-6 h-6 rounded-full overflow-hidden relative">
              <Image
                src={userAvatar}
                onError={() => setIsProfileImgError(true)}
                fill
                alt="profile"
              />
            </div>
          ) : (
            <User />
          )}
          <p className="text-base">Profile</p>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-3"
          onClick={() => {
            if (user?.roleId !== USER_ROLE.USER) {
              route.push("/dashboard/orders");
            } else {
              route.push("/orders");
            }
          }}
        >
          <ScrollText className="size-6 shrink-0" />
          <p className="text-base">Orders</p>
        </DropdownMenuItem>
        {user?.roleId !== USER_ROLE.USER && (
          <DropdownMenuItem
            className="gap-3"
            onClick={() => route.push("/dashboard")}
          >
            <LayoutDashboard className="size-6 shrink-0" />
            <p className="text-base">Dashboard</p>
          </DropdownMenuItem>
        )}
        {user?.roleId !== USER_ROLE.USER && (
          <DropdownMenuItem
            className="gap-3"
            onClick={() => route.push("/dashboard/product-setting")}
          >
            <PackageSearch className="size-6 shrink-0" />
            <p className="text-base">Product Setting</p>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem className="gap-3" onClick={handleLogOut}>
          <LogOut className="size-6 shrink-0" />
          <p className="text-base">Sign Out</p>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderProfile;
