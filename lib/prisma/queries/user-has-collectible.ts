import { prisma } from "../client";
import { UserHasCollectible, Collectible, User, Prisma } from "@prisma/client";

// export const getUserCollectibles = async (
//   fid: number
// ): Promise<
//   (Collectible & { userHasCollectibles: UserHasCollectible | null })[]
// > => {
//   const collectibles = await prisma.collectible.findMany({
//     include: {
//       collectibles: {
//         where: {
//           fid: fid,
//         },
//       },
//     },
//   });

//   return collectibles.map((collectible) => ({
//     ...collectible,
//     userHasCollectibles: collectible.collectibles[0] || null,
//   }));
// };

export const getUserCollectibles = async (
  fid: number,
  category?: string
): Promise<
  (Collectible & { userHasCollectible: UserHasCollectible | null })[]
> => {
  const collectibles = await prisma.collectible.findMany({
    where: {
      collectibles: {
        some: { fid },
      },
      ...(category ? { category } : {}),
    },
    include: {
      collectibles: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return collectibles.map((collectible) => ({
    ...collectible,
    userHasCollectible: collectible.collectibles?.[0] || null,
  }));
};

export const getUserCollectibleByCollectibleId = async (
  fid: number,
  collectibleId: number
): Promise<(UserHasCollectible & { collectible: Collectible }) | null> => {
  const userCollectible = await prisma.userHasCollectible.findUnique({
    where: {
      fid_collectibleId: {
        fid,
        collectibleId,
      },
    },
    include: {
      collectible: true,
    },
  });

  return userCollectible;
};

export const updateUserCollectible = async (
  fid: number,
  collectibleId: number,
  updatedData: Prisma.UserHasCollectibleUpdateInput
): Promise<UserHasCollectible> => {
  const updatedCollectible = await prisma.userHasCollectible.upsert({
    where: {
      fid_collectibleId: {
        fid,
        collectibleId,
      },
    },
    update: updatedData,
    create: {
      ...(updatedData as Prisma.UserHasCollectibleUncheckedCreateInput), // Explicitly cast to the create input type
      collectibleId,
      fid,
    },
  });

  return updatedCollectible;
};

export const removeUserCollectible = async (
  fid: number,
  collectibleId: number
): Promise<void> => {
  await prisma.userHasCollectible.delete({
    where: {
      fid_collectibleId: {
        fid,
        collectibleId,
      },
    },
  });
};

export const updateUserCollectibleAsAvatar = async (
  fid: number,
  collectibleId: number
): Promise<User> => {
  const collectible = await prisma.userHasCollectible.findUnique({
    where: {
      fid_collectibleId: {
        fid,
        collectibleId,
      },
    },
  });

  if (!collectible) throw new Error("Collectible not found");
  if (!collectible.mintedImageUrl)
    throw new Error("User minted image not found");

  // Change image URL from https://gateway.pinata.cloud/ipfs/<CID> to https://<CID>.ipfs.dweb.link
  let imageUrl = collectible.mintedImageUrl;
  if (imageUrl.startsWith("https://gateway.pinata.cloud/ipfs/")) {
    imageUrl = imageUrl.replace(
      "https://gateway.pinata.cloud/ipfs/",
      "https://"
    );
    imageUrl += ".ipfs.dweb.link";
  }

  const updatedUser = await prisma.user.update({
    where: { fid },
    data: {
      selectedAvatarUrl: imageUrl,
    },
  });

  return updatedUser;
};

export const resetUserAvatar = async (fid: number): Promise<User> => {
  const updatedUser = await prisma.user.update({
    where: { fid },
    data: {
      selectedAvatarUrl: null,
    },
  });

  return updatedUser;
};
