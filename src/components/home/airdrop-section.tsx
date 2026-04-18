"use client";

import {
  Paintbrush, ShoppingBag, Bot, Award, Package, Layers,
  BookOpen, FileCode2,
} from "lucide-react";
import { LaunchpadGrid } from "@medialane/ui";
import type { FeatureItem } from "@medialane/ui";

const FEATURES: FeatureItem[] = [
  { icon: Paintbrush, label: "Mint IP Assets",   subtitle: "Zero fees, permanent record on Starknet", accent: "from-violet-500 to-purple-600", href: "/create/asset" },
  { icon: ShoppingBag, label: "Marketplace",     subtitle: "Gasless trading, settled atomically",     accent: "from-blue-500 to-cyan-500",     href: "/marketplace" },
  { icon: Layers,      label: "Collections",     subtitle: "Deploy your branded IP catalog",          accent: "from-sky-500 to-blue-600",      href: "/create/collection" },
  { icon: Award,       label: "POP Protocol",    subtitle: "Soulbound event credentials",             accent: "from-emerald-400 to-teal-500",  href: "/launchpad" },
  { icon: Package,     label: "Collection Drop", subtitle: "Limited-edition NFT releases",            accent: "from-orange-400 to-rose-500",   href: "/launchpad" },
  { icon: Bot,         label: "AI Agent Ready",  subtitle: "Autonomous IP participation",             accent: "from-pink-500 to-fuchsia-600",  href: "/launchpad" },
  { icon: BookOpen,    label: "Learn",           subtitle: "Creator education & guides",              accent: "from-violet-500 to-indigo-600", href: "/about" },
  { icon: FileCode2,   label: "Developer Docs",  subtitle: "API, contracts & protocol reference",     accent: "from-slate-600 to-blue-700",    href: "/support" },
];

export function AirdropSection() {
  return <LaunchpadGrid features={FEATURES} />;
}
