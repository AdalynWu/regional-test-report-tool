import * as Tooltip from "@radix-ui/react-tooltip";

interface HelpTooltipProps {
  text: string;
  /** Visible trigger label; defaults to a "?" badge. */
  label?: string;
}

/**
 * Small accessible help trigger. Shows `text` on hover and keyboard focus.
 * The `title` attribute provides a fallback on touch devices where hover is
 * unreliable.
 */
export function HelpTooltip({ text, label = "?" }: HelpTooltipProps) {
  return (
    <Tooltip.Provider delayDuration={150}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            className="help-tip"
            aria-label={text}
          >
            {label}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="tooltip-content"
            side="top"
            align="start"
            sideOffset={6}
            collisionPadding={8}
          >
            {text}
            <Tooltip.Arrow className="tooltip-arrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
