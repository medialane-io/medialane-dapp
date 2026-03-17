"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader, FileText, Settings2, Scale, Tag } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { AssetPreview } from "@/components/asset-creation/asset-preview"
import { PageHeader } from "@/components/page-header"
import { AssetConfirmation } from "@/components/asset-creation/asset-confirmation"
import { AssetBasicInfo } from "@/components/asset-creation/asset-basic-info"
import { AssetDetails } from "@/components/asset-creation/asset-details"
import { LicensingOptions } from "@/components/asset-creation/licensing-options"
import { TemplateInfoCard } from "@/components/asset-creation/template-info-card"
import { TemplateSpecificFields } from "@/components/asset-creation/template-specific-fields"
import { useAssetForm } from "@/hooks/use-asset-form"
import { templates, getTemplateById } from "@/lib/templates"
import { useAccount } from "@starknet-react/core"
import { useToast } from "@/hooks/use-toast"
import { useIpfsUpload } from "@/hooks/use-ipfs"
import { useCreateAsset, IMintResult } from "@/hooks/use-create-asset"
import { useGetCollections, useIsCollectionOwner } from "@/hooks/use-collection"
import { normalizeStarknetAddress } from "@/lib/utils"
import { useProvider } from "@starknet-react/core"
import { num, hash } from "starknet"
import { MintSuccessDrawer, MintDrawerStep } from "@/components/mint-success-drawer"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import CreateCollectionView from "@/components/collections/create-collection"
import { Card, CardContent } from "@/components/ui/card"
import { useMarketplace } from "@/hooks/use-marketplace"
import { ItemType } from "@/types/marketplace"
import { SUPPORTED_TOKENS } from "@/lib/constants"

export default function CreateAssetFromTemplate() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { provider } = useProvider()
  const templateId = params.templateId as string
  const { address: walletAddress } = useAccount()

  // Hooks
  const { uploadToIpfs, loading: upload_loading } = useIpfsUpload()
  const { createAsset, isCreating } = useCreateAsset()
  const { checkOwnership } = useIsCollectionOwner()
  const { createListing } = useMarketplace()
  const usdcToken = SUPPORTED_TOKENS.find(t => t.symbol === "USDC")
  const {
    collections,
    loading: collection_loading,
    error: collection_error,
    reload,
  } = useGetCollections(walletAddress)

  // Local State
  const [loading, setLoading] = useState(false)
  const [showMobilePreview, setShowMobilePreview] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [hasUserEditedCreator, setHasUserEditedCreator] = useState(false)
  const [openCollection, setOpenCollection] = useState(false)

  // Drawer State
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false)
  const [mintStep, setMintStep] = useState<MintDrawerStep>("idle")
  const [mintProgress, setMintProgress] = useState(0)
  const [mintResult, setMintResult] = useState<IMintResult | null>(null)
  const [mintError, setMintError] = useState<string | null>(null)
  const [drawerPreviewImage, setDrawerPreviewImage] = useState<string | null>(null)

  // Find the template
  const template = getTemplateById(templateId)

  // Initialize form with template-specific defaults
  // Initialize form with template-specific defaults
  const {
    formState,
    updateFormField,
    handleFileChange,
    handleFeaturedImageChange,
    canSubmit
  } = useAssetForm({
    assetType: templateId,
  })

  // Auto-populate creator field with wallet address
  useEffect(() => {
    if (walletAddress && formState.creator === "" && !hasUserEditedCreator) {
      updateFormField("creator", walletAddress);
    }
  }, [walletAddress, updateFormField, hasUserEditedCreator]);

  const handleCreatorFieldChange = (field: "creator", value: string) => {
    if (field === "creator") {
      setHasUserEditedCreator(true);
    }
    updateFormField(field, value);
  };

  // Redirect if template not found
  useEffect(() => {
    if (!template) {
      router.push("/create/templates")
    }
  }, [template, router])

  if (!template) {
    return null
  }

  const handleTemplateChange = (newTemplateId: string) => {
    router.push(`/create/templates/${newTemplateId}`)
  }

  const handleSubmit = async () => {
    // Only proceed if wallet is connected
    if (!walletAddress) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create an asset.",
        variant: "destructive",
      })
      return
    }

    if (!canSubmit()) return;

    // Prepare Review State
    setMintStep("idle")
    setMintError(null)

    // Create local preview URL for the review step
    if (formState.mediaFile) {
      setDrawerPreviewImage(URL.createObjectURL(formState.mediaFile));
    } else {
      setDrawerPreviewImage(null);
    }

    // Open Drawer for Review
    setShowSuccessDrawer(true)
  }

  const handleConfirmMint = async () => {
    setLoading(true)

    // START DRAWER PROCESS
    setMintStep("uploading")
    setMintProgress(0)

    try {
      // 1. Create metadata object
      const metadata = {
        name: formState.title,
        description: formState.description,
        external_url: "",
        attributes: [
          { trait_type: "Type", value: formState.assetType },
          { trait_type: "Creator", value: formState.creator },
          { trait_type: "License", value: formState.licenseType },
          { trait_type: "Geographic Scope", value: formState.geographicScope },
          { trait_type: "Template", value: template.name },
          { trait_type: "Tags", value: formState.tags.join(", ") },
          // Include template specific fields in attributes
          ...Object.entries(formState.metadataFields).map(([key, value]) => ({
            trait_type: key,
            value: String(value),
          })),
        ],
        // Also include raw template data for easier parsing if needed
        properties: {
          template_id: template.id,
          ...formState.metadataFields
        }
      }

      // 2. Get collection info
      const collectionNftAddress = collections.find(
        (c) => parseInt(c.id.toString()) === parseInt(formState.collection)
      )?.nftAddress

      const contractHex = collectionNftAddress
        ? normalizeStarknetAddress(String(collectionNftAddress))
        : "N/A"

      // 3. Extra Check for collection ownership
      const isOwner = await checkOwnership(
        formState.collection,
        walletAddress as string
      )

      if (!isOwner) {
        throw new Error("You are not the owner of this collection")
      }

      // 4. Upload media and metadata to IPFS
      setMintProgress(10)
      const result = await uploadToIpfs(formState.mediaFile as File, metadata, formState.featuredImage)
      setMintProgress(50)

      // 5. Make contract call
      setMintStep("processing")
      setMintProgress(60)

      const mintTxApply = await createAsset({
        collection_id: formState.collection,
        recipient: walletAddress as string,
        token_uri: result?.metadataUrl,
        collection_nft_address: contractHex,
      })

      if (mintTxApply?.transactionHash) {
        // Wait for transaction to be accepted to get the event
        const receipt = await provider.waitForTransaction(mintTxApply.transactionHash)

        const tokenMintedSelector = hash.getSelectorFromName("TokenMinted")

        if (receipt.isSuccess() && 'events' in receipt) {
          const events = receipt.events
          const mintEvent = events.find(
            (e: any) => e.keys[0] === tokenMintedSelector
          )

          if (mintEvent && mintEvent.data) {
            // token_id is u256 at index 2 and 3 of data array
            const low = mintEvent.data[2]
            const parsedId = num.toBigInt(low).toString()
            console.log("Parsed Token ID from Template:", parsedId)

            mintTxApply.tokenId = parsedId
            mintTxApply.assetSlug = `${contractHex}-${parsedId}`
          }
        }
      }

      setMintProgress(90)

      // --- AUTO-LIST ON MARKETPLACE ---
      if (formState.listOnMarketplace && formState.listingPrice && parseFloat(formState.listingPrice) > 0) {
        try {
          setMintStep("listing")
          setMintProgress(92)

          const tokenId = mintTxApply.tokenId
          const nftAddress = contractHex
          const listingCurrency = formState.listingCurrency || "USDC"
          const duration = 30 * 24 * 60 * 60

          setMintProgress(95)
          const listingTxHash = await createListing(
            nftAddress,
            tokenId,
            formState.listingPrice,
            listingCurrency,
            duration
          )

          if (listingTxHash) {
            toast({
              title: "🏷️ Listed on Marketplace!",
              description: `Your ${template.name} asset is now listed for ${formState.listingPrice} ${listingCurrency}.`,
            })
          }
        } catch (listingError) {
          console.error("Auto-listing failed:", listingError)
          toast({
            title: "Mint succeeded, listing failed",
            description: "Your NFT was minted but couldn't be listed. You can list it manually from the asset page.",
            variant: "destructive",
          })
        }
      }

      // 6. Handle success
      setMintResult(mintTxApply)
      setMintStep("success")
      setMintProgress(100)
      setIsComplete(true)

      toast({
        title: "IP Minted Successfully!",
        description: `Your ${template.name} asset has been registered on the blockchain.`,
      })

    } catch (error) {
      console.error("Error minting from template:", error)
      const errorMsg = error instanceof Error
        ? error.message
        : "Failed to mint asset"

      setMintError(errorMsg)
      // Keep drawer open but maybe set step to idle or just show error in drawer?
      // Our drawer handles error prop, so we keep it open to show error

      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Collection Creation Modal */}
      {openCollection && (
        <Dialog open={openCollection} onOpenChange={setOpenCollection}>
          <DialogContent className="max-w-none overflow-y-auto w-[calc(100vw-2rem)] h-[calc(100vh-2rem)] max-h-none p-0 gap-0 border-0 shadow-2xl">
            <CreateCollectionView isModalMode={true} />
          </DialogContent>
        </Dialog>
      )}

      {/* Mint Success / Feedback Drawer */}
      <MintSuccessDrawer
        isOpen={showSuccessDrawer}
        onOpenChange={setShowSuccessDrawer}
        step={mintStep}
        progress={mintProgress}
        mintResult={mintResult}
        assetTitle={formState.title}
        assetDescription={formState.description}
        assetType={template.name}
        error={mintError}
        onConfirm={handleConfirmMint}
        cost="0.001 STRK" /* Estimate */
        previewImage={drawerPreviewImage}
        data={{
          "License Type": formState.licenseType,
          "Collection": collections.find(c => c.id.toString() === formState.collection)?.name || "Unknown",
          ...(formState.listOnMarketplace && formState.listingPrice ? { "Listing Price": `${formState.listingPrice} ${formState.listingCurrency || "USDC"}` } : {}),
        }}
      />

      {/* Mobile Preview Modal */}
      {showMobilePreview && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden">
          <div className="fixed inset-x-4 top-4 bottom-4 bg-background border rounded-lg shadow-lg overflow-auto">
            <div className="bg-background border-b p-4 flex items-center justify-between">
              <h2 className="font-semibold">Preview</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowMobilePreview(false)}>
                ✕
              </Button>
            </div>
            <div className="p-4">
              <AssetPreview formState={formState} template={template} />
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto p-4 max-w-7xl">
        <PageHeader
          title={`Create ${template.name} Asset`}
          description={`Register your ${template.name.toLowerCase()} intellectual property on the blockchain with optimized metadata.`}
          className="mb-8"
        />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">

            <Accordion type="multiple" defaultValue={["basic-info", "ip-type"]} className="w-full space-y-4">

              {/* 1. Basic Information (Top Priority) */}
              <AccordionItem value="basic-info" className="relative group rounded-xl border border-border/50 bg-card/40 backdrop-blur-xl shadow-sm overflow-hidden transition-all hover:border-outrun-cyan/40">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-outrun-cyan/30 to-transparent opacity-100 transition-opacity" />
                <AccordionTrigger className="hover:no-underline px-6 py-5 text-lg font-medium transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 text-primary shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                      <FileText className="h-5 w-5" />
                    </div>
                    <span className="text-foreground/90">Asset Info</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-6 border-t border-border/10 bg-background/50">
                  <AssetBasicInfo
                    formState={formState}
                    updateFormField={updateFormField}
                    handleFileChange={handleFileChange}
                    collections={collections || []}
                    isLoadingCollections={collection_loading}
                    collectionError={collection_error}
                    refetchCollections={reload}
                    openCollectionModal={() => setOpenCollection(true)}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* 2. IP Type (Template Specifics) */}
              <AccordionItem value="ip-type" className="relative group rounded-xl border border-border/50 bg-card/40 backdrop-blur-xl shadow-sm overflow-hidden transition-all hover:border-outrun-magenta/40">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-outrun-magenta/30 to-transparent opacity-100 transition-opacity" />
                <AccordionTrigger className="hover:no-underline px-6 py-5 text-lg font-medium transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 text-primary shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                      <Settings2 className="h-5 w-5" />
                    </div>
                    <span className="text-foreground/90">{template.name} Details</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-6 border-t border-border/10 bg-background/50">
                  <p className="text-sm text-muted-foreground mb-4">
                    {template.description}
                  </p>
                  <TemplateSpecificFields
                    template={template}
                    formState={formState}
                    updateFormField={updateFormField}
                    onFeaturedImageChange={handleFeaturedImageChange}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* 3. Advanced Configuration */}
              <AccordionItem value="advanced-info" className="relative group rounded-xl border border-border/50 bg-card/40 backdrop-blur-xl shadow-sm overflow-hidden transition-all hover:border-outrun-yellow/40">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-outrun-yellow/30 to-transparent opacity-100 transition-opacity" />
                <AccordionTrigger className="hover:no-underline px-6 py-5 text-lg font-medium transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 text-primary shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                      <Tag className="h-5 w-5" />
                    </div>
                    <span className="text-foreground/90">Advanced Information</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-6 border-t border-border/10 bg-background/50 space-y-8">
                  <div id="asset-details" className="pt-2">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-muted-foreground">
                      Categorization
                    </h3>
                    <AssetDetails
                      formState={formState}
                      updateFormField={updateFormField}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 4. Licensing Options */}
              <AccordionItem value="licensing" className="relative group rounded-xl border border-border/50 bg-card/40 backdrop-blur-xl shadow-sm overflow-hidden transition-all hover:border-neon-cyan/40">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent opacity-100 transition-opacity" />
                <AccordionTrigger className="hover:no-underline px-6 py-5 text-lg font-medium transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 text-primary shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                      <Scale className="h-5 w-5" />
                    </div>
                    <span className="text-foreground/90">Programmable Licensing</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-6 border-t border-border/10 bg-background/50">
                  <LicensingOptions
                    formState={formState}
                    updateFormField={updateFormField}
                  />
                </AccordionContent>
              </AccordionItem>

            </Accordion>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSubmit}
                disabled={
                  !canSubmit() ||
                  loading ||
                  isCreating ||
                  upload_loading ||
                  !walletAddress ||
                  !formState.collection
                }
                size="lg"
                className="px-10 h-14 text-lg font-bold tracking-wider bg-gradient-to-r from-outrun-cyan to-outrun-magenta hover:from-outrun-cyan/90 hover:to-outrun-magenta/90 text-white shadow-lg shadow-outrun-magenta/20 transition-all rounded-xl hover:-translate-y-0.5 border border-foreground/10 w-full sm:w-auto"
              >
                {loading && <Loader className="animate-spin h-5 w-5 mr-3" />}
                {loading
                  ? (upload_loading ? "Uploading..." : isCreating ? "Minting..." : "Processing")
                  : `Create ${template.name} Asset`
                }
              </Button>
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="space-y-6">
              {/* Template Info */}
              <TemplateInfoCard template={template} />

              {/* Live Preview */}
              <AssetPreview formState={formState} template={template} />

              {/* Help Card */}
              <Card className="relative bg-card/40 backdrop-blur-xl border border-border/50 shadow-sm rounded-xl overflow-hidden">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Need Help?
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Learn more about creating and protecting your intellectual
                    property assets with the {template.name} template.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                  >
                    View Documentation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
