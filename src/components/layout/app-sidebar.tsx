"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useUnifiedWallet } from "@/hooks/use-unified-wallet";
import { Home, Compass, Briefcase, PlusCircle, Zap, Activity, LayoutGrid, Telescope, Search, Sun, Moon, ShoppingBag, Info, BookOpen, FileCode2, Mail, LifeBuoy, Scale, Lock, Users } from "lucide-react";
import { ConnectWallet } from "@/components/ConnectWallet";
import { IP_TYPE_CONFIG } from "@/lib/ip-type-config";
import { useUnreadOffers } from "@/hooks/use-unread-offers";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { MedialaneLogo } from "../brand/medialane-logo";
import { MedialaneIcon } from "../brand/medialane-icon";
import { NotificationsItem } from "@/components/layout/notifications-sheet";

const NAV = [
  { href: "/discover", label: "Discover", icon: Telescope, exact: true },
  { href: "/marketplace", label: "Marketplace", icon: Compass, exact: true },
  { href: "/collections", label: "Collections", icon: LayoutGrid, exact: true },
  { href: "/creators",   label: "Creators",    icon: Users,      exact: true },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase, exact: true, prefetch: false },
  { href: "/create", label: "Create", icon: PlusCircle, exact: true, prefetch: false },
  { href: "/launchpad", label: "Launchpad", icon: Zap, exact: true },
  { href: "/activities", label: "Activity", icon: Activity, exact: true },
];

function ThemeToggleItem() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        tooltip={theme === "dark" ? "Light mode" : "Dark mode"}
      >
        {theme === "dark" ? <Sun /> : <Moon />}
        <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function CartItem() {
  const { items, toggleCart } = useCart();
  const count = items.length;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton onClick={toggleCart} tooltip={count > 0 ? `Cart (${count})` : "Cart"}>
        <div className="relative">
          <ShoppingBag className="size-4" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </div>
        <span>Cart{count > 0 ? ` (${count})` : ""}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { address: walletAddress, isConnected } = useUnifiedWallet();
  const unreadOffers = useUnreadOffers(isConnected ? walletAddress : null);
  const { setOpen, setOpenMobile, isMobile, state } = useSidebar();

  const closeSidebar = () => {
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
  };

  return (
    <Sidebar collapsible="icon">
      {/* Brand */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild onClick={closeSidebar}>
              {isMobile || state === "expanded" ? <MedialaneLogo /> : <MedialaneIcon />}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {NAV.map(({ href, label, icon: Icon, exact, prefetch }) => {
              const showBadge = href === "/portfolio" && unreadOffers > 0;
              return (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={exact ? pathname === href : !!pathname?.startsWith(href)}
                    tooltip={showBadge ? `${label} (${unreadOffers} new offer${unreadOffers > 1 ? "s" : ""})` : label}
                    onClick={closeSidebar}
                  >
                    <Link href={href} prefetch={prefetch} className="relative">
                      <Icon />
                      <span>{label}</span>
                      {showBadge && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 h-4 min-w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center px-1">
                          {unreadOffers > 9 ? "9+" : unreadOffers}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />

        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Search" onClick={closeSidebar}>
                <Link href="/search">
                  <Search />
                  <span>Search</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <ThemeToggleItem />
            <CartItem />
            <NotificationsItem />
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

    
        <SidebarGroup>
          <SidebarGroupLabel>DAO</SidebarGroupLabel>
          <SidebarMenu>
            {[
              { href: "/contact", label: "Contact Us",   icon: Mail },
            ].map(({ href, label, icon: Icon }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === href}
                  tooltip={label}
                  onClick={closeSidebar}
                >
                  <Link href={href}>
                    <Icon />
                    <span>{label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* User */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className={cn(
              "flex items-center py-1.5",
              !isMobile && state === "collapsed" ? "justify-center px-0" : "px-1"
            )}>
              <ConnectWallet />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
