"use client";

import { PageHeader } from "@/components/page-header";
import { LicensingExplorer } from "./LicensingExplorer";
import { ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function LicensingPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-[1400px]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-3xl glass border border-foreground/10 p-8 md:p-12 mb-10 bg-gradient-to-br from-primary/10 via-background to-background"
            >
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                    <ShieldCheck className="w-64 h-64" />
                </div>

                <div className="relative z-10 max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
                        <Sparkles className="w-4 h-4" />
                        <span>Programmable IP Licensing</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-balance">
                        Discover and Acquire IP Licenses
                    </h1>

                    <p className="text-lg text-muted-foreground max-w-2xl text-pretty leading-relaxed">
                        Explore public collections and secure commercial usage rights for top-tier intellectual property seamlessly on-chain.
                    </p>
                </div>
            </motion.div>

            <LicensingExplorer />
        </div>
    );
}
