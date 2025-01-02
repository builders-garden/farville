import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { getSession } from "../auth";

export const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FarVille",
  description: "A farming simulation game",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession()
  return (
    <html lang="en">
      <body className={`${pixelFont.className} antialiased`}>
        <Providers session={session!}>{children}</Providers>
      </body>
    </html>
  );
}
