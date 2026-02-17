import { useCallback, useRef } from "react";
import { useReactFlow } from "@xyflow/react";

interface UseZoomToGroupParams {
  devices: any[];
}

export const useZoomToGroup = ({ devices }: UseZoomToGroupParams) => {
  const { getNodes, fitView } = useReactFlow();
  const isZoomingRef = useRef(false);

  const zoomToGroup = useCallback(
    (groupId: string) => {
      isZoomingRef.current = true;
      const nodes = getNodes();
      const targetNode = nodes.find((node) => node.id === groupId);

      if (targetNode) {
        const childNodes = nodes.filter((node) => {
          if (node.id === groupId) return true;

          if (groupId.startsWith("system-")) {
            const systemId = groupId.replace("system-", "");

            if (node.id === groupId) return true;

            if (node.parentId === groupId) return true;

            if (node.id.includes(`system-${systemId}-`)) return true;

            if (node.data && node.data.deviceId) {
              const device = devices.find(
                (d: any) => d.device_id === node.data.deviceId,
              );
              if (
                device &&
                device.system_id &&
                device.system_id.toString() === systemId
              ) {
                return true;
              }
            }

            return false;
          }

          if (groupId.startsWith("dept-")) {
            const deptId = groupId.replace("dept-", "");

            if (node.id === groupId) return true;

            if (node.id.startsWith("system-") && node.parentId === groupId)
              return true;

            if (
              node.parentId &&
              nodes.find((n) => n.id === node.parentId)?.parentId === groupId
            )
              return true;

            if (node.data && node.data.deviceId) {
              const device = devices.find(
                (d: any) => d.device_id === node.data.deviceId,
              );
              if (
                device &&
                device.department_id &&
                device.department_id.toString() === deptId
              ) {
                return true;
              }
            }

            return false;
          }

          if (groupId.startsWith("plant-")) {
            return true;
          }

          return false;
        });

        if (childNodes.length > 0) {
          const performFitView = () => {
            fitView({
              padding: 0.1,
              minZoom: 0.1,
              maxZoom: 1.2,
              duration: 0,
              nodes: childNodes.map((node) => ({ id: node.id })),
              includeHiddenNodes: false,
            });
          };

          performFitView();
          performFitView();

          requestAnimationFrame(() => {
            performFitView();
          });

          setTimeout(performFitView, 0);
          setTimeout(performFitView, 1);
          setTimeout(() => {
            performFitView();
            setTimeout(() => {
              isZoomingRef.current = false;
            }, 350);
          }, 5);
        } else {
          isZoomingRef.current = false;
        }
      } else {
        isZoomingRef.current = false;
      }
    },
    [getNodes, fitView, devices],
  );

  return { zoomToGroup, isZoomingRef };
};
