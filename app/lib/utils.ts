export const warpcastComposeCastUrl = () => {
  const frameUrl = `https://farville.farm`;
  const text = `I'm tired of touching grass IRL, and I can't wait to touch PIXEL grass in /farville...Build my dream farm and grow quirky crops. It's honest work, but way more fun than real farming!`;
  const urlFriendlyText = encodeURIComponent(text);
  return `https://warpcast.com/~/compose?text=${urlFriendlyText}&embeds[]=${frameUrl}`;
};
