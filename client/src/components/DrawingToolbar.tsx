import type { Tool } from "./CatCanvas";

interface DrawingToolbarProps {
  tool: Tool;
  color: string;
  brushSize: number;
  onToolChange: (tool: Tool) => void;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onUndo: () => void;
  onClear: () => void;
  onAddText: () => void;
  onAddSticker: (text: string) => void;
}

const colors = ["#25202a", "#f05d5e", "#f6a13a", "#ffd156", "#57b894", "#5784d6", "#9d63d8", "#f17aae"];
const stickers = ["YAY", "LOVE", "WOW", "POP", "10", "MEOW"];

export default function DrawingToolbar({
  tool,
  color,
  brushSize,
  onToolChange,
  onColorChange,
  onBrushSizeChange,
  onUndo,
  onClear,
  onAddText,
  onAddSticker,
}: DrawingToolbarProps) {
  return (
    <div className="toolbar">
      <div className="tool-row" aria-label="Drawing tools">
        <button className={tool === "brush" ? "control active" : "control"} onClick={() => onToolChange("brush")}>Brush</button>
        <button className={tool === "eraser" ? "control active" : "control"} onClick={() => onToolChange("eraser")}>Eraser</button>
        <button className="control" onClick={onUndo}>Undo</button>
        <button className="control danger" onClick={onClear}>Clear</button>
      </div>
      <div className="tool-row sizes" aria-label="Brush size">
        <span>Size</span>
        {[8, 16, 28].map((size) => (
          <button key={size} className={brushSize === size ? "size-button active" : "size-button"} onClick={() => onBrushSizeChange(size)} aria-label={`Brush size ${size}`}>
            <i style={{ width: size / 2, height: size / 2 }} />
          </button>
        ))}
      </div>
      <div className="tool-row palette" aria-label="Color palette">
        {colors.map((swatch) => (
          <button key={swatch} className={color === swatch ? "color-button active" : "color-button"} style={{ backgroundColor: swatch }} onClick={() => onColorChange(swatch)} aria-label={`Use color ${swatch}`} />
        ))}
        <label className="custom-color" title="Choose a custom color">
          <input type="color" value={color} onChange={(event) => onColorChange(event.target.value)} aria-label="Custom color" />
        </label>
      </div>
      <div className="tool-row extras">
        <button className="control" onClick={onAddText}>Add text</button>
        <span>Stickers</span>
        {stickers.map((sticker) => <button className="sticker-button" key={sticker} onClick={() => onAddSticker(sticker)}>{sticker}</button>)}
      </div>
    </div>
  );
}
