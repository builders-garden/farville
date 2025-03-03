import { useState } from "react";

export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    return new Promise<boolean>((resolve) => {
      try {
        // Create a textarea element
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Make it visible but position out of viewport
        textArea.style.position = "fixed";
        textArea.style.left = "0";
        textArea.style.top = "0";
        textArea.style.width = "2em";
        textArea.style.height = "2em";
        textArea.style.opacity = "0";

        document.body.appendChild(textArea);

        // Add a small delay to ensure DOM update is complete
        setTimeout(() => {
          textArea.focus();
          textArea.select();

          // Execute copy command
          const success = document.execCommand("copy");

          // Clean up
          document.body.removeChild(textArea);
          resolve(success);
        }, 100);
      } catch (err) {
        console.error("Failed to copy: ", err);
        resolve(false);
      }
    });
  };

  const copy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    return success;
  };

  return { copied, copy };
}
