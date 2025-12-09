import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import { preconnect } from "react-dom";
import { Providers } from "./providers";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Farville",
  description: "A farming simulation game",
  other: {
    "base:app_id": "693895f8e6be54f5ed71d4be",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  preconnect("https://auth.farcaster.xyz");

  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className={`${pixelFont.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
