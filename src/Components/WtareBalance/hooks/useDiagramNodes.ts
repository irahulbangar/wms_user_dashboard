import { useMemo } from "react";
import type { Node, Edge } from "@xyflow/react";
import { enhanceNodeData } from "../utils/nodeDataEnhancer";
import type { Plant } from "../types/diagram.types";

interface UseDiagramNodesParams {
  plants: any[];
  devices: any[];
  plantId: string | null;
  isSidebarOpen: boolean;
}

export const useDiagramNodes = ({
  plants,
  devices,
  plantId,
  isSidebarOpen,
}: UseDiagramNodesParams) => {
  const { nodes, edges } = useMemo(() => {
    if (!plants || plants.length === 0) {
      return { nodes: [], edges: [] };
    }

    const currentPlant = plants.find(
      (plant: any) => plant.plant_id === Number(plantId)
    ) as Plant;

    if (!currentPlant) {
      return { nodes: [], edges: [] };
    }

    const nodesArray = Array.isArray(currentPlant?.nodes)
      ? currentPlant.nodes
      : [];
    const edgesArray = Array.isArray(currentPlant?.edges)
      ? currentPlant.edges
      : [];

    if (nodesArray.length === 0) {
      return { nodes: [], edges: [] };
    }

    const allNodes: Node[] = [];
    const allEdges: Edge[] = [];

    nodesArray.forEach((node: any) => {
      const enhancedData = enhanceNodeData({
        node,
        devices,
        nodesArray,
        edgesArray,
        plantId,
        currentPlant,
        isSidebarOpen,
      });

      allNodes.push({
        ...node,
        data: enhancedData,
      });
    });

    edgesArray.forEach((edge: Edge) => {
      allEdges.push({
        ...edge,
        style: {
          ...edge.style,
          stroke: "var(--text-edge)",
          strokeWidth: 2,
        },
      });
    });

    return { nodes: allNodes, edges: allEdges };
  }, [plants, devices, plantId, isSidebarOpen]);

  return { nodes, edges };
};
