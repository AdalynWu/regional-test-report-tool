import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectMenuProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

/**
 * Generic custom dropdown (not the browser-native <select>) sharing the
 * `.select*` styles. Supports mouse, click-outside, Esc, and arrow keys.
 */
export function SelectMenu({
  value,
  options,
  onChange,
  placeholder = "请选择",
  ariaLabel,
}: SelectMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

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

  const select = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  const moveSelection = (delta: number) => {
    if (options.length === 0) return;
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
        <span className={current ? "select-value" : "select-value is-placeholder"}>
          {current ? current.label : placeholder}
        </span>
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
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
