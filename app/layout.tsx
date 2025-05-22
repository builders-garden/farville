import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";

// const geist = Geist({
//   variable: "--font-geist",
//   subsets: ["latin"],
// });

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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${pixelFont.className} antialiased`}>
        <Toaster
          // offset={{ bottom: "20rem" }}
          offset={{ bottom: "4.5rem" }}
          toastOptions={{
            style: {
              padding: "0.375rem 0.75rem",
              fontSize: "0.7rem",
              filter: "drop-shadow(0 4px 4px rgb(0 0 0 / 0.15))",
              backgroundColor: "chocolate",
              color: "white",
              marginBottom: "4.5rem",
              width: "58%",
              marginLeft: "auto",
              marginRight: "30px",
              fontFamily: '"Press Start 2P"',
              border: "none",
              borderRadius: "1rem",
            },
            classNames: {
              description: "text-white/80",
            },
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
