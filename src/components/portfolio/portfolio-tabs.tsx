import Link from "next/link";
import { cn } from "@/lib/utils";

interface PortfolioTabsProps {
    activePath: string;
}

export function PortfolioTabs({ activePath }: PortfolioTabsProps) {
    const tabs = [
        { name: "My Listings", path: "/portfolio/listings" },
        { name: "Offers Made", path: "/portfolio/offers" },
        { name: "Offers Received", path: "/portfolio/offers-received" },
        { name: "Bid History", path: "/portfolio/bid-history" },
    ];

    return (
        <div className="flex gap-1 mb-8 border-b border-m3-outline-variant/10 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
                const isActive = activePath === tab.path;
                return (
                    <Link
                        key={tab.path}
                        href={tab.path}
                        className={cn(
                            "px-6 py-4 text-sm font-bold whitespace-nowrap transition-all relative group",
                            isActive
                                ? "text-m3-primary"
                                : "text-m3-on-surface-variant hover:text-m3-on-surface"
                        )}
                    >
                        {tab.name}
                        {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-m3-primary rounded-t-full shadow-[0_0_8px_rgba(var(--m3-primary-rgb),0.3)]" />
                        )}
                        {!isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-m3-primary/0 group-hover:bg-m3-primary/10 transition-colors rounded-t-full" />
                        )}
                    </Link>
                );
            })}
        </div>
    );
}
