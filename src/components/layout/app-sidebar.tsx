"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useUnifiedWallet } from "@/hooks/use-unified-wallet";
import {
  Telescope, Compass, Briefcase, Zap, Activity,
  LayoutGrid, Users, Search, Sun, Moon, ShoppingBag,
  BookOpen, FileCode2, Mail, ChevronRight,
} from "lucide-react";
import { ConnectWallet } from "@/components/ConnectWallet";
import { useUnreadOffers } from "@/hooks/use-unread-offers";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MedialaneLogo } from "../brand/medialane-logo";
import { MedialaneIcon } from "../brand/medialane-icon";
import { NotificationsItem } from "@/components/layout/notifications-sheet";

// ── Sub-menu data ────────────────────────────────────────────────────────────

const EXPLORE_SUB = [
  { href: "/collections", label: "Collections", icon: LayoutGrid, external: false },
  { href: "/creators",    label: "Creators",    icon: Users,      external: false },
  { href: "/activities",  label: "Activity",    icon: Activity,   external: false },
];

const RESOURCES_SUB = [
  { href: "https://docs.medialane.io", label: "Docs",    icon: FileCode2, external: true  },
  { href: "/contact",                  label: "Contact", icon: Mail,      external: false },
];

// ── Collapsible nav group ────────────────────────────────────────────────────

interface CollapsibleNavItemProps {
  label: string;
  icon: React.ElementType;
  sub: { href: string; label: string; icon: React.ElementType; external: boolean }[];
  defaultOpen?: boolean;
  tooltip?: string;
  onClose: () => void;
}

function CollapsibleNavItem({
  label, icon: Icon, sub, defaultOpen = false, tooltip, onClose,
}: CollapsibleNavItemProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(defaultOpen);
  const { state, isMobile, setOpen: setSidebarOpen } = useSidebar();
  const collapsed = !isMobile && state === "collapsed";

  const isAnySubActive = sub.some(
    (s) => !s.external && (pathname === s.href || pathname?.startsWith(s.href + "/"))
  );

  if (collapsed) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={tooltip ?? label}
          isActive={isAnySubActive}
          onClick={() => {
            setSidebarOpen(true);
            setOpen(true);
          }}
        >
          <Icon />
          <span>{label}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={tooltip ?? label}
            isActive={isAnySubActive && !open}
          >
            <Icon />
            <span>{label}</span>
            <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {sub.map(({ href, label: subLabel, icon: SubIcon, external }) => {
              const active = !external && (pathname === href || pathname?.startsWith(href + "/"));
              return (
                <SidebarMenuSubItem key={href}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={active}
                    onClick={external ? undefined : onClose}
                  >
                    <Link
                      href={href}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      <SubIcon className="h-3.5 w-3.5" />
                      {subLabel}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

// ── Utility items ─────────────────────────────────────────────────────────────

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

// ── Sidebar ──────────────────────────────────────────────────────────────────

export function AppSidebar() {
  const pathname = usePathname();
  const { address: walletAddress, isConnected } = useUnifiedWallet();
  const unreadOffers = useUnreadOffers(isConnected ? walletAddress : null);
  const { setOpen, setOpenMobile, isMobile, state } = useSidebar();

  const closeSidebar = () => {
    if (isMobile) setOpenMobile(false);
    else setOpen(false);
  };

  const onExplore = !!(
    pathname === "/collections" ||
    pathname?.startsWith("/creators") ||
    pathname === "/activities"
  );
  const onResources = !!(pathname === "/contact" || pathname?.startsWith("/contact/"));

  return (
    <Sidebar collapsible="icon">

      {/* Brand */}
      <SidebarMenu className="p-2">
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild onClick={closeSidebar}>
            {isMobile || state === "expanded" ? <MedialaneLogo /> : <MedialaneIcon />}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <SidebarContent>

        {/* ── Main navigation ──────────────────────────────── */}
        <SidebarGroup>
          <SidebarMenu>

            {/* Discover */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/discover"}
                tooltip="Discover"
                onClick={closeSidebar}
              >
                <Link href="/discover">
                  <Telescope />
                  <span>Discover</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Marketplace */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/marketplace"}
                tooltip="Marketplace"
                onClick={closeSidebar}
              >
                <Link href="/marketplace">
                  <Compass />
                  <span>Marketplace</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Launchpad */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={!!pathname?.startsWith("/launchpad") || !!pathname?.startsWith("/create")}
                tooltip="Launchpad"
                onClick={closeSidebar}
              >
                <Link href="/launchpad">
                  <Zap />
                  <span>Launchpad</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Portfolio with unread badge */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={!!pathname?.startsWith("/portfolio")}
                tooltip={
                  unreadOffers > 0
                    ? `Portfolio (${unreadOffers} new offer${unreadOffers > 1 ? "s" : ""})`
                    : "Portfolio"
                }
                onClick={closeSidebar}
              >
                <Link href="/portfolio" prefetch={false} className="relative">
                  <Briefcase />
                  <span>Portfolio</span>
                  {unreadOffers > 0 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 h-4 min-w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center px-1">
                      {unreadOffers > 9 ? "9+" : unreadOffers}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

          </SidebarMenu>
        </SidebarGroup>

        {/* ── Explore (Collections, Creators, Activity) ────── */}
        <SidebarGroup>
          <SidebarMenu>
            <CollapsibleNavItem
              label="Explore"
              icon={Compass}
              sub={EXPLORE_SUB}
              defaultOpen={onExplore}
              tooltip="Explore"
              onClose={closeSidebar}
            />
          </SidebarMenu>
        </SidebarGroup>

        {/* ── Resources (Docs, Contact) ────────────────────── */}
        <SidebarGroup>
          <SidebarMenu>
            <CollapsibleNavItem
              label="Resources"
              icon={BookOpen}
              sub={RESOURCES_SUB}
              defaultOpen={onResources}
              tooltip="Resources"
              onClose={closeSidebar}
            />
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        {/* ── Utilities ────────────────────────────────────── */}
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

      </SidebarContent>

      {/* ── Wallet footer ────────────────────────────────────── */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div
              className={cn(
                "flex items-center py-1.5",
                !isMobile && state === "collapsed" ? "justify-center px-0" : "px-1"
              )}
            >
              <ConnectWallet />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

    </Sidebar>
  );
}
