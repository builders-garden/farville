import React from "react";

export interface MentionMatch {
  username: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Parse a message text to find all mentions (@username)
 * @param text The message text to parse
 * @returns Array of mention matches
 */
export function parseMentions(text: string): MentionMatch[] {
  const mentionRegex = /@([\w-]+)/g;
  const mentions: MentionMatch[] = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push({
      username: match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return mentions;
}

/**
 * Check if a user is mentioned in a message
 * @param text The message text
 * @param username The username to check for
 * @returns Whether the user is mentioned
 */
export function isUserMentioned(text: string, username: string): boolean {
  const mentions = parseMentions(text);
  return mentions.some(
    (mention) => mention.username.toLowerCase() === username.toLowerCase()
  );
}

/**
 * Render message text with mentions highlighted
 * @param text The message text
 * @param currentUsername The current user's username (for styling)
 * @returns JSX elements with mentions highlighted
 */
export function renderMessageWithMentions(
  text: string,
  currentUsername?: string
): (string | React.ReactElement)[] {
  const mentions = parseMentions(text);

  if (mentions.length === 0) {
    return [text];
  }

  const result: (string | React.ReactElement)[] = [];
  let lastIndex = 0;

  mentions.forEach((mention, index) => {
    // Add text before mention
    if (mention.startIndex > lastIndex) {
      result.push(text.substring(lastIndex, mention.startIndex));
    }

    // Add mention with styling
    const isCurrentUser =
      currentUsername &&
      mention.username.toLowerCase() === currentUsername.toLowerCase();

    result.push(
      React.createElement(
        "span",
        {
          key: `mention-${index}`,
          className: `font-bold ${
            isCurrentUser ? "text-[#FFD700]" : "text-[#87CEEB]"
          }`,
        },
        `@${mention.username}`
      )
    );

    lastIndex = mention.endIndex;
  });

  // Add remaining text after last mention
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }

  return result;
}

/**
 * Get all unique usernames mentioned in a message
 * @param text The message text
 * @returns Array of unique usernames
 */
export function getMentionedUsernames(text: string): string[] {
  const mentions = parseMentions(text);
  return [...new Set(mentions.map((mention) => mention.username))];
}
