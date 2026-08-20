interface KineticTextProps {
  lines: string[];
  className: string;
  as?: "h1" | "h2" | "p";
  dataAttribute?: string;
}

export function KineticText({ lines, className, as: Tag = "h2", dataAttribute }: KineticTextProps) {
  return (
    <Tag className={className} data-kinetic-text={dataAttribute}>
      {lines.map((line) => <span key={line} className="kinetic-text__line">{line}</span>)}
    </Tag>
  );
}
