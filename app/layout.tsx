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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  preconnect("https://auth.farcaster.xyz");

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${pixelFont.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
