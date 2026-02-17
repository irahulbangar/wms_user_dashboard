/**
 * Menu click handlers for Sidebar component
 */

import type { NavigateFunction } from "react-router-dom";
import { setSelectedPlant } from "../../utils/plantUtils";
import type { SystemResult } from "../../../model/system.interface";
import type { MenuItem } from "./Sidebar";

export interface MenuHandlers {
  handleToggleMenu: (menuId: string) => void;
  handleOrgClick: (item: MenuItem, userRole?: string) => void;
  handlePlantClick: (item: MenuItem) => void;
  handleDeptClick: (
    item: MenuItem,
    pathInfo: any,
    systems: SystemResult[],
  ) => void;
  handleSystemClick: (item: MenuItem) => void;
  handleSimpleClick: (
    item: MenuItem,
    onPageChange: (page: string) => void,
  ) => void;
  closeMobileMenu: () => void;
}

export const createMenuHandlers = (
  navigate: NavigateFunction,
  setExpandedMenus: React.Dispatch<React.SetStateAction<string[]>>,
  manuallyCollapsedRef: React.MutableRefObject<Set<string>>,
  location: { pathname: string },
): MenuHandlers => {
  const saveCollapsedMenus = () => {
    localStorage.setItem(
      "manuallyCollapsedMenus",
      JSON.stringify(Array.from(manuallyCollapsedRef.current)),
    );
  };

  const handleToggleMenu = (menuId: string) => {
    setExpandedMenus((prev) => {
      if (prev.includes(menuId)) {
        manuallyCollapsedRef.current.add(menuId);
        saveCollapsedMenus();
        return prev.filter((id) => id !== menuId);
      } else {
        manuallyCollapsedRef.current.delete(menuId);
        saveCollapsedMenus();
        return [...prev, menuId];
      }
    });
  };

  const handleOrgClick = (item: MenuItem, userRole?: string) => {
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
  };

  const handlePlantClick = (item: MenuItem) => {
    if (!item.href) return;
    const plantId = item.id.replace("plant-", "");
    setSelectedPlant(plantId);
    navigate(item.href);
  };

  const handleDeptClick = (
    item: MenuItem,
    pathInfo: { pathParts: string[]; isDeviceDetailRoute: boolean },
    systems: SystemResult[],
  ) => {
    if (!item.href) return;
    const deptId = item.id.replace("dept-", "");
    const isOnDeptRoute = location.pathname.startsWith("/department/device/");
    const isOnSystemRoute = location.pathname.startsWith("/system/device/");
    const isOnCurrentDeptRoute =
      isOnDeptRoute &&
      pathInfo.pathParts.length === 5 &&
      pathInfo.pathParts[4] === deptId &&
      !pathInfo.isDeviceDetailRoute;

    if (!isOnCurrentDeptRoute) {
      let currentDeptMenuId: string | null = null;

      if (isOnDeptRoute && pathInfo.pathParts.length >= 5) {
        currentDeptMenuId = `dept-${pathInfo.pathParts[4]}`;
      } else if (isOnSystemRoute && pathInfo.pathParts.length >= 5) {
        const urlSystemId = pathInfo.pathParts[4];
        const system = systems.find(
          (s) => s.system_id.toString() === urlSystemId,
        );
        if (system) {
          currentDeptMenuId = `dept-${system.department_id}`;
        }
      }

      if (currentDeptMenuId && currentDeptMenuId !== item.id) {
        handleToggleMenu(currentDeptMenuId);
      }

      handleToggleMenu(item.id);
      localStorage.setItem("departmentId", deptId);
      navigate(item.href);
    }
  };

  const handleSystemClick = (item: MenuItem) => {
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
  };

  const handleSimpleClick = (
    item: MenuItem,
    onPageChange: (page: string) => void,
  ) => {
    navigate(item.href || "");
    onPageChange(item.id);
  };

  const closeMobileMenu = () => {
    if (window.innerWidth < 1024) {
      setTimeout(() => {}, 100);
    }
  };

  return {
    handleToggleMenu,
    handleOrgClick,
    handlePlantClick,
    handleDeptClick,
    handleSystemClick,
    handleSimpleClick,
    closeMobileMenu,
  };
};
