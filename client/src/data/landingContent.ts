export type FilmFrameType = "photo" | "text" | "milestone" | "cta" | "memory-cat" | "blank";

export interface FilmFrameContent {
  id: string;
  type: FilmFrameType;
  year?: string;
  title: string;
  caption?: string;
  tone: "acid" | "pink" | "blue" | "orange" | "white" | "lilac";
}

export interface LandingAction {
  label: string;
  href: "/create" | "/wall";
}

export interface LandingToken {
  type: "star" | "bolt" | "stamp" | "arrow" | "dot";
  x: number;
  y: number;
  rotation: number;
  scale?: number;
}

export interface LandingScene {
  id: "hero" | "timeline" | "connection" | "identity" | "flashback" | "memory-cat" | "final";
  eyebrow: string;
  title: string[];
  manifesto: string;
  body?: string;
  side: "left" | "right" | "center";
  theme: "ink" | "acid" | "pink" | "blue" | "orange" | "lilac" | "light";
  frames: FilmFrameContent[];
  tokens: LandingToken[];
  handoff: string;
  handoffType: "frame" | "fragment" | "blank" | "cat";
  primaryAction?: LandingAction;
  secondaryAction?: LandingAction;
  pinDistance?: number;
  final?: boolean;
}

const frame = (
  id: string,
  type: FilmFrameType,
  title: string,
  tone: FilmFrameContent["tone"],
  year?: string,
  caption?: string,
): FilmFrameContent => ({ id, type, title, tone, year, caption });

export const landingScenes: LandingScene[] = [
  {
    id: "hero",
    eyebrow: "FLASH 10 / 2016 — 2026",
    title: ["FLASH", "10"],
    manifesto: "TEN YEARS IN MOTION",
    body: "A living reel for the people, sparks and small moments that made FLASH move.",
    side: "left",
    theme: "ink",
    handoff: "2016",
    handoffType: "frame",
    pinDistance: 2100,
    frames: [
      frame("hero-flash", "text", "FLASH", "acid"),
      frame("hero-ten", "milestone", "10", "pink", "2016"),
      frame("hero-cut", "photo", "START HERE", "blue"),
      frame("hero-line", "text", "MOVE", "orange"),
      frame("hero-join", "photo", "TOGETHER", "lilac"),
    ],
    tokens: [
      { type: "star", x: 69, y: 18, rotation: 18, scale: 1.1 },
      { type: "bolt", x: 83, y: 54, rotation: -22, scale: 1 },
      { type: "stamp", x: 47, y: 70, rotation: 11, scale: 0.9 },
      { type: "arrow", x: 16, y: 72, rotation: 8, scale: 1.05 },
    ],
  },
  {
    id: "timeline",
    eyebrow: "THE REEL / 10 YEARS",
    title: ["A DECADE", "IN FRAMES"],
    manifesto: "THE FILM KEEPS FEEDING",
    body: "Six marker frames. Countless stories between them.",
    side: "right",
    theme: "acid",
    handoff: "CONNECT",
    handoffType: "fragment",
    pinDistance: 2200,
    frames: [
      frame("time-2016", "milestone", "FIRST CUT", "pink", "2016"),
      frame("time-2018", "photo", "BRIGHT IDEAS", "blue", "2018"),
      frame("time-2020", "milestone", "KEEP GOING", "orange", "2020"),
      frame("time-2022", "photo", "MORE TOGETHER", "lilac", "2022"),
      frame("time-2024", "text", "MAKE NOISE", "white", "2024"),
      frame("time-2026", "milestone", "NEXT FRAME", "pink", "2026"),
    ],
    tokens: [
      { type: "arrow", x: 19, y: 27, rotation: -25 },
      { type: "dot", x: 17, y: 69, rotation: 0, scale: 1.3 },
      { type: "stamp", x: 82, y: 17, rotation: 14, scale: 0.8 },
    ],
  },
  {
    id: "connection",
    eyebrow: "KẾT NỐI / CONNECTION",
    title: ["KẾT", "NỐI"],
    manifesto: "EVERY MEMORY CONNECTS",
    body: "Separate pieces pull together, then become one bold shared picture.",
    side: "left",
    theme: "pink",
    handoff: "MARK",
    handoffType: "fragment",
    pinDistance: 2150,
    frames: [
      frame("connect-one", "photo", "YOU", "acid"),
      frame("connect-two", "text", "ME", "blue"),
      frame("connect-three", "milestone", "ONE", "orange", "10"),
      frame("connect-four", "photo", "REEL", "lilac"),
      frame("connect-five", "text", "US", "white"),
    ],
    tokens: [
      { type: "dot", x: 22, y: 23, rotation: 0, scale: 1.2 },
      { type: "star", x: 80, y: 29, rotation: 25, scale: 0.9 },
      { type: "arrow", x: 75, y: 72, rotation: 142, scale: 0.9 },
      { type: "stamp", x: 42, y: 78, rotation: -16, scale: 0.9 },
    ],
  },
  {
    id: "identity",
    eyebrow: "BẢN SẮC / IDENTITY",
    title: ["LEAVE", "YOUR MARK"],
    manifesto: "BẢN SẮC, LOUD AND CLEAR",
    body: "Make space for the unexpected shapes only you can bring.",
    side: "right",
    theme: "blue",
    handoff: "FLASHBACK",
    handoffType: "frame",
    pinDistance: 2250,
    frames: [
      frame("identity-one", "photo", "MARK", "pink"),
      frame("identity-two", "text", "OWN IT", "acid"),
      frame("identity-three", "photo", "LOUD", "orange"),
      frame("identity-four", "milestone", "10", "white", "FLASH"),
      frame("identity-five", "text", "YOU", "lilac"),
    ],
    tokens: [
      { type: "bolt", x: 17, y: 28, rotation: -17, scale: 1.25 },
      { type: "star", x: 81, y: 22, rotation: 12, scale: 1.05 },
      { type: "stamp", x: 24, y: 73, rotation: 21, scale: 1.1 },
      { type: "dot", x: 80, y: 70, rotation: 0, scale: 0.9 },
    ],
  },
  {
    id: "flashback",
    eyebrow: "FLASHBACK / THE GALLERY",
    title: ["LOOK", "AGAIN"],
    manifesto: "MEMORIES, ON A WIDER REEL",
    body: "The film opens just long enough for every fragment to take the room.",
    side: "left",
    theme: "orange",
    handoff: "ADD YOUR FRAME",
    handoffType: "blank",
    pinDistance: 2200,
    frames: [
      frame("gallery-one", "photo", "FLASHBACK", "lilac"),
      frame("gallery-two", "photo", "GOOD TIMES", "pink"),
      frame("gallery-three", "photo", "SIDE QUEST", "blue"),
      frame("gallery-four", "text", "REPLAY", "acid"),
      frame("gallery-five", "blank", "YOUR FRAME", "white"),
      frame("gallery-six", "cta", "NEXT", "pink"),
    ],
    tokens: [
      { type: "star", x: 77, y: 18, rotation: 23, scale: 1.15 },
      { type: "arrow", x: 16, y: 66, rotation: 11, scale: 1.15 },
      { type: "dot", x: 83, y: 68, rotation: 0, scale: 1.2 },
    ],
  },
  {
    id: "memory-cat",
    eyebrow: "MEMORY CAT / YOUR TURN",
    title: ["ADD YOUR", "FRAME"],
    manifesto: "MAKE A MEMORY. BRING IT TO LIFE.",
    body: "Draw a cat, choose its move, then watch it join the Live Wall.",
    side: "right",
    theme: "lilac",
    handoff: "YOUR MEMORY",
    handoffType: "cat",
    pinDistance: 2050,
    primaryAction: { label: "CREATE YOUR MEMORY", href: "/create" },
    secondaryAction: { label: "VIEW LIVE WALL", href: "/wall" },
    frames: [
      frame("cat-empty", "blank", "BLANK", "white"),
      frame("cat-one", "memory-cat", "HOP", "pink"),
      frame("cat-two", "memory-cat", "FLOAT", "acid"),
      frame("cat-three", "cta", "MAKE", "blue"),
      frame("cat-four", "text", "MEMORY", "orange"),
    ],
    tokens: [
      { type: "star", x: 17, y: 20, rotation: 12, scale: 0.9 },
      { type: "bolt", x: 85, y: 26, rotation: 22, scale: 0.9 },
      { type: "stamp", x: 16, y: 76, rotation: -10, scale: 1.05 },
      { type: "dot", x: 79, y: 76, rotation: 0, scale: 1.3 },
    ],
  },
  {
    id: "final",
    eyebrow: "FLASH 10 / KEEP ROLLING",
    title: ["YOUR MEMORY", "IS PART OF THE FILM"],
    manifesto: "SEE YOU IN THE NEXT FRAME.",
    side: "center",
    theme: "light",
    handoff: "END CREDIT",
    handoffType: "frame",
    final: true,
    primaryAction: { label: "CREATE YOUR MEMORY", href: "/create" },
    secondaryAction: { label: "VIEW LIVE WALL", href: "/wall" },
    frames: [
      frame("end-one", "text", "FLASH", "acid"),
      frame("end-two", "milestone", "10", "pink", "NEXT"),
      frame("end-three", "cta", "ROLL ON", "blue"),
      frame("end-four", "blank", "END", "white"),
    ],
    tokens: [
      { type: "star", x: 17, y: 26, rotation: 8, scale: 0.8 },
      { type: "arrow", x: 80, y: 68, rotation: 15, scale: 0.95 },
    ],
  },
];
