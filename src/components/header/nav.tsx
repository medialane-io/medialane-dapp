"use client"
import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Rocket,
  Box,
  Grid3X3,
  Boxes,
  Activity,
  ArrowRightLeft,
  IterationCcw,
  BookOpen,
  ShoppingBag,
  FileCode,
  Layers,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Custom styled navigation link for dropdowns
const NavLink = ({
  href,
  icon: Icon,
  title,
  description,
  featured = false,
}: {
  href: string
  icon: React.ElementType
  title: string
  description: string
  featured?: boolean
}) => (
  <NavigationMenuLink asChild>
    <Link
      href={href}
      className={cn(
        "group flex items-start gap-3 rounded-xl p-3 transition-all duration-200",
        "hover:bg-foreground/10 dark:hover:bg-foreground/5",
        featured && "bg-gradient-to-br from-outrun-magenta/10 via-outrun-cyan/10 to-outrun-orange/10 border border-foreground/10 hover:shadow-[0_0_20px_rgba(0,255,255,0.15)]"
      )}
    >
      <div className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
        featured
          ? "bg-gradient-to-br from-outrun-magenta to-outrun-cyan text-white shadow-[0_0_15px_rgba(0,255,255,0.3)]"
          : "bg-foreground/10 dark:bg-foreground/0 text-foreground/70 group-hover:text-foreground group-hover:bg-foreground/20 dark:group-hover:bg-foreground/10"
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-1">
        <p className={cn(
          "text-sm font-medium leading-none text-foreground",
          featured && "text-gradient-vivid"
        )}>{title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
      </div>
    </Link>
  </NavigationMenuLink>
)

export function MainNav() {
  return (
    <NavigationMenu className="max-w-none">
      <NavigationMenuList className="gap-1">

        {/* MARKETPLACE */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-9 px-4 rounded-full bg-foreground/5 dark:bg-foreground/0 hover:bg-foreground/15 dark:hover:bg-foreground/10 border border-foreground/10 dark:border-foreground/5 text-foreground/80 hover:text-foreground data-[state=open]:bg-foreground/15 dark:data-[state=open]:bg-foreground/10 transition-all duration-200">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Marketplace
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-2 p-4 w-[400px]">
              <NavLink
                href="/marketplace"
                icon={ShoppingBag}
                title="Marketplace"
                description="Trade onchain Programmable IP assets"
                featured
              />
              <NavLink
                href="/collections"
                icon={Grid3X3}
                title="Explore Collections"
                description="Browse and trade curated IP collections"
              />
              <NavLink
                href="/assets"
                icon={Boxes}
                title="Recent IP Assets"
                description="Buy, sell, and license tokenized IP assets"
              />
              <NavLink
                href="/activities"
                icon={Activity}
                title="Community Activity"
                description="View recent activity on the platform"
              />
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* LAUNCHPAD */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-9 px-4 rounded-full bg-foreground/5 dark:bg-foreground/0 hover:bg-foreground/15 dark:hover:bg-foreground/10 border border-foreground/10 dark:border-foreground/5 text-foreground/80 hover:text-foreground data-[state=open]:bg-foreground/15 dark:data-[state=open]:bg-foreground/10 transition-all duration-200">
            <Rocket className="mr-2 h-4 w-4" />
            Launchpad
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-2 p-4 w-[400px]">
              <NavLink
                href="/create"
                icon={Sparkles}
                title="Creator Launchpad"
                description="Launch IP Coins, collections, and more"
                featured
              />
              <NavLink
                href="/create/collection"
                icon={Grid3X3}
                title="New Collection"
                description="Create an onchain IP collection"
              />
              <NavLink
                href="/launchpad/collection-drop"
                icon={Rocket}
                title="Collection Drop"
                description="Launch a premium NFT drop"
              />
              <NavLink
                href="/create/asset"
                icon={Box}
                title="Programmable IP"
                description="Tokenize your intellectual property"
              />
              <NavLink
                href="/create/templates"
                icon={FileCode}
                title="IP Templates"
                description="Create IP using ready-made templates"
              />
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* PORTFOLIO */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-9 px-4 rounded-full bg-foreground/5 dark:bg-foreground/0 hover:bg-foreground/15 dark:hover:bg-foreground/10 border border-foreground/10 dark:border-foreground/5 text-foreground/80 hover:text-foreground data-[state=open]:bg-foreground/15 dark:data-[state=open]:bg-foreground/10 transition-all duration-200">
            <Boxes className="mr-2 h-4 w-4" />
            Portfolio
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-2 p-4 w-[450px] md:grid-cols-2">
              <NavLink
                href="/portfolio"
                icon={Boxes}
                title="Portfolio"
                description="Your onchain IP portfolio"
                featured
              />
              <NavLink
                href="/portfolio/assets"
                icon={Box}
                title="My Assets"
                description="Your tokenized assets"
              />
              <NavLink
                href="/portfolio/collections"
                icon={Layers}
                title="My Collections"
                description="Your IP collections"
              />
              <NavLink
                href="/portfolio/activities"
                icon={Activity}
                title="Activities"
                description="Track onchain history"
              />
              <NavLink
                href="/transfer"
                icon={ArrowRightLeft}
                title="Transfer"
                description="Transfer assets"
              />
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* DOCS - Simple Link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/docs"
              className="h-9 px-4 rounded-full inline-flex items-center justify-center text-sm font-medium bg-foreground/5 dark:bg-foreground/0 hover:bg-foreground/15 dark:hover:bg-foreground/10 border border-foreground/10 dark:border-foreground/5 text-foreground/80 hover:text-foreground transition-all duration-200"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Docs
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

      </NavigationMenuList>
    </NavigationMenu>
  )
}
