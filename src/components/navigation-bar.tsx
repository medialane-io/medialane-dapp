"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Home, Rocket, User, Boxes } from "lucide-react";

export function NavigationBar() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const navItems = [
        { href: "/", label: "Home", icon: Home, matchPattern: /^\/$/ },
        { href: "/marketplace", label: "Explore", icon: Boxes, matchPattern: /^\/marketplace/ },
        { href: "/launchpad", label: "Launchpad", icon: Rocket, matchPattern: /^\/launchpad/ },
        { href: "/portfolio", label: "Portfolio", icon: User, matchPattern: /^\/portfolio/ },
    ];

    if (!mounted) return null;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-m3-surface-container-highest border-t border-m3-outline-variant/20 pb-safe">
            <nav className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const isActive = item.matchPattern.test(pathname);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center w-full h-full gap-1"
                        >
                            <div
                                className={cn(
                                    "relative flex items-center justify-center w-16 h-8 rounded-m3-full z-10 transition-colors duration-m3-short",
                                    isActive ? "text-m3-on-secondary-container" : "text-m3-on-surface-variant group-hover:bg-m3-on-surface/8"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute inset-0 bg-m3-secondary-container rounded-m3-full -z-10"
                                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                                    />
                                )}
                                <Icon
                                    className={cn(
                                        "w-5 h-5 transition-transform duration-m3-short",
                                        isActive ? "scale-110" : ""
                                    )}
                                    fill={isActive ? "currentColor" : "none"}
                                />
                            </div>
                            <span
                                className={cn(
                                    "text-[10px] font-medium leading-none tracking-wide transition-colors duration-m3-short",
                                    isActive ? "text-m3-on-surface" : "text-m3-on-surface-variant"
                                )}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
