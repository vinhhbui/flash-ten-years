import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AnimationSelector from "../components/AnimationSelector";
import CatCanvas, { type CatCanvasHandle, type Tool } from "../components/CatCanvas";
import DrawingToolbar from "../components/DrawingToolbar";
import { submitArtwork } from "../lib/api";
import type { AnimationType } from "../types/submission";

export default function CreatePage() {
  const navigate = useNavigate();
  const canvasRef = useRef<CatCanvasHandle>(null);
  const [tool, setTool] = useState<Tool>("brush");
  const [color, setColor] = useState("#f05d5e");
  const [brushSize, setBrushSize] = useState(16);
  const [animation, setAnimation] = useState<AnimationType>("float");
  const [name, setName] = useState("");
  const [undo, setUndo] = useState<() => void>(() => () => undefined);
  const [clear, setClear] = useState<() => void>(() => () => undefined);
  const [addText, setAddText] = useState<(value: string) => void>(() => () => undefined);
  const [addSticker, setAddSticker] = useState<(value: string) => void>(() => () => undefined);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const requestText = () => {
    const value = window.prompt("Write a short message for your cat (up to 18 characters):");
    if (value) addText(value);
  };

  const sendCat = async () => {
    const imageData = canvasRef.current?.exportPng();
    if (!imageData) return;
    setStatus("sending");
    setMessage("");
    try {
      await submitArtwork({ imageData, animation, name: name.trim() || undefined });
      setStatus("success");
      setMessage("Your cat is alive. Opening the wall...");
      window.setTimeout(() => navigate("/wall"), 700);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Your cat could not be submitted. Please try again.");
    }
  };

  return (
    <main className="create-page">
      <header className="create-header">
        <p>FLASH 10 · MEMORY WALL</p>
        <h1>MAKE YOUR CAT</h1>
        <span>Decorate it. Bring it to life.</span>
      </header>
      <label className="name-field">Your name <span>(optional)</span>
        <input value={name} maxLength={24} onChange={(event) => setName(event.target.value)} placeholder="Name your memory" />
      </label>
      <CatCanvas
        ref={canvasRef}
        tool={tool}
        color={color}
        brushSize={brushSize}
        onUndoReady={(action) => setUndo(() => action)}
        onClearReady={(action) => setClear(() => action)}
        onAddTextReady={(action) => setAddText(() => action)}
        onAddStickerReady={(action) => setAddSticker(() => action)}
      />
      <DrawingToolbar
        tool={tool}
        color={color}
        brushSize={brushSize}
        onToolChange={setTool}
        onColorChange={setColor}
        onBrushSizeChange={setBrushSize}
        onUndo={undo}
        onClear={clear}
        onAddText={requestText}
        onAddSticker={addSticker}
      />
      <AnimationSelector value={animation} onChange={setAnimation} />
      <button className="bring-to-life" onClick={sendCat} disabled={status === "sending"}>
        {status === "sending" ? "SENDING CAT..." : "BRING ME TO LIFE"}
      </button>
      {message && <p className={`submit-message ${status}`} role="status">{message}</p>}
    </main>
  );
}
