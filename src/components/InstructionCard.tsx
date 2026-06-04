import { RichText } from "./RichText";

interface InstructionCardProps {
  instructions: string[];
}

/**
 * Usage instructions for the current project. Each line is rendered through
 * RichText so `{red}…{/red}` markers highlight words.
 */
export function InstructionCard({ instructions }: InstructionCardProps) {
  return (
    <section className="card instruction-card">
      <h2 className="section-title">使用说明</h2>
      <ul className="instruction-list">
        {instructions.map((line, index) => (
          <li key={index}>
            <RichText text={line} />
          </li>
        ))}
      </ul>
    </section>
  );
}
