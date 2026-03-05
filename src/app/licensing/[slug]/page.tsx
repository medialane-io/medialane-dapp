"use client"

import { use } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { LicensingAssetForm } from "@/components/licensing/licensing-asset-form"

interface LicensingPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default function LicensingOfferPage({ params }: LicensingPageProps) {
    const { slug } = use(params)

    // Parse asset slug [address]-[tokenid]
    const decodedSlug = decodeURIComponent(slug)
    const [rawAddress, tokenIdStr] = (decodedSlug || "").split("-")
    const tokenId = parseInt(tokenIdStr)

    // Resiliently handle both decimal and hex contract addresses
    let nftAddress = rawAddress;
    if (nftAddress && !nftAddress.startsWith("0x")) {
        try {
            nftAddress = "0x" + BigInt(nftAddress).toString(16);
        } catch (e) {
            console.warn("Could not parse decimal address from slug", e);
        }
    }

    // Basic Validation
    if (!decodedSlug || !nftAddress || isNaN(tokenId)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4 bg-m3-surface-container shadow-m3-1 border border-m3-outline-variant/20 rounded-m3-xl transition-shadow hover:shadow-m3-2 duration-m3-short p-12 max-w-lg mx-auto">
                    <h1 className="text-3xl font-bold text-red-500">Invalid Asset Link</h1>
                    <p className="text-muted-foreground">The licensing link you are trying to access is malformed or invalid.</p>
                    <Link href="/licensing">
                        <Button className="glass-button w-full">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Licensing Explorer
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pb-20">
            <main className="container mx-auto px-4 py-8 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <PageHeader
                        title="Create Licensing Offer"
                        description="Structure your terms and submit a binding offer."
                    >
                        <Link href="/licensing">
                            <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent hover:text-primary transition-colors">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Explorer
                            </Button>
                        </Link>
                    </PageHeader>
                </motion.div>

                <LicensingAssetForm nftAddress={nftAddress} tokenId={tokenId} />
            </main>
        </div>
    )
}
