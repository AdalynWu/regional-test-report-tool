import type { AttachmentInfo } from "../types/report";

interface AttachmentFormProps {
  value: AttachmentInfo;
  onChange: (next: AttachmentInfo) => void;
}

export function AttachmentForm({ value, onChange }: AttachmentFormProps) {
  const update = (field: keyof AttachmentInfo, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <section className="card">
      <h2 className="section-title">附件信息</h2>

      <label className="field">
        <span className="field-label">測試录影连结</span>
        <input
          type="text"
          value={value.recordingUrl ?? ""}
          placeholder="e.g https://drive.google.com/file/d/xxx/view"
          onChange={(e) => update("recordingUrl", e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field-label">测试档案资料夹连结</span>
        <input
          type="text"
          value={value.harFileUrl ?? ""}
          placeholder="e.g https://drive.google.com/drive/folders/xxx"
          onChange={(e) => update("harFileUrl", e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field-label">其他备注</span>
        <textarea
          value={value.extraNote ?? ""}
          onChange={(e) => update("extraNote", e.target.value)}
        />
      </label>
    </section>
  );
}
