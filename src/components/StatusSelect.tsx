import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { TestStatus } from "../types/report";

export interface StatusOption {
  value: TestStatus;
  label: string;
}

interface StatusSelectProps {
  value: TestStatus;
  options: StatusOption[];
  onChange: (value: TestStatus) => void;
  ariaLabel?: string;
}

/**
 * Custom dropdown (not the browser-native <select>) so the menu can be styled
 * to match the QA dashboard. Supports mouse, click-outside, Esc, and arrow keys.
 */
export function StatusSelect({
  value,
  options,
  onChange,
  ariaLabel,
}: StatusSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  const select = (next: TestStatus) => {
    onChange(next);
    setOpen(false);
  };

  const moveSelection = (delta: number) => {
    const index = options.findIndex((o) => o.value === value);
    const nextIndex = Math.min(
      Math.max(index + delta, 0),
      options.length - 1,
    );
    onChange(options[nextIndex].value);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case "Escape":
        setOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (open) moveSelection(1);
        else setOpen(true);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (open) moveSelection(-1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        setOpen((o) => !o);
        break;
    }
  };

  return (
    <div className="select" ref={rootRef}>
      <button
        type="button"
        className="select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
      >
        <span className={`select-dot status-dot-${current.value}`} />
        <span className="select-value">{current.label}</span>
        <span className="select-chevron" aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <ul className="select-menu" role="listbox">
          {options.map((option) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              className="select-option"
              onClick={() => select(option.value)}
            >
              <span className={`select-dot status-dot-${option.value}`} />
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
