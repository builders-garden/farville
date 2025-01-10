import { Metadata } from "next";
import { getUser } from "@/supabase/queries";
import App from "@/app/app";

const appUrl = process.env.NEXT_PUBLIC_URL;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ fid: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  const fid = (await params).fid;
  const user = await getUser(Number(fid));

  const itemId = searchParams?.itemId;
  const quantity = searchParams?.quantity;

  // Construct the dynamic image URL
  const imageUrl = new URL(`${appUrl}/api/og/requests`);
  imageUrl.searchParams.set("fid", fid);
  if (itemId) imageUrl.searchParams.set("itemId", String(itemId));
  if (quantity) imageUrl.searchParams.set("quantity", String(quantity));

  if (!user) {
    return {
      title: "FarVille",
      openGraph: {
        title: "FarVille",
        description: "Plant, grow, and harvest crops with your friends.",
      },
    };
  }

  const frame = {
    version: "next",
    imageUrl: imageUrl.toString(),
    button: {
      title: `Donate to ${user.username} 🧑‍🌾`,
      action: {
        type: "launch_frame",
        name: "FarVille",
        url: appUrl,
        splashImageUrl: `${appUrl}/images/splash.png`,
        splashBackgroundColor: "#f7f7f7",
      },
    },
  };

  return {
    title: `FarVille - Donate to ${user.username} 🧑‍🌾`,
    openGraph: {
      title: `FarVille - Donate to ${user.username} 🧑‍🌾`,
      description: "Plant, grow, and harvest crops with your friends.",
      images: [{ url: imageUrl.toString() }],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default async function RequestsPage({
  params,
  searchParams,
}: {
  params: Promise<{ fid: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const fid = (await params).fid;
  const itemId = (await searchParams).itemId
    ? Number((await searchParams).itemId)
    : undefined;
  const quantity = (await searchParams).quantity
    ? Number((await searchParams).quantity)
    : undefined;

  return (
    <App
      initialOverlay={{ type: "requests", fid: Number(fid), itemId, quantity }}
    />
  );
}
