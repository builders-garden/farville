import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// const geist = Geist({
//   variable: "--font-geist",
//   subsets: ["latin"],
// });

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FarVille",
  description: "A farming simulation game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${pixelFont.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
