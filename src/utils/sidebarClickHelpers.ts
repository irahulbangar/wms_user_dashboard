/**
 * Helper functions for sidebar menu click handlers
 */

import type { NavigateFunction } from "react-router-dom";
import { setSelectedPlant } from "./plantUtils";
import type { MenuItem } from "../Components/Layout/Sidebar";
import type { SidebarMenuResult } from "../../model/sidebar-menu.interface";
import type { SystemResult } from "../../model/system.interface";

/**
 * Handle organization menu click
 */
export const handleOrgMenuClick = (
  item: MenuItem,
  navigate: NavigateFunction,
  userRole?: string,
  setIsOpen?: (open: boolean) => void,
) => {
  if (!item.href) return;
  const orgId = item.id.replace("org-", "");
  localStorage.setItem("organizationId", orgId);

  if (userRole === "org_user" && item.subMenu && item.subMenu.length > 0) {
    const firstPlant = item.subMenu[0];
    if (firstPlant.href) {
      const plantId = firstPlant.id.replace("plant-", "");
      setSelectedPlant(plantId);
      navigate(firstPlant.href);
    } else {
      navigate(item.href);
    }
  } else {
    navigate(item.href);
  }

  if (window.innerWidth < 1024 && setIsOpen) {
    setTimeout(() => setIsOpen(false), 100);
  }
};

/**
 * Handle plant menu click
 */
export const handlePlantMenuClick = (
  item: MenuItem,
  navigate: NavigateFunction,
  _setIsOpen?: (open: boolean) => void,
) => {
  if (!item.href) return;
  const plantId = item.id.replace("plant-", "");
  setSelectedPlant(plantId);
  navigate(item.href);
  if (window.innerWidth < 1024 && _setIsOpen) {
    setTimeout(() => _setIsOpen(false), 100);
  }
};

/**
 * Handle department menu click
 */
export const handleDeptMenuClick = (
  item: MenuItem,
  navigate: NavigateFunction,
  location: { pathname: string },
  sidebarMenu: SidebarMenuResult[],
  toggleMenu: (menuId: string) => void,
  collapseMenuIfExpanded: (menuId: string) => void,
  // setIsOpen?: (open: boolean) => void,
) => {
  if (!item.href) return;
  const deptId = item.id.replace("dept-", "");
  const isOnDeptRoute = location.pathname.startsWith("/department/device/");
  const isOnSystemRoute = location.pathname.startsWith("/system/device/");
  const pathParts = location.pathname.split("/").filter(Boolean);
  const isDeviceDetailRoute = pathParts.some(
    (part) => part.includes("-device") && part !== "device",
  );
  const isOnCurrentDeptRoute =
    isOnDeptRoute &&
    pathParts.length === 5 &&
    pathParts[4] === deptId &&
    !isDeviceDetailRoute;

  if (!isOnCurrentDeptRoute) {
    let currentDeptMenuId: string | null = null;

    if (isOnDeptRoute && pathParts.length >= 5) {
      currentDeptMenuId = `dept-${pathParts[4]}`;
    } else if (isOnSystemRoute && pathParts.length >= 5) {
      const urlSystemId = pathParts[4];
      const menuItem = sidebarMenu.find(
        (item) => item.system_id?.toString() === urlSystemId,
      );
      if (menuItem) {
        currentDeptMenuId = `dept-${menuItem.department_id}`;
      }
    }

    if (currentDeptMenuId && currentDeptMenuId !== item.id) {
      collapseMenuIfExpanded(currentDeptMenuId);
    }
    toggleMenu(item.id);
    localStorage.setItem("departmentId", deptId);
    navigate(item.href);
  }
};

/**
 * Handle system menu click
 */
export const handleSystemMenuClick = (
  item: MenuItem,
  navigate: NavigateFunction,
  setIsOpen?: (open: boolean) => void,
) => {
  if (item.id) {
    localStorage.setItem("systemId", item.id);
  }
  if (item.href) {
    const hrefParts = item.href.split("/").filter(Boolean);
    if (hrefParts.length >= 5) {
      localStorage.setItem("departmentId", hrefParts[3]);
    }
    navigate(item.href);
  }
  if (window.innerWidth < 1024 && setIsOpen) {
    setTimeout(() => setIsOpen(false), 100);
  }
};

/**
 * Handle simple menu click (no submenu)
 */
export const handleSimpleMenuClick = (
  item: MenuItem,
  navigate: NavigateFunction,
  onPageChange: (page: string) => void,
  setIsOpen?: (open: boolean) => void,
) => {
  navigate(item.href || "");
  onPageChange(item.id);
  if (window.innerWidth < 1024 && setIsOpen) {
    setTimeout(() => setIsOpen(false), 100);
  }
};

/**
 * Get current department menu ID from route
 */
export const getCurrentDeptMenuId = (
  location: { pathname: string },
  systemsFromStore: SystemResult[],
): string | null => {
  const isOnDeptRoute = location.pathname.startsWith("/department/device/");
  const isOnSystemRoute = location.pathname.startsWith("/system/device/");
  const pathParts = location.pathname.split("/").filter(Boolean);

  if (isOnDeptRoute && pathParts.length >= 5) {
    return `dept-${pathParts[4]}`;
  } else if (isOnSystemRoute && pathParts.length >= 5) {
    const urlSystemId = pathParts[4];
    const system = systemsFromStore.find(
      (s) => s.system_id.toString() === urlSystemId,
    );
    if (system) {
      return `dept-${system.department_id}`;
    }
  }
  return null;
};
