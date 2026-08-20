interface MediaCardProps {
  className: string;
  label: string;
  index: string;
}

export function MediaCard({ className, label, index }: MediaCardProps) {
  return (
    <article className={`media-card ${className}`}>
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
