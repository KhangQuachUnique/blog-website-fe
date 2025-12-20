import { useState } from "react";

export function useRecentEmojis(key = "recent_emojis") {
  const [recent, setRecent] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem(key) ?? "[]");
  });

  const add = (codepoint: string) => {
    const updated = [codepoint, ...recent.filter((e) => e !== codepoint)].slice(
      0,
      20
    );
    setRecent(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  return { recent, add };
}
