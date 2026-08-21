import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type Konva from "konva";
import { Circle, Group, Layer, Line, Path, Stage, Text } from "react-konva";

export type Tool = "brush" | "eraser";

type Stroke = {
  id: string;
  points: number[];
  color: string;
  size: number;
  eraser?: boolean;
};

type Label = { id: string; text: string; x: number; y: number; color: string };
type Sticker = { id: string; text: string; x: number; y: number; color: string };
type Snapshot = { strokes: Stroke[]; labels: Label[]; stickers: Sticker[] };

export interface CatCanvasHandle {
  exportPng: () => string;
}

interface CatCanvasProps {
  tool: Tool;
  color: string;
  brushSize: number;
  onUndoReady: (undo: () => void) => void;
  onClearReady: (clear: () => void) => void;
  onAddTextReady: (add: (text: string) => void) => void;
  onAddStickerReady: (add: (text: string) => void) => void;
}

const WIDTH = 460;
const HEIGHT = 520;
const catPathData = "M153 445C102 432 88 368 115 304C92 264 100 216 122 185L105 80C103 61 113 59 128 73L185 126C216 107 252 108 281 126L330 73C344 60 354 64 351 84L339 185C365 218 370 265 345 304C355 325 360 348 357 370C373 345 398 342 411 363C429 393 400 435 345 430C330 442 315 447 302 448C260 466 198 466 153 445Z";

function drawCatPath(context: Konva.Context) {
  context.beginPath();
  context.moveTo(153, 445);
  context.bezierCurveTo(102, 432, 88, 368, 115, 304);
  context.bezierCurveTo(92, 264, 100, 216, 122, 185);
  context.lineTo(105, 80);
  context.quadraticCurveTo(103, 61, 128, 73);
  context.lineTo(185, 126);
  context.quadraticCurveTo(216, 107, 281, 126);
  context.lineTo(330, 73);
  context.quadraticCurveTo(354, 60, 351, 84);
  context.lineTo(339, 185);
  context.bezierCurveTo(365, 218, 370, 265, 345, 304);
  context.bezierCurveTo(355, 325, 360, 348, 357, 370);
  context.bezierCurveTo(373, 345, 398, 342, 411, 363);
  context.bezierCurveTo(429, 393, 400, 435, 345, 430);
  context.bezierCurveTo(330, 442, 315, 447, 302, 448);
  context.bezierCurveTo(260, 466, 198, 466, 153, 445);
  context.closePath();
}

function insideCat(point: { x: number; y: number }) {
  const inHead = ((point.x - 230) / 124) ** 2 + ((point.y - 205) / 117) ** 2 <= 1;
  const inBody = ((point.x - 230) / 132) ** 2 + ((point.y - 331) / 132) ** 2 <= 1;
  const inLeftEar = point.y >= 72 && point.y <= 164 && point.x >= 100 && point.x <= 190;
  const inRightEar = point.y >= 72 && point.y <= 164 && point.x >= 275 && point.x <= 355;
  const inTail = point.x >= 332 && point.x <= 420 && point.y >= 337 && point.y <= 438;
  return inHead || inBody || inLeftEar || inRightEar || inTail;
}

function copySnapshot(snapshot: Snapshot): Snapshot {
  return {
    strokes: snapshot.strokes.map((stroke) => ({ ...stroke, points: [...stroke.points] })),
    labels: snapshot.labels.map((label) => ({ ...label })),
    stickers: snapshot.stickers.map((sticker) => ({ ...sticker })),
  };
}

function clampPosition(x: number, y: number) {
  return {
    x: Math.min(335, Math.max(112, x)),
    y: Math.min(405, Math.max(118, y)),
  };
}

const CatCanvas = forwardRef<CatCanvasHandle, CatCanvasProps>(function CatCanvas(
  { tool, color, brushSize, onUndoReady, onClearReady, onAddTextReady, onAddStickerReady },
  ref,
) {
  const stageRef = useRef<Konva.Stage>(null);
  const drawingRef = useRef(false);
  const historyRef = useRef<Snapshot[]>([]);
  const [stageSize, setStageSize] = useState({ width: WIDTH, height: HEIGHT, scale: 1 });
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [stickers, setStickers] = useState<Sticker[]>([]);

  useEffect(() => {
    const resize = () => {
      const available = Math.min(window.innerWidth - 32, 520);
      const scale = Math.max(0.62, available / WIDTH);
      setStageSize({ width: WIDTH * scale, height: HEIGHT * scale, scale });
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const snapshot = useCallback((): Snapshot => ({ strokes, labels, stickers }), [strokes, labels, stickers]);

  const pushHistory = useCallback((nextSnapshot = snapshot()) => {
    historyRef.current = [...historyRef.current.slice(-39), copySnapshot(nextSnapshot)];
  }, [snapshot]);

  const undo = useCallback(() => {
    const previous = historyRef.current.pop();
    if (!previous) return;
    setStrokes(previous.strokes);
    setLabels(previous.labels);
    setStickers(previous.stickers);
  }, []);

  const clear = useCallback(() => {
    if (!strokes.length && !labels.length && !stickers.length) return;
    pushHistory();
    setStrokes([]);
    setLabels([]);
    setStickers([]);
  }, [labels.length, pushHistory, stickers.length, strokes.length]);

  const addText = useCallback((text: string) => {
    const cleanText = text.trim().slice(0, 18);
    if (!cleanText) return;
    pushHistory();
    setLabels((items) => [...items, { id: crypto.randomUUID(), text: cleanText, x: 174, y: 258, color }]);
  }, [color, pushHistory]);

  const addSticker = useCallback((text: string) => {
    pushHistory();
    setStickers((items) => [...items, { id: crypto.randomUUID(), text, x: 183, y: 315, color }]);
  }, [color, pushHistory]);

  useEffect(() => onUndoReady(undo), [onUndoReady, undo]);
  useEffect(() => onClearReady(clear), [clear, onClearReady]);
  useEffect(() => onAddTextReady(addText), [addText, onAddTextReady]);
  useEffect(() => onAddStickerReady(addSticker), [addSticker, onAddStickerReady]);

  useImperativeHandle(ref, () => ({
    exportPng: () => stageRef.current?.toDataURL({ pixelRatio: 2, mimeType: "image/png" }) ?? "",
  }));

  const pointer = () => {
    const stage = stageRef.current;
    const position = stage?.getPointerPosition();
    if (!position) return null;
    return { x: position.x / stageSize.scale, y: position.y / stageSize.scale };
  };

  const startDrawing = () => {
    const point = pointer();
    if (!point || !insideCat(point)) return;
    pushHistory();
    drawingRef.current = true;
    setStrokes((items) => [
      ...items,
      {
        id: crypto.randomUUID(),
        points: [point.x, point.y],
        color,
        size: brushSize,
        eraser: tool === "eraser",
      },
    ]);
  };

  const continueDrawing = () => {
    if (!drawingRef.current) return;
    const point = pointer();
    if (!point) return;
    setStrokes((items) => {
      const last = items[items.length - 1];
      if (!last) return items;
      return [...items.slice(0, -1), { ...last, points: [...last.points, point.x, point.y] }];
    });
  };

  const finishDrawing = () => {
    drawingRef.current = false;
  };

  const decoration = useMemo(() => (
    <Group clipFunc={drawCatPath}>
      {strokes.map((stroke) => (
        <Line
          key={stroke.id}
          points={stroke.points}
          stroke={stroke.color}
          strokeWidth={stroke.size}
          lineCap="round"
          lineJoin="round"
          globalCompositeOperation={stroke.eraser ? "destination-out" : "source-over"}
        />
      ))}
      {labels.map((label) => (
        <Text
          key={label.id}
          x={label.x}
          y={label.y}
          text={label.text}
          fill={label.color}
          fontFamily="HT Piet Mono"
          fontSize={25}
          fontStyle="bold"
          draggable
          onMouseDown={(event) => { event.cancelBubble = true; }}
          onTouchStart={(event) => { event.cancelBubble = true; }}
          onDragStart={() => pushHistory()}
          onDragEnd={(event) => {
            const position = clampPosition(event.target.x(), event.target.y());
            event.target.position(position);
            setLabels((items) => items.map((item) => (item.id === label.id ? { ...item, ...position } : item)));
          }}
        />
      ))}
      {stickers.map((sticker) => (
        <Group
          key={sticker.id}
          x={sticker.x}
          y={sticker.y}
          draggable
          onMouseDown={(event) => { event.cancelBubble = true; }}
          onTouchStart={(event) => { event.cancelBubble = true; }}
          onDragStart={() => pushHistory()}
          onDragEnd={(event) => {
            const position = clampPosition(event.target.x(), event.target.y());
            event.target.position(position);
            setStickers((items) => items.map((item) => (item.id === sticker.id ? { ...item, ...position } : item)));
          }}
        >
          <Circle radius={30} fill="rgba(255,255,255,0.78)" stroke={sticker.color} strokeWidth={3} />
          <Text x={-23} y={-9} width={46} text={sticker.text} align="center" fill={sticker.color} fontSize={12} fontStyle="bold" />
        </Group>
      ))}
    </Group>
  ), [labels, pushHistory, stickers, strokes]);

  return (
    <div className="cat-canvas" aria-label="Cat decoration canvas">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={stageSize.scale}
        scaleY={stageSize.scale}
        onMouseDown={startDrawing}
        onTouchStart={startDrawing}
        onMouseMove={continueDrawing}
        onTouchMove={continueDrawing}
        onMouseUp={finishDrawing}
        onTouchEnd={finishDrawing}
        onMouseLeave={finishDrawing}
      >
        <Layer>
          <Path data={catPathData} fill="#ffffff" />
          {decoration}
          <Path data={catPathData} stroke="#17131a" strokeWidth={6} lineJoin="round" />
        </Layer>
      </Stage>
    </div>
  );
});

export default CatCanvas;
