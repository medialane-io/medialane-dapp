import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { StarknetProvider } from "@/components/starknet-provider";
import { CommandMenu } from "@/components/command-menu"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  themeColor: "#000000",
}

import { constructMetadata } from "@/utils/seo";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://dapp.medialane.io'),
  ...constructMetadata({
    title: "Medialane",
    description: "Create, Trade, and Monetize your Creative Works.",
  }),
  applicationName: "Medialane Dapp",
  authors: [{ name: "Medialane Protocol" }],
  generator: "Next.js",
  keywords: ["IP", "Intellectual Property", "Web3", "Starknet", "NFT", "Creator Economy", "Programmable IP", "Integrity Web"],
  appleWebApp: {
    title: "Medialane",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Medialane Dapp',
    url: 'https://dapp.medialane.io',
    logo: 'https://dapp.medialane.io/favicon.ico',
    description: "Create, Trade, and Monetize on the Integrity Web.",
    sameAs: [
      'https://twitter.com/medialane',
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased text-foreground overflow-x-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Providers>
            <StarknetProvider>
              <Header />
              <main className="min-h-screen pb-20">
                {children}
              </main>
              <Footer />
              <CommandMenu />
              <Toaster />
            </StarknetProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
