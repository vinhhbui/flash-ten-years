import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const templateDirectory = path.resolve(scriptDirectory, "../../shared/templates/cat-v1");
const configuration = JSON.parse(await readFile(path.join(templateDirectory, "template.config.json"), "utf8"));
const { width, height } = configuration.canvas;
const { widthMm, heightMm } = configuration.paper;
const { path: shapePath, transform } = configuration.shape;
const { stroke, opacity, strokeWidth, dashArray, extractionMaskWidth } = configuration.guide;
const { title, subtitle, completionNote, markerNote } = configuration.printLayout;
const { bodyFillInsetPx } = configuration.output;
const { markers } = configuration.registrationMarkers;
const header = "<!-- Generated from template.config.json. Run npm run generate:template after changing the geometry. -->";

function svg(content) {
  return `${header}\n<svg width="${widthMm}mm" height="${heightMm}mm" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">\n${content}\n</svg>\n`;
}

const guidePath = `<path d="${shapePath}" transform="${transform}" fill="none" stroke="${stroke}" stroke-opacity="${opacity}" stroke-width="${strokeWidth}" stroke-dasharray="${dashArray}" stroke-linejoin="round"/>`;
const allowedPath = `<path d="${shapePath}" transform="${transform}" fill="white"/>`;
const bodyFillPath = `<path d="${shapePath}" transform="${transform}" fill="white" stroke="black" stroke-width="${bodyFillInsetPx * 2}" stroke-linejoin="round"/>`;
const guideMaskPath = `<path d="${shapePath}" transform="${transform}" fill="none" stroke="white" stroke-width="${extractionMaskWidth}" stroke-linejoin="round"/>`;
const printedInstructions = [
  `<g fill="#111111">${markers.map(({ x, y, size }) => `<rect x="${x}" y="${y}" width="${size}" height="${size}"/>`).join("")}</g>`,
  `<text x="620" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="#111111">${title}</text>`,
  `<text x="620" y="184" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#5E5E5E">${subtitle}</text>`,
  `<text x="620" y="1554" text-anchor="middle" font-family="Arial, sans-serif" font-size="21" fill="#666666">${completionNote}</text>`,
  `<text x="620" y="1601" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#AAAAAA">${markerNote}</text>`,
].join("\n");

await mkdir(templateDirectory, { recursive: true });
await Promise.all([
  writeFile(path.join(templateDirectory, "printable-template.svg"), svg(`<rect width="${width}" height="${height}" fill="white"/>\n${printedInstructions}\n${guidePath}`)),
  writeFile(path.join(templateDirectory, "allowed-region-mask.svg"), svg(`<rect width="${width}" height="${height}" fill="black"/>\n${allowedPath}`)),
  writeFile(path.join(templateDirectory, "body-fill-mask.svg"), svg(`<rect width="${width}" height="${height}" fill="black"/>\n${bodyFillPath}`)),
  writeFile(path.join(templateDirectory, "guide-stroke-mask.svg"), svg(`<rect width="${width}" height="${height}" fill="black"/>\n${guideMaskPath}`)),
]);
