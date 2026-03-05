"use client"

import React, { useState, useEffect } from "react"
import { useAccount } from "@starknet-react/core"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import {
    ArrowLeft,
    ExternalLink,
    FileText,
    Info,
    Sparkles,
    Loader2,
    Globe,
    Clock,
    DollarSign,
    Percent,
    ShieldCheck,
    AlertCircle,
    GitBranch
} from "lucide-react"

import { licenseTypes, geographicScopes } from "@/types/asset"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

import { useToast } from "@/components/ui/use-toast"
import { useAsset } from "@/hooks/use-asset"
import { useSubmitLicenseOffer } from "@/services/licensing/licensingService"
import { shortenAddress } from "@/lib/utils"

interface LicensingAssetFormProps {
    nftAddress: string
    tokenId: number
}

// Removed USAGE_TYPES as we are using standardized fields now

export function LicensingAssetForm({ nftAddress, tokenId }: LicensingAssetFormProps) {
    const router = useRouter()
    const { address, isConnected } = useAccount()
    const { toast } = useToast()
    const { submitOnChainOffer } = useSubmitLicenseOffer()

    // Data Fetching
    const { displayAsset: originalAsset, loading: assetLoading, error: assetError } = useAsset(
        nftAddress as `0x${string}`,
        tokenId
    )

    // Form State
    const [formData, setFormData] = useState({
        license: "",
        geographicScope: "worldwide",
        territory: "",
        fieldOfUse: "",
        licenseDuration: "perpetual",
        grantBack: "",
        aiRights: "",
        price: "",
        royalty: "5",
        additionalTerms: ""
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    // Derived State
    const ownerAddress = typeof originalAsset?.owner === 'string'
        ? originalAsset.owner
        : originalAsset?.owner?.address || "0x0";

    const isOwner = ownerAddress.toLowerCase() === address?.toLowerCase();

    // Handlers
    const handleSubmit = async () => {
        if (!isConnected) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your wallet to proceed.",
                variant: "destructive"
            });
            return;
        }

        if (!formData.license || !formData.price || !formData.licenseDuration) {
            toast({
                title: "Missing Fields",
                description: "Please fill in all required fields (License Type, Price, Duration).",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await submitOnChainOffer({
                assetId: `${nftAddress}-${tokenId}`,
                collectionAddress: nftAddress,
                tokenId: tokenId.toString(),
                ownerAddress: ownerAddress,
                terms: {
                    licenseType: formData.license,
                    geographicScope: formData.geographicScope,
                    territory: formData.territory,
                    fieldOfUse: formData.fieldOfUse,
                    grantBack: formData.grantBack,
                    aiRights: formData.aiRights,
                    price: formData.price,
                    royalty: parseFloat(formData.royalty),
                    duration: formData.licenseDuration === "perpetual" ? 3153600000 : parseInt(formData.licenseDuration) * 86400, // Handle perpetual/custom logic
                    usage: formData.additionalTerms // Storing context here
                }
            });

            toast({
                title: "Offer Submitted",
                description: "Your license offer has been successfully posted on-chain.",
            });

            // Optional: Redirect or reset
            // router.push("/licensing");
        } catch (error: any) {
            console.error("Licensing Error:", error);
            toast({
                title: "Submission Failed",
                description: error.message || "An error occurred while submitting the offer.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (assetLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading asset details...</p>
            </div>
        )
    }

    if (assetError || !originalAsset) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center space-y-6 p-8 bg-m3-surface-container shadow-m3-1 border border-m3-outline-variant/20 rounded-m3-xl transition-shadow hover:shadow-m3-2 duration-m3-short max-w-md mx-auto border-red-500/20">
                    <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="h-10 w-10 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Asset Not Found</h1>
                        <p className="text-muted-foreground mt-2">The asset you are looking for could not be loaded.</p>
                    </div>
                    <Link href="/licensing">
                        <Button variant="outline" className="glass-button w-full">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Return to Explorer
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column - Visuals & Preview */}
            <motion.div
                className="lg:col-span-5 space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="bg-m3-surface-container shadow-m3-1 border border-m3-outline-variant/20 rounded-m3-xl transition-shadow hover:shadow-m3-2 duration-m3-short overflow-hidden border-primary/20 shadow-2xl shadow-primary/5">
                    <div className="aspect-square relative bg-black/20 group">
                        <Image
                            src={originalAsset.image || "/placeholder.svg"}
                            alt={originalAsset.name || "Asset"}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                        <div className="absolute bottom-0 left-0 right-0 p-6 text-foreground">
                            <div className="flex items-center gap-2 text-sm opacity-80 mb-1">
                                <Badge variant="outline" className="bg-black/40 border-border text-foreground backdrop-blur-md">
                                    {/* @ts-ignore - Collection name might be missing on some types */}
                                    {originalAsset.collectionName || originalAsset.collection?.name || "Collection"}
                                </Badge>
                                <span>#{tokenId}</span>
                            </div>
                            <h2 className="text-3xl font-bold leading-tight">{originalAsset.name}</h2>
                        </div>
                    </div>

                    <div className="p-6 space-y-4 bg-card/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between text-sm border-b border-border/50 pb-4">
                            <span className="text-muted-foreground">Owner</span>
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                                <span className="font-medium font-mono">{shortenAddress(ownerAddress)}</span>
                                {isOwner && <Badge className="ml-1 bg-primary/20 text-primary border-primary/20">You</Badge>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <span className="text-sm text-muted-foreground">Original License</span>
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-foreground/5 border border-border/50">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="font-medium text-sm">
                                    {originalAsset.attributes?.find(a => a.trait_type === "License Type")?.value || originalAsset.licenseType || 'Standard'}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Link href={`/asset/${nftAddress}-${tokenId}`} target="_blank" className="flex-1">
                                <Button variant="outline" size="sm" className="w-full glass-button gap-2">
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    View Original
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Trust/Info Card */}
                <Card className="bg-m3-surface-container shadow-m3-1 border border-m3-outline-variant/20 rounded-m3-xl transition-shadow hover:shadow-m3-2 duration-m3-short bg-primary/5 border-primary/10">
                    <CardContent className="p-4 flex gap-4 items-start">
                        <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-1" />
                        <div className="space-y-1">
                            <h4 className="font-semibold text-sm">Secure On-Chain Agreement</h4>
                            <p className="text-xs text-muted-foreground">
                                This offer is cryptographically signed and recorded on Starknet.
                                Terms are immutable once accepted.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Right Column - Deal Builder */}
            <motion.div
                className="lg:col-span-7 space-y-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            >
                <div className="space-y-2 mb-6">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Sparkles className="h-8 w-8 text-primary" />
                        License Deal Builder
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Define the commercial terms for this IP license.
                    </p>
                </div>

                <div className="bg-m3-surface-container shadow-m3-1 border border-m3-outline-variant/20 rounded-m3-xl transition-shadow hover:shadow-m3-2 duration-m3-short p-8 space-y-8 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    {/* 1. License Configuration (Standardized) */}
                    <section className="space-y-6 relative">
                        <div className="flex items-center gap-2 text-primary font-semibold border-b border-primary/20 pb-2 mb-4">
                            <Globe className="h-5 w-5" />
                            <h3>License Configuration</h3>
                        </div>

                        <div className="grid gap-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>License Type</Label>
                                    <Select
                                        value={formData.license}
                                        onValueChange={(value) => setFormData((prev) => ({ ...prev, license: value }))}
                                    >
                                        <SelectTrigger className="bg-foreground/5 border-border/50 focus:ring-primary/50 h-11">
                                            <SelectValue placeholder="Select license" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {licenseTypes.map((license) => (
                                                <SelectItem key={license.id} value={license.id}>
                                                    <span className="font-medium">{license.name}</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Geographic Scope</Label>
                                    <Select
                                        value={formData.geographicScope}
                                        onValueChange={(value) => setFormData((prev) => ({ ...prev, geographicScope: value }))}
                                    >
                                        <SelectTrigger className="bg-foreground/5 border-border/50 focus:ring-primary/50 h-11">
                                            <SelectValue placeholder="Select scope" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {geographicScopes.map((scope) => (
                                                <SelectItem key={scope.value} value={scope.value}>
                                                    {scope.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {(formData.geographicScope === "other" || formData.geographicScope === "custom" || formData.geographicScope === "eu") && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label htmlFor="territory">Specific Territory</Label>
                                    <Input
                                        id="territory"
                                        placeholder="e.g. Germany, France, Japan..."
                                        value={formData.territory}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, territory: e.target.value }))}
                                        className="bg-foreground/5 border-border/50 focus:ring-primary/50"
                                    />
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="fieldOfUse">Field of Use</Label>
                                    <Input
                                        id="fieldOfUse"
                                        placeholder="e.g. Medical, Gaming..."
                                        value={formData.fieldOfUse}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, fieldOfUse: e.target.value }))}
                                        className="bg-foreground/5 border-border/50 focus:ring-primary/50 h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="licenseDuration">Duration</Label>
                                    <Input
                                        id="licenseDuration"
                                        placeholder="e.g. Perpetual, 5 years..."
                                        value={formData.licenseDuration}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, licenseDuration: e.target.value }))}
                                        className="bg-foreground/5 border-border/50 focus:ring-primary/50 h-11"
                                    />
                                </div>
                            </div>

                            {/* Advanced */}
                            <div className="pt-4 border-t border-border/25 space-y-4">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="grantBack" className="text-xs uppercase tracking-wider text-muted-foreground">Grant-back Clause</Label>
                                        <Input
                                            id="grantBack"
                                            placeholder="Conditions for improvements..."
                                            value={formData.grantBack}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, grantBack: e.target.value }))}
                                            className="bg-foreground/5 border-border/50 focus:ring-primary/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="aiRights" className="text-xs uppercase tracking-wider text-muted-foreground">AI & Data Policy</Label>
                                        <Input
                                            id="aiRights"
                                            placeholder="AI Training allowed/prohibited..."
                                            value={formData.aiRights}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, aiRights: e.target.value }))}
                                            className="bg-foreground/5 border-border/50 focus:ring-primary/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. Commercials */}
                    <section className="space-y-4 relative">
                        <div className="flex items-center gap-2 text-primary font-semibold border-b border-primary/20 pb-2 mb-4">
                            <DollarSign className="h-5 w-5" />
                            <h3>Commercial Terms</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="price">License Fee (STRK)</Label>
                                <div className="relative">
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="0.00"
                                        className="pl-10 h-12 bg-foreground/5 border-border/50 focus:ring-primary/50 text-lg font-medium"
                                        value={formData.price}
                                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">$</div>
                                </div>
                                <p className="text-xs text-muted-foreground">One-time payment to the owner.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="royalty">Royalty on Revenue</Label>
                                <div className="relative">
                                    <Input
                                        id="royalty"
                                        type="number"
                                        placeholder="5"
                                        className="pr-10 h-12 bg-foreground/5 border-border/50 focus:ring-primary/50 text-lg font-medium"
                                        value={formData.royalty}
                                        onChange={(e) => setFormData(prev => ({ ...prev, royalty: e.target.value }))}
                                    />
                                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground">Percentage of future earnings.</p>
                            </div>
                        </div>
                    </section>

                    {/* 3. Additional Context */}
                    <section className="space-y-4 relative">
                        <div className="flex items-center gap-2 text-primary font-semibold border-b border-primary/20 pb-2 mb-4">
                            <Info className="h-5 w-5" />
                            <h3>Additional Context</h3>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="terms">Notes</Label>
                            <Textarea
                                id="terms"
                                placeholder="Any additional context for the offer..."
                                className="bg-foreground/5 border-border/50 focus:ring-primary/50 resize-none min-h-[100px]"
                                value={formData.additionalTerms}
                                onChange={(e) => setFormData(prev => ({ ...prev, additionalTerms: e.target.value }))}
                            />
                        </div>
                    </section>

                    <Separator className="bg-foreground/10" />

                    <div className="pt-2">
                        <Button
                            className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20"
                            size="lg"
                            onClick={handleSubmit}
                            disabled={isSubmitting || !isConnected}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Submitting Offer...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    Sign & Submit Offer
                                </>
                            )}
                        </Button>
                        {!isConnected && (
                            <p className="text-center text-xs text-red-400 mt-2">Please connect your wallet to continue.</p>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
