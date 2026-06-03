import { parseRichText } from "../utils/richText";

interface RichTextProps {
  text: string;
}

/**
 * Renders CSV text with {red}...{/red} markers as red highlighted spans.
 * Inline spans keep white-space: pre-wrap intact.
 */
export function RichText({ text }: RichTextProps) {
  return (
    <>
      {parseRichText(text).map((seg, i) =>
        seg.highlight ? (
          <span key={i} className="hl-danger">
            {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}
