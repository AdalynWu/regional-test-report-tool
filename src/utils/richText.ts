export interface RichSegment {
  text: string;
  highlight: boolean;
}

/** Matches {red}...{/red} (non-greedy, across newlines). */
const RED_MARKER = /\{red\}([\s\S]*?)\{\/red\}/g;

/**
 * Split text into plain / highlighted segments based on {red}...{/red} markers.
 * Unbalanced or stray markers don't match and are kept as literal text.
 */
export function parseRichText(input: string): RichSegment[] {
  const segments: RichSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  RED_MARKER.lastIndex = 0;
  while ((match = RED_MARKER.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: input.slice(lastIndex, match.index), highlight: false });
    }
    segments.push({ text: match[1], highlight: true });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < input.length) {
    segments.push({ text: input.slice(lastIndex), highlight: false });
  }

  return segments;
}
