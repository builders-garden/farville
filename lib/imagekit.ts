import ImageKit from "imagekit";
import { env } from "./env";

export const IMAGEKIT_URL_ENDPOINT =
  "https://ik.imagekit.io/gmbuildersgarden/farville/";
export const IMAGEKIT_PUBLIC_KEY = "public_zmtZELv7v6AVK6IdaRvmWFIsm8M=";

const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});

export const uploadImage = async (file: File, fileName: string) => {
  const imageBytes = await file!.arrayBuffer();
  const imageBuffer = Buffer.from(imageBytes);
  const response = await imagekit.upload({
    file: imageBuffer, //required
    fileName, //required
  });
  return response.url;
};

export const deleteImage = async (imageUrl: string) => {
  const response = await imagekit.deleteFile(imageUrl);
  return response;
};
