import { useState } from "react";

interface PreTestChecklistProps {
  items: string[];
}

/**
 * Pre-test checklist. State is local-only by design — it is not lifted into the
 * report draft. Items come from the current project config.
 */
export function PreTestChecklist({ items }: PreTestChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (item: string) => {
    setChecked((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  return (
    <section className="card">
      <h2 className="section-title">测试前检查清单</h2>
      <ul className="checklist">
        {items.map((item) => (
          <li key={item}>
            <label className="checklist-item">
              <input
                type="checkbox"
                checked={checked[item] ?? false}
                onChange={() => toggle(item)}
              />
              <span>{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
