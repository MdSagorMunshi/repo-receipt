import type { Metadata } from "next";

import { SiteFooter } from "@/components/SiteFooter";
import { getAppName, getMetadataBase, getThemeStorageKey } from "@/lib/site";
import "../styles/globals.css";

const appName = getAppName();

export const metadata: Metadata = {
  title: `${appName} — Every repo has a receipt`,
  description:
    "Generate a beautiful, shareable receipt for any public GitHub repository. Stars, commits, languages, contributors, and more.",
  metadataBase: getMetadataBase(),
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: `${appName} — Every repo has a receipt`,
    description:
      "Generate a beautiful, shareable receipt for any public GitHub repository. Stars, commits, languages, contributors, and more.",
    images: ["/og-default.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} — Every repo has a receipt`,
    description:
      "Generate a beautiful, shareable receipt for any public GitHub repository. Stars, commits, languages, contributors, and more.",
    images: ["/og-default.png"],
  },
};

const themeBootScript = `
(() => {
  try {
    const stored = window.localStorage.getItem("${getThemeStorageKey()}");
    const theme = stored === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
  } catch (_) {
    document.documentElement.dataset.theme = "light";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <link
          rel="preload"
          href="/fonts/playfair-display-700.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/playfair-display-700-italic.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/jetbrains-mono-400.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/jetbrains-mono-500.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/libre-baskerville-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen antialiased">
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
