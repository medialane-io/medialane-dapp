
"use client"

import { Card, CardContent } from "@/components/ui/card"

interface Attribute {
    trait: string
    value: string
    rarity?: string
}

export function AssetAttributes({ attributes }: { attributes: Attribute[] }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {attributes.map((attr, i) => (
                <Card key={i} className="bg-foreground/5 border-foreground/10 backdrop-blur-sm">
                    <CardContent className="p-3 text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{attr.trait}</p>
                        <p className="font-semibold text-foreground truncate" title={attr.value}>{attr.value}</p>
                        {attr.rarity && (
                            <p className="text-xs text-blue-400 mt-1">{attr.rarity}</p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
