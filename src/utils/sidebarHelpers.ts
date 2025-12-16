/**
 * Utility functions for Sidebar component
 */

export interface PathInfo {
  pathParts: string[];
  isDeviceDetailRoute: boolean;
  orgId?: string;
  plantId?: string;
  deptId?: string;
  systemId?: string;
}

/**
 * Parse the current pathname and extract route information
 */
export const parsePath = (pathname: string): PathInfo => {
  const pathParts = pathname.split("/").filter(Boolean);
  const isDeviceDetailRoute = pathParts.some(
    (part) => part.includes("-device") && part !== "device"
  );

  const info: PathInfo = {
    pathParts,
    isDeviceDetailRoute,
  };

  if (pathname.startsWith("/department/device/") && pathParts.length >= 5) {
    info.orgId = pathParts[2];
    info.plantId = pathParts[3];
    info.deptId = pathParts[4];
  } else if (pathname.startsWith("/system/device/") && pathParts.length >= 5) {
    info.orgId = pathParts[2];
    info.plantId = pathParts[3];
    info.systemId = pathParts[4];
  } else if (pathname.startsWith("/plant/") && pathParts.length >= 2) {
    info.plantId = pathParts[1];
  } else if (pathname.startsWith("/organization/") && pathParts.length >= 2) {
    info.orgId = pathParts[1];
  }

  return info;
};

/**
 * Save manually collapsed menus to localStorage
 */
export const saveManuallyCollapsedMenus = (
  manuallyCollapsed: Set<string>
): void => {
  localStorage.setItem(
    "manuallyCollapsedMenus",
    JSON.stringify(Array.from(manuallyCollapsed))
  );
};

