interface FloatingObjectProps {
  className: string;
  label?: string;
}

export function FloatingObject({ className, label }: FloatingObjectProps) {
  return <span className={`floating-object ${className}`} aria-label={label} aria-hidden={label ? undefined : true} />;
}
