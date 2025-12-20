/**
 * Convert emoji character to Unicode codepoint string
 * @param emoji - Emoji character (e.g., "😆" or "👨‍💻")
 * @returns Hex codepoint string separated by spaces (e.g., "1f606" or "1f468 200d 1f4bb")
 */
export function emojiToCodepoint(emoji: string): string {
  // Split into codepoints, including ZWJ sequences
  return [...emoji]
    .map((c) => c.codePointAt(0)?.toString(16).toLowerCase())
    .filter(Boolean)
    .join("-");
}

/**
 * Get Twemoji SVG URL from Cloudflare CDN
 * @param input - Either emoji character or codepoint string (e.g., "😆" or "1f606" or "1f468 200d 1f4bb")
 * @returns Full Twemoji SVG URL
 */
export function getTwemojiUrl(
  input: string,
  size: "72x72" | "svg" = "72x72"
): string {
  const BASE_URL =
    size === "svg"
      ? "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/"
      : "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/";

  // Convert emoji character to codepoint string with hyphens
  const codepoints = /^[0-9a-fA-F-]+$/.test(input)
    ? input.toLowerCase()
    : emojiToCodepoint(input);

  const ext = size === "svg" ? "svg" : "png";
  return `${BASE_URL}${codepoints}.${ext}`;
}
