/**
 * Helper functions for sidebar menu expansion logic
 */

import type { SystemResult } from "../../model/system.interface";
import type { PlantResult } from "../../model/plant.interface";

/**
 * Get initial expanded menus based on current pathname
 */
export const getInitialExpandedMenus = (
  pathname: string,
  systemsFromStore: SystemResult[],
  plants: PlantResult[]
): string[] => {
  const expanded: string[] = [];
  const manuallyCollapsed = new Set(
    JSON.parse(localStorage.getItem("manuallyCollapsedMenus") || "[]")
  );

  if (pathname.startsWith("/department/device/")) {
    const pathParts = pathname.split("/").filter(Boolean);
    if (pathParts.length >= 5) {
      const orgId = pathParts[2];
      const plantId = pathParts[3];
      const deptId = pathParts[4];
      const orgMenuId = `org-${orgId}`;
      const plantMenuId = `plant-${plantId}`;
      const deptMenuId = `dept-${deptId}`;
      if (!manuallyCollapsed.has(orgMenuId)) {
        expanded.push(orgMenuId);
      }
      if (!manuallyCollapsed.has(plantMenuId)) {
        expanded.push(plantMenuId);
      }
      if (!manuallyCollapsed.has(deptMenuId)) {
        expanded.push(deptMenuId);
      }
    }
  } else if (pathname.startsWith("/system/device/")) {
    const pathParts = pathname.split("/").filter(Boolean);
    if (pathParts.length >= 5) {
      const orgId = pathParts[2];
      const plantId = pathParts[3];
      const systemId = pathParts[4];
      const system = systemsFromStore.find(
        (s) => s.system_id.toString() === systemId
      );
      if (system) {
        const orgMenuId = `org-${orgId}`;
        const plantMenuId = `plant-${plantId}`;
        const deptMenuId = `dept-${system.department_id}`;
        if (!manuallyCollapsed.has(orgMenuId)) {
          expanded.push(orgMenuId);
        }
        if (!manuallyCollapsed.has(plantMenuId)) {
          expanded.push(plantMenuId);
        }
        if (!manuallyCollapsed.has(deptMenuId)) {
          expanded.push(deptMenuId);
        }
      }
    }
  } else if (pathname.startsWith("/plant/")) {
    const pathParts = pathname.split("/").filter(Boolean);
    if (pathParts.length >= 2) {
      const plantId = pathParts[1];
      const plant = plants.find((p) => p.plant_id.toString() === plantId);
      if (plant) {
        const orgId = plant.organization_id.toString();
        const orgMenuId = `org-${orgId}`;
        const plantMenuId = `plant-${plantId}`;
        if (!manuallyCollapsed.has(orgMenuId)) {
          expanded.push(orgMenuId);
        }
        if (!manuallyCollapsed.has(plantMenuId)) {
          expanded.push(plantMenuId);
        }
      }
    }
  } else if (pathname.startsWith("/organization/")) {
    const pathParts = pathname.split("/").filter(Boolean);
    if (pathParts.length >= 2) {
      const orgId = pathParts[1];
      const orgMenuId = `org-${orgId}`;
      if (!manuallyCollapsed.has(orgMenuId)) {
        expanded.push(orgMenuId);
      }
    }
  }

  return expanded;
};

/**
 * Get expanded menus based on pathname changes
 */
export const getExpandedMenusFromPathname = (
  pathname: string,
  plants: PlantResult[],
  systemsFromStore: SystemResult[],
  manuallyCollapsedRef: React.MutableRefObject<Set<string>>,
  isInitialMountRef: React.MutableRefObject<boolean>
): string[] => {
  const newExpandedMenus: string[] = [];

  if (pathname.startsWith("/plant/")) {
    const pathParts = pathname.split("/").filter(Boolean);
    if (pathParts.length >= 2) {
      const plantId = pathParts[1];
      const plant = plants.find((p) => p.plant_id.toString() === plantId);
      if (plant) {
        const orgId = plant.organization_id.toString();
        const orgMenuId = `org-${orgId}`;
        const plantMenuId = `plant-${plantId}`;

        if (
          isInitialMountRef.current ||
          !manuallyCollapsedRef.current.has(orgMenuId)
        ) {
          newExpandedMenus.push(orgMenuId);
        }
        if (
          isInitialMountRef.current ||
          !manuallyCollapsedRef.current.has(plantMenuId)
        ) {
          newExpandedMenus.push(plantMenuId);
        }
      }
    }
  } else if (pathname.startsWith("/organization/")) {
    const pathParts = pathname.split("/").filter(Boolean);
    if (pathParts.length >= 2) {
      const orgId = pathParts[1];
      const orgMenuId = `org-${orgId}`;

      if (
        isInitialMountRef.current ||
        !manuallyCollapsedRef.current.has(orgMenuId)
      ) {
        newExpandedMenus.push(orgMenuId);
      }
    }
  } else if (pathname.startsWith("/department/device/")) {
    const pathParts = pathname.split("/").filter(Boolean);
    const isDeviceDetailRoute = pathParts.some(
      (part) => part.includes("-device") && part !== "device"
    );

    if (isDeviceDetailRoute || pathParts.length === 5) {
      const orgId = pathParts[2];
      const plantId = pathParts[3];
      const urlDeptId = pathParts[4];
      if (orgId && plantId && urlDeptId) {
        const orgMenuId = `org-${orgId}`;
        const plantMenuId = `plant-${plantId}`;
        const deptMenuId = `dept-${urlDeptId}`;

        if (
          isInitialMountRef.current ||
          !manuallyCollapsedRef.current.has(orgMenuId)
        ) {
          newExpandedMenus.push(orgMenuId);
        }
        if (
          isInitialMountRef.current ||
          !manuallyCollapsedRef.current.has(plantMenuId)
        ) {
          newExpandedMenus.push(plantMenuId);
        }
        if (
          isInitialMountRef.current ||
          !manuallyCollapsedRef.current.has(deptMenuId)
        ) {
          newExpandedMenus.push(deptMenuId);
        }

        if (pathParts.length === 5 && !isDeviceDetailRoute) {
          localStorage.setItem("departmentId", urlDeptId);
        }
      }
    }
  } else if (pathname.startsWith("/system/device/")) {
    const pathParts = pathname.split("/").filter(Boolean);
    const isDeviceDetailRoute = pathParts.some(
      (part) => part.includes("-device") && part !== "device"
    );

    if (isDeviceDetailRoute || pathParts.length === 5) {
      if (pathParts.length >= 5) {
        const orgId = pathParts[2];
        const plantId = pathParts[3];
        const urlSystemId = pathParts[4];
        if (urlSystemId) {
          localStorage.setItem("systemId", urlSystemId);
          const system = systemsFromStore.find(
            (s) => s.system_id.toString() === urlSystemId
          );
          if (system && orgId && plantId) {
            const orgMenuId = `org-${orgId}`;
            const plantMenuId = `plant-${plantId}`;
            const deptMenuId = `dept-${system.department_id}`;

            if (
              isInitialMountRef.current ||
              !manuallyCollapsedRef.current.has(orgMenuId)
            ) {
              newExpandedMenus.push(orgMenuId);
            }
            if (
              isInitialMountRef.current ||
              !manuallyCollapsedRef.current.has(plantMenuId)
            ) {
              newExpandedMenus.push(plantMenuId);
            }
            if (
              isInitialMountRef.current ||
              !manuallyCollapsedRef.current.has(deptMenuId)
            ) {
              newExpandedMenus.push(deptMenuId);
            }

            localStorage.setItem(
              "departmentId",
              system.department_id.toString()
            );
          }
        }
      }
    }
  }

  return newExpandedMenus;
};
