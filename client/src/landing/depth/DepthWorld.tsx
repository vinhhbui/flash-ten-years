import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { spatialScenes, type SpatialNodeConfig, type SpatialSceneConfig } from "./spatialSceneConfig";

interface SpatialNodeProps {
  scene: SpatialSceneConfig;
  node: SpatialNodeConfig;
}

function SpatialNode({ scene, node }: SpatialNodeProps) {
  const attributes = {
    "data-spatial-node": "",
    "data-world-x": node.worldX,
    "data-world-y": node.worldY,
    "data-compact-world-x": node.compactWorldX,
    "data-compact-world-y": node.compactWorldY,
    "data-local-z": node.localZ,
    "data-rotation": node.rotation ?? 0,
    "data-pass-depth": node.passDepth ?? 700,
  };

  if (node.type === "label") {
    return <p {...attributes} className="spatial-node spatial-node--label">{scene.label}</p>;
  }

  if (node.type === "title") {
    return <h1 {...attributes} className="spatial-node spatial-node--title">{scene.title}</h1>;
  }

  if (node.type === "content") {
    return (
      <div {...attributes} className="spatial-node spatial-node--content">
        <h2>{scene.title}</h2>
        {scene.body && <p>{scene.body}</p>}
      </div>
    );
  }

  if (node.type === "artwork") {
    const artworkStyle = { aspectRatio: node.aspectRatio ?? "4 / 3" } satisfies CSSProperties;

    return (
      <figure
        {...attributes}
        className={`spatial-node spatial-node--artwork${node.mediaSrc ? " has-media" : " is-placeholder"}`}
        style={artworkStyle}
      >
        {node.mediaSrc ? (
          <img src={node.mediaSrc} alt={node.mediaAlt ?? "FLASH 10 artwork"} />
        ) : (
          <>
            <span>{node.slotLabel}</span>
            <small>IMAGE / ARTWORK</small>
          </>
        )}
      </figure>
    );
  }

  if (node.type === "action") {
    return <Link {...attributes} className="spatial-node spatial-node--action" to="/create">CREATE A MEMORY</Link>;
  }

  return (
    <span
      {...attributes}
      className={`spatial-node spatial-node--${node.type} spatial-node--${node.object}`}
      aria-hidden="true"
    >
      {node.object === "ten" ? "10" : undefined}
    </span>
  );
}

function DepthScene(scene: SpatialSceneConfig) {
  return (
    <section
      id={`section-${scene.id}`}
      className={`depth-scene depth-scene--${scene.id}`}
      data-depth-scene={scene.id}
      data-theme={scene.theme}
      data-world-z={scene.worldZ}
      aria-label={scene.title}
    >
      {scene.nodes.map((node) => <SpatialNode key={node.id} scene={scene} node={node} />)}
    </section>
  );
}

export function DepthWorld() {
  return <div className="spatial-world">{spatialScenes.map((scene) => <DepthScene key={scene.id} {...scene} />)}</div>;
}
