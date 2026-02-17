/**
 * Helper functions for determining menu item active state
 */

import type { MenuItem } from "../Components/Layout/Sidebar";
import type { PlantResult } from "../../model/plant.interface";
import type { SidebarMenuResult } from "../../model/sidebar-menu.interface";

/**
 * Check if a menu item is active based on current route
 */
export const checkMenuItemActive = (
  item: MenuItem,
  location: { pathname: string },
  currentPage: string,
  plants: PlantResult[],
  sidebarMenu?: SidebarMenuResult[],
): boolean => {
  if (item.href && location.pathname === item.href) {
    return true;
  }

  if (item.id === "dashboard") {
    return location.pathname.startsWith("/plant/");
  }

  if (item.id.startsWith("org-")) {
    const orgId = item.id.replace("org-", "");
    const pathParts = location.pathname.split("/").filter(Boolean);

    if (
      location.pathname.startsWith("/organization/") &&
      pathParts.length >= 2
    ) {
      return pathParts[1] === orgId;
    }

    if (location.pathname.startsWith("/plant/") && pathParts.length >= 2) {
      const plantId = pathParts[1];
      if (sidebarMenu && sidebarMenu.length > 0) {
        const menuItem = sidebarMenu.find(
          (item) => item.plant_id?.toString() === plantId,
        );
        if (menuItem && menuItem.organization_id.toString() === orgId) {
          return true;
        }
      }
      const plant = plants.find((p) => p.plant_id.toString() === plantId);
      if (plant && plant.organization_id.toString() === orgId) {
        return true;
      }
    }

    if (
      (location.pathname.startsWith("/department/device/") ||
        location.pathname.startsWith("/system/device/")) &&
      pathParts.length >= 5
    ) {
      return pathParts[2] === orgId;
    }

    return false;
  }

  if (item.id.startsWith("plant-")) {
    const plantId = item.id.replace("plant-", "");
    const pathParts = location.pathname.split("/").filter(Boolean);
    if (location.pathname.startsWith("/plant/")) {
      return pathParts[1] === plantId;
    }
    if (
      (location.pathname.startsWith("/department/device/") ||
        location.pathname.startsWith("/system/device/")) &&
      pathParts.length >= 5
    ) {
      return pathParts[3] === plantId;
    }
    return false;
  }

  if (item.id.startsWith("dept-")) {
    const deptId = item.id.replace("dept-", "");
    const pathParts = location.pathname.split("/").filter(Boolean);

    if (
      location.pathname.startsWith("/department/device/") &&
      pathParts.length >= 5
    ) {
      const urlDeptId = pathParts[4];
      const isDeviceDetailRoute = pathParts.some(
        (part) => part.includes("-device") && part !== "device",
      );
      if (urlDeptId === deptId && !isDeviceDetailRoute) {
        return true;
      }
    }

    if (
      location.pathname.startsWith("/system/device/") &&
      pathParts.length >= 5
    ) {
      const isDeviceDetailRoute = pathParts.some(
        (part) => part.includes("-device") && part !== "device",
      );
      if (!isDeviceDetailRoute) {
        const urlSystemId = pathParts[4];
        if (sidebarMenu && sidebarMenu.length > 0) {
          const systemItem = sidebarMenu.find(
            (menuItem) => menuItem.system_id?.toString() === urlSystemId,
          );
          if (systemItem && systemItem.department_id.toString() === deptId) {
            return true;
          }
        }
        const storedDeptId = localStorage.getItem("departmentId");
        if (storedDeptId === deptId) {
          return true;
        }
      }
    }

    return false;
  }

  if (location.pathname.startsWith("/system/device/")) {
    const pathParts = location.pathname.split("/").filter(Boolean);
    const isDeviceDetailRoute = pathParts.some(
      (part) => part.includes("-device") && part !== "device",
    );

    if (isDeviceDetailRoute) {
      const storedSystemId = localStorage.getItem("systemId");
      if (storedSystemId) {
        const storedId = storedSystemId.startsWith("system-")
          ? storedSystemId.replace("system-", "")
          : storedSystemId;

        if (item.id.startsWith("system-")) {
          const itemSystemId = item.id.replace("system-", "");
          return itemSystemId === storedId;
        }
        return item.id === storedId || item.id === storedSystemId;
      }
    } else if (pathParts.length >= 5) {
      const urlSystemId = pathParts[4];
      if (item.id.startsWith("system-")) {
        const itemSystemId = item.id.replace("system-", "");
        return itemSystemId === urlSystemId;
      }
      return item.id === urlSystemId;
    }
  }

  if (item.id === "devices") {
    if (location.pathname.startsWith("/device-details/")) {
      return true;
    }
    if (location.pathname === "/devices") {
      return true;
    }
  }

  if (location.pathname.startsWith("/device-details/")) {
    if (item.id.startsWith("system-")) {
      return false;
    }
  }

  if (currentPage === item.id) {
    return true;
  }

  return false;
};

/**
 * Check if a system menu item is active (for nested menus)
 */
export const checkSystemMenuItemActive = (
  item: MenuItem,
  location: { pathname: string },
  _isDepartmentMenuItem: boolean,
  currentSystemId?: string | null,
): boolean => {
  if (item.href && location.pathname === item.href) {
    return true;
  }

  if (location.pathname.startsWith("/system/device/")) {
    const pathParts = location.pathname.split("/").filter(Boolean);
    const isDeviceDetailRoute = pathParts.some(
      (part) => part.includes("-device") && part !== "device",
    );

    if (isDeviceDetailRoute) {
      const storedSystemId =
        localStorage.getItem("systemId") || currentSystemId;
      if (storedSystemId) {
        const storedId = storedSystemId.startsWith("system-")
          ? storedSystemId.replace("system-", "")
          : storedSystemId;

        if (item.id.startsWith("system-")) {
          const itemSystemId = item.id.replace("system-", "");
          return itemSystemId === storedId;
        }
        return item.id === storedId || item.id === storedSystemId;
      }
    } else if (pathParts.length >= 5) {
      const urlSystemId = pathParts[4];
      const storedSystemId =
        localStorage.getItem("systemId") || currentSystemId;
      if (item.id.startsWith("system-")) {
        const itemSystemId = item.id.replace("system-", "");
        return itemSystemId === urlSystemId || itemSystemId === storedSystemId;
      }
      return item.id === urlSystemId || item.id === storedSystemId;
    }
  }

  if (location.pathname.startsWith("/device-details/")) {
    return false;
  }

  return false;
};
