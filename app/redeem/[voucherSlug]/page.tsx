import { Metadata } from "next";
import App from "@/app/app";
import { env } from "@/lib/env";
// import { getVoucherBySlug } from "@/lib/prisma/queries";
import { FARCON_VOUCHER } from "@/lib/modes/constants";

const appUrl = env.NEXT_PUBLIC_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ voucherSlug: string }>;
}): Promise<Metadata> {
  const voucherSlug = (await params).voucherSlug;
  // const voucher = await getVoucherBySlug(voucherSlug);
  const isFarconVoucher = voucherSlug === FARCON_VOUCHER.slug;
  const buttonUrl = isFarconVoucher
    ? `${appUrl}/redeem/${voucherSlug}`
    : appUrl;
  const frame = {
    version: "next",
    imageUrl: `${appUrl}/images/feed.png`,
    button: {
      title: "Play Farville 🧑‍🌾",
      action: {
        type: "launch_frame",
        name: "Farville",
        url: buttonUrl,
        splashImageUrl: `${appUrl}/images/splash.png`,
        splashBackgroundColor: "#f7f7f7",
      },
    },
  };

  return {
    title: "Farville",
    openGraph: {
      title: "Farville",
      description: "Plant, grow, and harvest crops with your friends.",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default async function RedeemPage({
  params,
}: {
  params: Promise<{ voucherSlug: string }>;
}) {
  const voucherSlug = (await params).voucherSlug;
  // const voucher = await getVoucherBySlug(voucherSlug);
  const isFarconVoucher = voucherSlug === FARCON_VOUCHER.slug;
  if (!isFarconVoucher) {
    return <App />;
  }
  return <App initialOverlay={{ type: "voucher", slug: voucherSlug }} />;
}
