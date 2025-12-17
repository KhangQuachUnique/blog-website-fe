/**
 * Convert emoji character to Unicode codepoint string
 * @param emoji - Emoji character (e.g., "😆" or "👨‍💻")
 * @returns Hex codepoint string separated by spaces (e.g., "1f606" or "1f468 200d 1f4bb")
 */
export function emojiToCodepoint(emoji: string): string {
  // Array.from() correctly handles multi-codepoint emojis (ZWJ sequences)
  return Array.from(emoji)
    .map((char) => {
      const codepoint = char.codePointAt(0);
      if (codepoint === undefined) return "";
      return codepoint.toString(16).toLowerCase();
    })
    .filter(Boolean)
    .join(" ");
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

  let codepoints: string;

  // Check if input is already a codepoint string (contains hex digits and optional spaces)
  const isCodepoint = /^[0-9a-fA-F\s]+$/.test(input);

  if (isCodepoint) {
    // Already codepoint format, just normalize
    codepoints = input.trim().toLowerCase();
  } else {
    // Input is emoji character, convert to codepoint
    codepoints = emojiToCodepoint(input);
  }

  // Convert spaces to hyphens for Twemoji format
  const filename = codepoints.replace(/\s+/g, "-");
  const ext = size === "svg" ? "svg" : "png";

  return `${BASE_URL}${filename}.${ext}`;
}
