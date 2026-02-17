import {
  ChevronRight,
  Monitor,
  Settings,
  Users,
  Waypoints,
  X,
  Bell,
  FileText,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import Logo from "../../assets/images/logo.png";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { getCurrentPlantId } from "../../utils/plantUtils";
import { Error } from "../../utils/toast";
import { getSidebarMenu } from "../../../store/plantSlice";
import { saveManuallyCollapsedMenus } from "../../utils/sidebarHelpers";
import {
  handleOrgMenuClick,
  handlePlantMenuClick,
  handleDeptMenuClick,
  handleSystemMenuClick,
} from "../../utils/sidebarClickHelpers";
import {
  checkMenuItemActive,
  checkSystemMenuItemActive,
} from "../../utils/sidebarActiveHelpers";
import { buildMenuItemsFromAPI } from "../../utils/sidebarMenuBuilderFromAPI";

export interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  href?: string;
  subMenu?: MenuItem[];
}

interface SidebarProps {
  currentPage: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  isOpen,
  setIsOpen,
}) => {
  const { user } = useAppSelector((state) => state.user);
  const { sidebarMenu: sidebarMenuFromStore } = useAppSelector(
    (state) => state.plant,
  );
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = user?.plantsList.find(
    (plant) => plant.plant_id === Number(localStorage.getItem("plantId")),
  )?.role;
  const logo = localStorage.getItem("logo");

  const getInitialExpandedMenusFromPathname = (pathname: string): string[] => {
    const expanded: string[] = [];
    const manuallyCollapsed = new Set(
      JSON.parse(localStorage.getItem("manuallyCollapsedMenus") || "[]"),
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
        if (!manuallyCollapsed.has(orgMenuId)) expanded.push(orgMenuId);
        if (!manuallyCollapsed.has(plantMenuId)) expanded.push(plantMenuId);
        if (!manuallyCollapsed.has(deptMenuId)) expanded.push(deptMenuId);
      }
    } else if (pathname.startsWith("/system/device/")) {
      const pathParts = pathname.split("/").filter(Boolean);
      if (pathParts.length >= 5) {
        const orgId = pathParts[2];
        const plantId = pathParts[3];
        const systemId = pathParts[4];
        const menuItem = sidebarMenuFromStore?.find(
          (item) => item.system_id?.toString() === systemId,
        );
        if (menuItem) {
          const orgMenuId = `org-${orgId}`;
          const plantMenuId = `plant-${plantId}`;
          const deptMenuId = `dept-${menuItem.department_id}`;
          if (!manuallyCollapsed.has(orgMenuId)) expanded.push(orgMenuId);
          if (!manuallyCollapsed.has(plantMenuId)) expanded.push(plantMenuId);
          if (!manuallyCollapsed.has(deptMenuId)) expanded.push(deptMenuId);
        }
      }
    } else if (pathname.startsWith("/plant/")) {
      const pathParts = pathname.split("/").filter(Boolean);
      if (pathParts.length >= 2) {
        const plantId = pathParts[1];
        const menuItem = sidebarMenuFromStore?.find(
          (item) => item.plant_id?.toString() === plantId,
        );
        if (menuItem) {
          const orgId = menuItem.organization_id.toString();
          const orgMenuId = `org-${orgId}`;
          const plantMenuId = `plant-${plantId}`;
          if (!manuallyCollapsed.has(orgMenuId)) expanded.push(orgMenuId);
          if (!manuallyCollapsed.has(plantMenuId)) expanded.push(plantMenuId);
        }
      }
    } else if (pathname.startsWith("/organization/")) {
      const pathParts = pathname.split("/").filter(Boolean);
      if (pathParts.length >= 2) {
        const orgId = pathParts[1];
        const orgMenuId = `org-${orgId}`;
        if (!manuallyCollapsed.has(orgMenuId)) expanded.push(orgMenuId);
      }
    }

    return expanded;
  };

  const [expandedMenus, setExpandedMenus] = useState<string[]>(() =>
    getInitialExpandedMenusFromPathname(location.pathname),
  );
  const manuallyCollapsedRef = useRef<Set<string>>(
    new Set(JSON.parse(localStorage.getItem("manuallyCollapsedMenus") || "[]")),
  );
  const isInitialMountRef = useRef(true);
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const hasFetchedSidebarMenuRef = useRef(false);

  const fetchSidebarMenu = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }
    if (hasFetchedSidebarMenuRef.current) {
      return;
    }
    hasFetchedSidebarMenuRef.current = true;
    await dispatch(getSidebarMenu())
      .unwrap()
      .then((res) => {
        if (!res.success) {
          Error(res.message || "Failed to get sidebar menu");
        }
      })
      .catch((err) => {
        console.log(err);
        Error(err.message || "Failed to get sidebar menu");
        hasFetchedSidebarMenuRef.current = false;
      });
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    fetchSidebarMenu();
  }, [fetchSidebarMenu]);

  useEffect(() => {
    const newExpandedMenus: string[] = [];

    if (location.pathname.startsWith("/plant/")) {
      const pathParts = location.pathname.split("/").filter(Boolean);
      if (pathParts.length >= 2) {
        const plantId = pathParts[1];
        const menuItem = sidebarMenuFromStore?.find(
          (item) => item.plant_id?.toString() === plantId,
        );
        if (menuItem) {
          const orgId = menuItem.organization_id.toString();
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
    } else if (location.pathname.startsWith("/organization/")) {
      const pathParts = location.pathname.split("/").filter(Boolean);
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
    } else if (location.pathname.startsWith("/department/device/")) {
      const pathParts = location.pathname.split("/").filter(Boolean);
      if (pathParts.length >= 5) {
        const orgId = pathParts[2];
        const plantId = pathParts[3];
        const deptId = pathParts[4];
        const orgMenuId = `org-${orgId}`;
        const plantMenuId = `plant-${plantId}`;
        const deptMenuId = `dept-${deptId}`;

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
      }
    } else if (location.pathname.startsWith("/system/device/")) {
      const pathParts = location.pathname.split("/").filter(Boolean);
      if (pathParts.length >= 5) {
        const orgId = pathParts[2];
        const plantId = pathParts[3];
        const systemId = pathParts[4];
        const menuItem = sidebarMenuFromStore?.find(
          (item) => item.system_id?.toString() === systemId,
        );
        if (menuItem) {
          const orgMenuId = `org-${orgId}`;
          const plantMenuId = `plant-${plantId}`;
          const deptMenuId = `dept-${menuItem.department_id}`;

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
        }
      }
    }

    if (newExpandedMenus.length > 0) {
      setExpandedMenus((prev) => {
        const hasAllMenus = newExpandedMenus.every((menu) =>
          prev.includes(menu),
        );
        if (hasAllMenus && prev.length === newExpandedMenus.length) {
          return prev;
        }
        return [...new Set([...prev, ...newExpandedMenus])];
      });
    }
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
    }
  }, [location.pathname, sidebarMenuFromStore]);

  const menuItems = useMemo(() => {
    const baseItems = buildMenuItemsFromAPI(sidebarMenuFromStore || []);

    baseItems.push({
      id: "plant-layout",
      icon: <Waypoints className="w-5 h-5" />,
      label: "Plant Layout",
      href: "/plant-layout",
    });

    baseItems.push({
      id: "devices",
      icon: <Monitor className="w-5 h-5" />,
      label: "Devices",
      href: "/devices",
    });

    baseItems.push({
      id: "reports",
      icon: <FileText className="w-5 h-5" />,
      label: "Reports",
      href: "/reports",
    });

    if (userRole === "org_admin" || user?.plantsList[0]?.role === "org_admin") {
      baseItems.push({
        id: "users",
        icon: <Users className="w-5 h-5" />,
        label: "Users",
        href: "/users",
      });
    }

    baseItems.push({
      id: "settings",
      icon: <Settings className="w-5 h-5" />,
      label: "Settings",
      href: "/settings",
    });
    baseItems.push({
      id: "notifications",
      icon: <Bell className="w-5 h-5" />,
      label: "Notifications",
      href: "/notifications",
    });

    return baseItems;
  }, [sidebarMenuFromStore, userRole, user]);

  const isMenuItemActive = useCallback(
    (item: MenuItem) => {
      return checkMenuItemActive(
        item,
        location,
        currentPage,
        [],
        sidebarMenuFromStore,
      );
    },
    [location, currentPage, sidebarMenuFromStore],
  );

  const isMenuExpanded = (itemId: string) => {
    return expandedMenus.includes(itemId);
  };

  const toggleMenu = useCallback((menuId: string) => {
    setExpandedMenus((prev) => {
      if (prev.includes(menuId)) {
        manuallyCollapsedRef.current.add(menuId);
        saveManuallyCollapsedMenus(manuallyCollapsedRef.current);
        return prev.filter((id) => id !== menuId);
      } else {
        manuallyCollapsedRef.current.delete(menuId);
        saveManuallyCollapsedMenus(manuallyCollapsedRef.current);
        return [...prev, menuId];
      }
    });
  }, []);

  const collapseMenuIfExpanded = useCallback((menuId: string) => {
    setExpandedMenus((prev) => {
      if (prev.includes(menuId)) {
        manuallyCollapsedRef.current.add(menuId);
        saveManuallyCollapsedMenus(manuallyCollapsedRef.current);
        return prev.filter((id) => id !== menuId);
      }
      return prev;
    });
  }, []);

  const expandMenu = useCallback((menuId: string) => {
    setExpandedMenus((prev) => {
      if (!prev.includes(menuId)) {
        manuallyCollapsedRef.current.delete(menuId);
        saveManuallyCollapsedMenus(manuallyCollapsedRef.current);
        return [...prev, menuId];
      }
      return prev;
    });
  }, []);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 bg-opacity-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-68 bg-primary border-r border-border-primary
          transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div
          className={`flex items-center px-5 py-0.5 border-b border-border-primary shrink-0 ${
            isOpen ? "justify-center" : "justify-center"
          }`}
        >
          <div className="flex items-center justify-center">
            <img
              onClick={() => {
                const plantId = getCurrentPlantId();
                if (plantId) {
                  const route = `/plant/${plantId}`;
                  navigate(route);
                }
              }}
              src={logo ? logo : Logo}
              alt="logo"
              className="h-16 w-32 object-contain cursor-pointer scale-85"
            />
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto min-h-0 z-60 relative">
          {menuItems?.map((item) => {
            const hasSubMenu = item.subMenu && item.subMenu.length > 0;
            const isExpanded = isMenuExpanded(item.id);

            return (
              <div key={item.id}>
                <Link
                  to={item.href || ""}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer min-w-0 ${
                    isMenuItemActive(item)
                      ? "bg-linear-to-r text-white shadow-lg"
                      : "text-text-primary hover:bg-hover-bg-primary"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {hasSubMenu && (
                      <ChevronRight
                        className={`w-5 h-5 transition-transform duration-200 shrink-0 ${
                          isExpanded ? "transform rotate-90" : ""
                        }`}
                      />
                    )}
                    <span className="shrink-0">{item.icon}</span>
                    <span
                      className="font-normal font-roboto text-left text-lg truncate flex-1 min-w-0 capitalize"
                      title={item.label}
                    >
                      {item.label}
                    </span>
                  </div>
                </Link>

                {hasSubMenu && isExpanded && (
                  <div className="mt-1 ml-6 space-y-1 relative">
                    <div className="absolute left-2 top-0 bottom-0 w-px bg-border-primary"></div>
                    {item.subMenu?.map((subItem, index) => {
                      const hasSubSubMenu =
                        subItem.subMenu && subItem.subMenu.length > 0;
                      const isSubExpanded = isMenuExpanded(subItem.id);
                      const currentSystemId = localStorage.getItem("systemId");

                      const isDepartmentMenuItem = item.id.startsWith("dept-");
                      const isLastItem =
                        index === (item.subMenu?.length || 0) - 1;

                      const isActive =
                        checkSystemMenuItemActive(
                          subItem,
                          location,
                          isDepartmentMenuItem,
                          currentSystemId,
                        ) ||
                        (subItem.id.startsWith("org-") ||
                        subItem.id.startsWith("plant-") ||
                        subItem.id.startsWith("dept-")
                          ? isMenuItemActive(subItem)
                          : false);

                      return (
                        <div key={subItem.id} className="relative">
                          <div className="relative flex items-start">
                            <div className="absolute left-2 top-4.5 w-4 h-px bg-border-primary"></div>
                            {!isLastItem && (
                              <div className="absolute left-2 top-3 bottom-0 w-px bg-border-primary"></div>
                            )}
                            <button
                              type="button"
                              className={`relative z-10 w-full flex items-center justify-between pl-3 pr-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer min-w-0 ${
                                isActive
                                  ? "bg-linear-to-r text-white shadow-lg"
                                  : "text-text-secondary hover:bg-hover-bg-primary"
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                if (hasSubSubMenu) {
                                  if (
                                    subItem.id.startsWith("org-") ||
                                    subItem.id.startsWith("plant-") ||
                                    subItem.id.startsWith("dept-")
                                  ) {
                                    if (subItem.id.startsWith("org-")) {
                                      toggleMenu(subItem.id);
                                      handleOrgMenuClick(
                                        subItem,
                                        navigate,
                                        userRole,
                                        setIsOpen,
                                      );
                                    } else if (
                                      subItem.id.startsWith("plant-")
                                    ) {
                                      setExpandedMenus((prev) => {
                                        const updated = [...prev];

                                        if (item.subMenu) {
                                          item.subMenu.forEach(
                                            (otherSubItem) => {
                                              if (
                                                otherSubItem.id.startsWith(
                                                  "plant-",
                                                ) &&
                                                otherSubItem.id !==
                                                  subItem.id &&
                                                updated.includes(
                                                  otherSubItem.id,
                                                )
                                              ) {
                                                const index = updated.indexOf(
                                                  otherSubItem.id,
                                                );
                                                if (index > -1) {
                                                  updated.splice(index, 1);
                                                  manuallyCollapsedRef.current.add(
                                                    otherSubItem.id,
                                                  );
                                                }
                                              }
                                            },
                                          );
                                        }

                                        if (!updated.includes(subItem.id)) {
                                          updated.push(subItem.id);
                                          manuallyCollapsedRef.current.delete(
                                            subItem.id,
                                          );
                                        }

                                        saveManuallyCollapsedMenus(
                                          manuallyCollapsedRef.current,
                                        );
                                        return updated;
                                      });

                                      expandMenu(subItem.id);

                                      handlePlantMenuClick(
                                        subItem,
                                        navigate,
                                        setIsOpen,
                                      );
                                    } else if (subItem.id.startsWith("dept-")) {
                                      setExpandedMenus((prev) => {
                                        const updated = [...prev];

                                        if (item.subMenu) {
                                          item.subMenu.forEach(
                                            (otherSubItem) => {
                                              if (
                                                otherSubItem.id.startsWith(
                                                  "dept-",
                                                ) &&
                                                otherSubItem.id !==
                                                  subItem.id &&
                                                updated.includes(
                                                  otherSubItem.id,
                                                )
                                              ) {
                                                const index = updated.indexOf(
                                                  otherSubItem.id,
                                                );
                                                if (index > -1) {
                                                  updated.splice(index, 1);
                                                  manuallyCollapsedRef.current.add(
                                                    otherSubItem.id,
                                                  );
                                                }
                                              }
                                            },
                                          );
                                        }

                                        if (!updated.includes(subItem.id)) {
                                          updated.push(subItem.id);
                                          manuallyCollapsedRef.current.delete(
                                            subItem.id,
                                          );
                                        }

                                        saveManuallyCollapsedMenus(
                                          manuallyCollapsedRef.current,
                                        );
                                        return updated;
                                      });

                                      expandMenu(subItem.id);

                                      handleDeptMenuClick(
                                        subItem,
                                        navigate,
                                        location,
                                        sidebarMenuFromStore || [],
                                        expandMenu,
                                        collapseMenuIfExpanded,
                                        // setIsOpen,
                                      );
                                    }
                                  } else {
                                    toggleMenu(subItem.id);
                                  }
                                } else {
                                  if (isDepartmentMenuItem) {
                                    handleSystemMenuClick(
                                      subItem,
                                      navigate,
                                      setIsOpen,
                                    );
                                  } else {
                                    if (subItem.href) {
                                      navigate(subItem.href);
                                    }
                                    if (window.innerWidth < 1024) {
                                      setTimeout(() => setIsOpen(false), 100);
                                    }
                                  }
                                }
                              }}
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                {hasSubSubMenu && (
                                  <ChevronRight
                                    className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
                                      isSubExpanded ? "transform rotate-90" : ""
                                    }`}
                                  />
                                )}
                                <span className="shrink-0">{subItem.icon}</span>
                                <span
                                  className="font-normal font-roboto text-left text-base truncate flex-1 min-w-0"
                                  title={subItem.label}
                                >
                                  {subItem.label}
                                </span>
                              </div>
                            </button>
                          </div>
                          {hasSubSubMenu && isSubExpanded && (
                            <div className="mt-1 ml-6 space-y-1 relative">
                              <div className="absolute left-2 top-0 bottom-0 w-px bg-border-primary"></div>
                              {subItem.subMenu?.map((subSubItem, subIndex) => {
                                const hasSubSubSubMenu =
                                  subSubItem.subMenu &&
                                  subSubItem.subMenu.length > 0;
                                const isSubSubExpanded = isMenuExpanded(
                                  subSubItem.id,
                                );
                                const isSubLastItem =
                                  subIndex ===
                                  (subItem.subMenu?.length || 0) - 1;
                                const subSubPathParts = location.pathname
                                  .split("/")
                                  .filter(Boolean);
                                const subSubIsDeviceDetailRoute =
                                  subSubPathParts.some(
                                    (part) =>
                                      part.includes("-device") &&
                                      part !== "device",
                                  );
                                const isSubActive =
                                  isMenuItemActive(subSubItem) ||
                                  (location.pathname.startsWith(
                                    "/system/device/",
                                  ) &&
                                    subSubPathParts.length >= 5 &&
                                    !subSubIsDeviceDetailRoute &&
                                    subSubItem.id.startsWith("system-") &&
                                    subSubItem.id.replace("system-", "") ===
                                      subSubPathParts[4]);

                                return (
                                  <div key={subSubItem.id} className="relative">
                                    <div className="relative flex items-start">
                                      <div className="absolute left-2 top-4 w-4 h-px bg-border-primary"></div>
                                      {!isSubLastItem && (
                                        <div className="absolute left-2 top-3 bottom-0 w-px bg-border-primary"></div>
                                      )}
                                      <button
                                        type="button"
                                        className={`relative z-10 w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer min-w-0 ${
                                          isSubActive
                                            ? "bg-linear-to-r text-white shadow-lg"
                                            : "text-text-secondary hover:bg-hover-bg-primary"
                                        }`}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();

                                          if (hasSubSubSubMenu) {
                                            if (
                                              subSubItem.id.startsWith("plant-")
                                            ) {
                                              const parentOrg = menuItems.find(
                                                (menuItem) =>
                                                  menuItem.subMenu?.some(
                                                    (sub) =>
                                                      sub.subMenu?.some(
                                                        (subSub) =>
                                                          subSub.id ===
                                                          subSubItem.id,
                                                      ),
                                                  ),
                                              );

                                              if (parentOrg?.subMenu) {
                                                setExpandedMenus((prev) => {
                                                  const updated = [...prev];

                                                  parentOrg.subMenu?.forEach(
                                                    (otherSubItem) => {
                                                      if (
                                                        otherSubItem.id.startsWith(
                                                          "plant-",
                                                        ) &&
                                                        otherSubItem.id !==
                                                          subSubItem.id &&
                                                        updated.includes(
                                                          otherSubItem.id,
                                                        )
                                                      ) {
                                                        const index =
                                                          updated.indexOf(
                                                            otherSubItem.id,
                                                          );
                                                        if (index > -1) {
                                                          updated.splice(
                                                            index,
                                                            1,
                                                          );
                                                          manuallyCollapsedRef.current.add(
                                                            otherSubItem.id,
                                                          );
                                                        }
                                                      }
                                                    },
                                                  );

                                                  if (
                                                    !updated.includes(
                                                      subSubItem.id,
                                                    )
                                                  ) {
                                                    updated.push(subSubItem.id);
                                                    manuallyCollapsedRef.current.delete(
                                                      subSubItem.id,
                                                    );
                                                  }

                                                  saveManuallyCollapsedMenus(
                                                    manuallyCollapsedRef.current,
                                                  );
                                                  return updated;
                                                });

                                                expandMenu(subSubItem.id);
                                              } else {
                                                toggleMenu(subSubItem.id);
                                              }

                                              handlePlantMenuClick(
                                                subSubItem,
                                                navigate,
                                                // setIsOpen,
                                              );
                                            } else if (
                                              subSubItem.id.startsWith("dept-")
                                            ) {
                                              setExpandedMenus((prev) => {
                                                const updated = [...prev];

                                                if (subItem.subMenu) {
                                                  subItem.subMenu.forEach(
                                                    (otherSubSubItem) => {
                                                      if (
                                                        otherSubSubItem.id.startsWith(
                                                          "dept-",
                                                        ) &&
                                                        otherSubSubItem.id !==
                                                          subSubItem.id &&
                                                        updated.includes(
                                                          otherSubSubItem.id,
                                                        )
                                                      ) {
                                                        const index =
                                                          updated.indexOf(
                                                            otherSubSubItem.id,
                                                          );
                                                        if (index > -1) {
                                                          updated.splice(
                                                            index,
                                                            1,
                                                          );
                                                          manuallyCollapsedRef.current.add(
                                                            otherSubSubItem.id,
                                                          );
                                                        }
                                                      }
                                                    },
                                                  );
                                                }

                                                if (
                                                  !updated.includes(
                                                    subSubItem.id,
                                                  )
                                                ) {
                                                  updated.push(subSubItem.id);
                                                  manuallyCollapsedRef.current.delete(
                                                    subSubItem.id,
                                                  );
                                                }

                                                saveManuallyCollapsedMenus(
                                                  manuallyCollapsedRef.current,
                                                );
                                                return updated;
                                              });

                                              expandMenu(subSubItem.id);

                                              handleDeptMenuClick(
                                                subSubItem,
                                                navigate,
                                                location,
                                                sidebarMenuFromStore || [],
                                                expandMenu,
                                                collapseMenuIfExpanded,
                                                // setIsOpen,
                                              );
                                            } else {
                                              toggleMenu(subSubItem.id);
                                            }
                                          } else {
                                            handleSystemMenuClick(
                                              subSubItem,
                                              navigate,
                                              setIsOpen,
                                            );
                                          }
                                        }}
                                      >
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                          {hasSubSubSubMenu && (
                                            <ChevronRight
                                              className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
                                                isSubSubExpanded
                                                  ? "transform rotate-90"
                                                  : ""
                                              }`}
                                            />
                                          )}
                                          <span className="shrink-0">
                                            {subSubItem.icon}
                                          </span>
                                          <span
                                            className="font-normal font-roboto text-left text-sm truncate flex-1 min-w-0"
                                            title={subSubItem.label}
                                          >
                                            {subSubItem.label}
                                          </span>
                                        </div>
                                      </button>
                                    </div>
                                    {hasSubSubSubMenu && isSubSubExpanded && (
                                      <div className="mt-1 ml-6 space-y-1 relative">
                                        <div className="absolute left-2 top-0 bottom-0 w-px bg-border-primary"></div>
                                        {subSubItem.subMenu?.map(
                                          (systemItem, systemIndex) => {
                                            const isSystemLastItem =
                                              systemIndex ===
                                              (subSubItem.subMenu?.length ||
                                                0) -
                                                1;
                                            const isSystemActive =
                                              checkSystemMenuItemActive(
                                                systemItem,
                                                location,
                                                true,
                                                currentSystemId,
                                              );

                                            return (
                                              <div
                                                key={systemItem.id}
                                                className="relative flex items-start"
                                              >
                                                <div className="absolute left-2 top-4.5 w-4 h-px bg-border-primary"></div>
                                                {!isSystemLastItem && (
                                                  <div className="absolute left-2 top-3 bottom-0 w-px bg-border-primary"></div>
                                                )}
                                                <button
                                                  type="button"
                                                  className={`relative z-10 w-full flex items-center px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer min-w-0 ${
                                                    isSystemActive
                                                      ? "bg-linear-to-r text-white shadow-lg"
                                                      : "text-text-secondary hover:bg-hover-bg-primary"
                                                  }`}
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleSystemMenuClick(
                                                      systemItem,
                                                      navigate,
                                                      setIsOpen,
                                                    );
                                                  }}
                                                >
                                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <span className="shrink-0">
                                                      {systemItem.icon}
                                                    </span>
                                                    <span
                                                      className="font-normal font-roboto text-left text-sm truncate flex-1 min-w-0"
                                                      title={systemItem.label}
                                                    >
                                                      {systemItem.label}
                                                    </span>
                                                  </div>
                                                </button>
                                              </div>
                                            );
                                          },
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
