import React from "react";
import emojiRegex from "emoji-regex";
import { Emoji, EmojiStyle } from "emoji-picker-react";
import { getSelfHostedEmojiUrl } from "./emojiAssets";

function toUnified(match: string): string {
  return Array.from(match)
    .map((char) => char.codePointAt(0)!.toString(16))
    .join("-");
}

interface EmojiTextProps {
  text: string;
  size?: number;
}

export const EmojiText: React.FC<EmojiTextProps> = ({ text, size = 18 }) => {
  const regex = emojiRegex();
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // متن معمولی قبل از اموجی
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const unified = toUnified(match[0]);
    parts.push(
      <span
        key={`emoji-${key++}`}
        style={{
          display: "inline-flex",
          verticalAlign: "-0.2em",
          margin: "0 1px",
        }}
      >
        <Emoji
          unified={unified}
          emojiStyle={EmojiStyle.APPLE}
          size={size}
          getEmojiUrl={(u) => getSelfHostedEmojiUrl(u)}
        />
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  // باقی‌مانده متن
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
};