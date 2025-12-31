/**
 * Helper functions for checking feature availability based on feature flags
 */

import type { SidebarMenuResult } from "../../model/sidebar-menu.interface";
import { Error } from "./toast";

/**
 * Check if a feature flag is enabled (handles "0"/"1" strings)
 */
export const isFeatureEnabled = (
  flag: string | boolean | undefined
): boolean => {
  if (flag === undefined || flag === null) {
    return true;
  }
  if (typeof flag === "boolean") {
    return flag;
  }
  if (typeof flag === "string") {
    return flag === "1" || flag === "true";
  }
  return true;
};

/**
 * Get feature flags for a specific route based on sidebar menu data
 * @param route - The route path to check
 * @param sidebarMenuData - Array of sidebar menu items
 * @param currentPlantId - Optional: Current plant ID from localStorage to use for global routes
 */
export const getFeatureFlagsForRoute = (
  route: string,
  sidebarMenuData: SidebarMenuResult[],
  currentPlantId?: string | null
): {
  show_plant: boolean;
  show_department: boolean;
  show_system: boolean;
  show_device: boolean;
  show_water_report: boolean;
  show_plant_layout: boolean;
  show_notification: boolean;
} | null => {
  if (!sidebarMenuData || sidebarMenuData.length === 0) {
    return null;
  }

  if (route.startsWith("/plant/")) {
    const plantId = route.split("/")[2];
    const menuItem = sidebarMenuData.find(
      (item) => item.plant_id?.toString() === plantId
    );
    if (menuItem) {
      return {
        show_plant: isFeatureEnabled(menuItem.show_plant),
        show_department: isFeatureEnabled(menuItem.show_department),
        show_system: isFeatureEnabled(menuItem.show_system),
        show_device: isFeatureEnabled(menuItem.show_device),
        show_water_report: isFeatureEnabled(menuItem.show_water_report),
        show_plant_layout: isFeatureEnabled(menuItem.show_plant_layout),
        show_notification: isFeatureEnabled(menuItem.show_notification),
      };
    }
  } else if (route.startsWith("/department/device/")) {
    const parts = route.split("/").filter(Boolean);
    if (parts.length >= 5) {
      const deptId = parts[4];
      const menuItem = sidebarMenuData.find(
        (item) => item.department_id?.toString() === deptId
      );
      if (menuItem) {
        return {
          show_plant: isFeatureEnabled(menuItem.show_plant),
          show_department: isFeatureEnabled(menuItem.show_department),
          show_system: isFeatureEnabled(menuItem.show_system),
          show_device: isFeatureEnabled(menuItem.show_device),
          show_water_report: isFeatureEnabled(menuItem.show_water_report),
          show_plant_layout: isFeatureEnabled(menuItem.show_plant_layout),
          show_notification: isFeatureEnabled(menuItem.show_notification),
        };
      }
    }
  } else if (route.startsWith("/system/device/")) {
    const parts = route.split("/").filter(Boolean);
    if (parts.length >= 5) {
      const systemId = parts[4];
      const menuItem = sidebarMenuData.find(
        (item) => item.system_id?.toString() === systemId
      );
      if (menuItem) {
        return {
          show_plant: isFeatureEnabled(menuItem.show_plant),
          show_department: isFeatureEnabled(menuItem.show_department),
          show_system: isFeatureEnabled(menuItem.show_system),
          show_device: isFeatureEnabled(menuItem.show_device),
          show_water_report: isFeatureEnabled(menuItem.show_water_report),
          show_plant_layout: isFeatureEnabled(menuItem.show_plant_layout),
          show_notification: isFeatureEnabled(menuItem.show_notification),
        };
      }
    }
  }

  if (
    route === "/devices" ||
    route === "/plant-layout" ||
    route === "/reports" ||
    route === "/notifications"
  ) {
    let menuItem: SidebarMenuResult | undefined;

    if (currentPlantId) {
      menuItem = sidebarMenuData.find(
        (item) => item.plant_id?.toString() === currentPlantId.toString()
      );
    }

    if (!menuItem && sidebarMenuData.length > 0) {
      menuItem = sidebarMenuData[0];
    }

    if (menuItem) {
      return {
        show_plant: isFeatureEnabled(menuItem.show_plant),
        show_department: isFeatureEnabled(menuItem.show_department),
        show_system: isFeatureEnabled(menuItem.show_system),
        show_device: isFeatureEnabled(menuItem.show_device),
        show_water_report: isFeatureEnabled(menuItem.show_water_report),
        show_plant_layout: isFeatureEnabled(menuItem.show_plant_layout),
        show_notification: isFeatureEnabled(menuItem.show_notification),
      };
    }
  }

  return null;
};

/**
 * Check if a specific route requires a feature and if it's available
 *
 * Note: Each route type checks its own feature flag independently:
 * - Plant routes check show_plant only
 * - Department routes check show_department only
 * - System routes check show_system only (can be accessed even if show_department = "0")
 *
 * This allows accessing child features even when parent features are disabled.
 * @param route - The route path to check
 * @param sidebarMenuData - Array of sidebar menu items
 * @param currentPlantId - Optional: Current plant ID from localStorage to use for global routes
 */
export const checkRouteFeature = (
  route: string,
  sidebarMenuData: SidebarMenuResult[],
  currentPlantId?: string | null
): { available: boolean; featureName?: string } => {
  const flags = getFeatureFlagsForRoute(route, sidebarMenuData, currentPlantId);

  if (!flags) {
    return { available: true };
  }

  if (route.startsWith("/plant/")) {
    return {
      available: flags.show_plant,
      featureName: "show_plant",
    };
  } else if (route.startsWith("/department/device/")) {
    return {
      available: flags.show_department,
      featureName: "show_department",
    };
  } else if (route.startsWith("/system/device/")) {
    return {
      available: flags.show_system,
      featureName: "show_system",
    };
  } else if (route === "/devices") {
    return {
      available: flags.show_device,
      featureName: "show_device",
    };
  } else if (route === "/plant-layout") {
    return {
      available: flags.show_plant_layout,
      featureName: "show_plant_layout",
    };
  } else if (route === "/reports") {
    return {
      available: flags.show_water_report,
      featureName: "show_water_report",
    };
  } else if (route === "/notifications") {
    return {
      available: flags.show_notification,
      featureName: "show_notification",
    };
  }

  return { available: true };
};

/**
 * Check feature and show error if not available
 * @param route - The route path to check
 * @param sidebarMenuData - Array of sidebar menu items
 * @param currentPlantId - Optional: Current plant ID from localStorage to use for global routes
 */
export const checkFeatureAndShowError = (
  route: string,
  sidebarMenuData: SidebarMenuResult[],
  currentPlantId?: string | null
): boolean => {
  const routeCheck = checkRouteFeature(route, sidebarMenuData, currentPlantId);
  if (!routeCheck.available) {
    Error("This feature not available with the current subscription");
    return false;
  }
  return true;
};
