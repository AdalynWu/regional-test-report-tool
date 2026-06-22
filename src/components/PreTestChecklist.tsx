interface PreTestChecklistProps {
  items: string[];
  checked: Record<string, boolean>;
  onChange: (next: Record<string, boolean>) => void;
}

/**
 * Pre-test checklist. Controlled by the parent so the state can be kept per
 * platform (dual-platform projects). Not persisted to the draft.
 */
export function PreTestChecklist({
  items,
  checked,
  onChange,
}: PreTestChecklistProps) {
  const toggle = (item: string) => {
    onChange({ ...checked, [item]: !checked[item] });
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
