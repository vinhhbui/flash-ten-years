import type { AnimationType } from "../types/submission";

interface AnimationSelectorProps {
  value: AnimationType;
  onChange: (value: AnimationType) => void;
}

export default function AnimationSelector({ value, onChange }: AnimationSelectorProps) {
  return (
    <fieldset className="animation-selector">
      <legend>Choose how your cat moves</legend>
      <div>
        <button type="button" className={value === "float" ? "animation-option active" : "animation-option"} onClick={() => onChange("float")}>
          <strong>Float</strong><span>Soft bob and wiggle</span>
        </button>
        <button type="button" className={value === "hop" ? "animation-option active" : "animation-option"} onClick={() => onChange("hop")}>
          <strong>Hop</strong><span>Playful cartoon jump</span>
        </button>
      </div>
    </fieldset>
  );
}
