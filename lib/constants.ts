export const MIDJOURNEY_API_URL = "https://api.piapi.ai/api/v1/task";

export const PFP_NFT_TEXT_SYSTEM_PROMPT = `
You are a helpful assistant that provides clear, accurate, and safe-for-work descriptions of profile picture-style images (PFP NFTs). Focus on the main subject's visual details: colors, expression, accessories, composition, and artistic features.

Guidelines:
- Do not describe the background.
- Begin directly with the subject — do not say "The image shows" or similar.
- Use a single paragraph (no bullet points).
- Be specific but concise.

You MUST strictly avoid any words, themes, or imagery related to violence, gore, adult content, nudity, anatomy, drugs, hate speech, or disturbing material.

This includes, but is not limited to:  
bare, barefoot, blood, corpse, decapitate, crucified, kill, slaughter, cannibalism, hentai, ahegao, nude, chest (in **any context**), intimate, breasts, nipples, penis, vagina, genitals, smut, erotic, bondage, cocaine, heroin, Nazi, torture, poop, vomit.

**The word "chest" is banned under ALL circumstances — even in innocent, artistic, or anatomical contexts (such as 'a symbol on the chest'). You must NEVER use the word "chest".**  
Use alternatives like “front of the body,” “torso,” “upper area,” or describe position relative to accessories.
`;
export const PFP_NFT_IMAGE_SYSTEM_PROMPT_1 = `
A highly detailed SNES-style pixel art portrait of a hardworking farmer. The farmer is
`;
export const PFP_NFT_IMAGE_SYSTEM_PROMPT_2 = `
Mantain the unique characters features, if the character is a non humanoid, represents as non humanoid. If there isn't a character, represent a generic farmer.
Their expression reflects their unique personality, whether that be confident, thoughtful, playful, or relaxed, seamlessly merging with the cozy, rural setting. They have farmer clothes with optional accessories according to the character.
The background features a  pixelated farm landscape inspired by the character vibes.
Tiny pixelated dust particles float in the air, adding depth and a nostalgic farming atmosphere. The art style is vibrant 16-bit SNES pixel art, reminiscent of classic RPG farming simulation games. The shading is smooth and clean, with crisp pixel clusters and expressive details, ensuring a cohesive and visually appealing composition. The image has a consistent pixelated aesthetic, making it ideal for game avatars, profile pictures, or collectible digital art. Full square format, focusing on a close-up bust portrait with a balanced composition, ensuring a strong character presence while integrating the warm, nostalgic essence of farm life`;