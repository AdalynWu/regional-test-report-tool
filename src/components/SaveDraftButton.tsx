import { useState } from "react";

interface SaveDraftButtonProps {
  onSave: () => void;
}

/**
 * Always-visible fixed button so testers can save anytime — they often fill one
 * platform and return hours later for the other.
 */
export function SaveDraftButton({ onSave }: SaveDraftButtonProps) {
  const [saved, setSaved] = useState(false);

  const handleClick = () => {
    onSave();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <button
      type="button"
      className="btn btn-primary side-nav-save"
      onClick={handleClick}
    >
      {saved ? "✓ 已保存" : "储存草稿"}
    </button>
  );
}
