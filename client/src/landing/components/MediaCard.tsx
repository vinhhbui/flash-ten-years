interface MediaCardProps {
  className: string;
  label: string;
  index: string;
  depth?: "far" | "mid" | "near";
}

export function MediaCard({ className, label, index, depth }: MediaCardProps) {
  return (
    <article className={`media-card ${className}`} data-depth={depth}>
      <span className="media-card__index">{index}</span>
      <div className="media-card__image" aria-hidden="true">
        <span className="media-card__sun" />
        <span className="media-card__ridge media-card__ridge--one" />
        <span className="media-card__ridge media-card__ridge--two" />
      </div>
      <p>{label}</p>
    </article>
  );
}
