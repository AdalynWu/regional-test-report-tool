import { useRef } from "react";
import type { ChangeEvent } from "react";

interface FileUploadButtonProps {
  accept?: string;
  multiple?: boolean;
  /** Display text next to the button (e.g. the chosen file name). */
  fileName?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * File picker with a styled button and our own file-name label. The native
 * input is hidden, so clearing its value (to allow re-selecting the same file)
 * does not reset the visible text — the parent controls `fileName`.
 */
export function FileUploadButton({
  accept = "image/*",
  multiple = false,
  fileName,
  onChange,
}: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="file-input">
      <button
        type="button"
        className="file-input-button"
        onClick={() => inputRef.current?.click()}
      >
        选择文件
      </button>
      <span
        className={fileName ? "file-input-name" : "file-input-name is-empty"}
        title={fileName}
      >
        {fileName || "未选择文件"}
      </span>
      <input
        ref={inputRef}
        type="file"
        className="file-input-native"
        accept={accept}
        multiple={multiple}
        onChange={onChange}
      />
    </div>
  );
}
