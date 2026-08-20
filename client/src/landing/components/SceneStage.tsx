import type { ReactNode } from "react";

interface SceneStageProps {
  id: string;
  className: string;
  children: ReactNode;
}

export function SceneStage({ id, className, children }: SceneStageProps) {
  return (
    <section id={id} className={`film-scene ${className}`} data-scene={id}>
      <div className="film-scene__grain" aria-hidden="true" />
      {children}
    </section>
  );
}
