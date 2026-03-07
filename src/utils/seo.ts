import { Metadata } from "next";

export function constructMetadata({
    title = "Medialane | IP Innovation Protocol",
    description = "Create, Trade, and Monetize on the Integrity Web. The premier decentralized protocol for programmable intellectual property.",
    image = "/og-image.jpg",
    icons = "/favicon.ico",
    noIndex = false,
    url = "/",
}: {
    title?: string;
    description?: string;
    image?: string;
    icons?: string;
    noIndex?: boolean;
    url?: string;
} = {}): Metadata {
    return {
        title,
        description,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title,
            description,
            url,
            siteName: "Medialane",
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            type: "website",
            locale: "en_US",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image],
            creator: "@medialane",
        },
        icons,
        ...((noIndex) && {
            robots: {
                index: false,
                follow: false,
            },
        }),
    };
}
