import { Link } from "react-router-dom";
import { spatialScenes, type SpatialNodeConfig } from "./spatialSceneConfig";

interface SpatialNodeProps {
  title: string;
  label: string;
  node: SpatialNodeConfig;
}

function SpatialNode({ title, label, node }: SpatialNodeProps) {
  const attributes = {
    "data-spatial-node": "",
    "data-world-x": node.worldX,
    "data-world-y": node.worldY,
    "data-local-z": node.localZ,
    "data-rotation": node.rotation ?? 0,
    "data-pass-depth": node.passDepth ?? 700,
  };

  if (node.type === "label") {
    return <p {...attributes} className="spatial-node spatial-node--label">{label}</p>;
  }

  if (node.type === "title") {
    return <h2 {...attributes} className="spatial-node spatial-node--title">{title}</h2>;
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

function DepthScene({ id, title, label, worldZ, nodes }: typeof spatialScenes[number]) {
  return (
    <section className={`depth-scene depth-scene--${id}`} data-depth-scene={id} data-world-z={worldZ} aria-label={title}>
      {nodes.map((node) => <SpatialNode key={node.id} title={title} label={label} node={node} />)}
    </section>
  );
}

export function DepthWorld() {
  return <div className="spatial-world">{spatialScenes.map((scene) => <DepthScene key={scene.id} {...scene} />)}</div>;
}
