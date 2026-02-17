import {
  Bell,
  ChevronDown,
  Menu,
  Sun,
  Moon,
  User,
  LogOut,
  HelpCircle,
  Mail,
  Phone,
} from "lucide-react";
import { useTheme } from "../../context/useTheme";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { logout } from "../../../store/usersSlice";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Error, Success } from "../../utils/toast";
import { getPlantAlerts } from "../../../store/plantSlice";
import { getCurrentPlantId, clearSelectedPlant } from "../../utils/plantUtils";
import type { PlantAlertResult } from "../../../model/plant-alert.interface";

interface HeaderProps {
  onMenuClick: () => void;
  isDiagramSidebarOpen?: boolean;
  isWaterBalanceRoute?: boolean;
  sidebarOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  isDiagramSidebarOpen,
  isWaterBalanceRoute,
  sidebarOpen,
}) => {
  const organizationId = localStorage.getItem("organizationId");
  const { plants } = useAppSelector((state) => state.plant);
  const { departments } = useAppSelector((state) => state.department);
  const { systems } = useAppSelector((state) => state.system);

  const organizationName = useMemo(() => {
    if (!organizationId) return "";

    const orgIdNum = Number(organizationId);

    const plant = plants?.find((p) => p.organization_id === orgIdNum);
    const department = departments?.find((d) => d.organization_id === orgIdNum);
    const system = systems?.find((s) => s.organization_id === orgIdNum);
    return (
      plant?.organization_name ||
      department?.organization_name ||
      system?.organization_name ||
      ""
    );
  }, [organizationId, plants, departments, systems]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const helpDropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const userRole = user?.plantsList.find(
    (plant) => plant.plant_id === Number(getCurrentPlantId()),
  )?.role;
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [plantAlerts, setPlantAlerts] = useState<PlantAlertResult[]>([]);

  const handleGetPlantAlerts = useCallback(async () => {
    await dispatch(
      getPlantAlerts({
        plant_id: Number(getCurrentPlantId()),
        page_no: 1,
        page_size: 50,
        yyyy: new Date().getFullYear(),
        mm: new Date().getMonth() + 1,
      }),
    )
      .unwrap()
      .then((res) => {
        if (res.success) {
          setPlantAlerts(res.data);
        } else {
          Error(res.message);
        }
      })
      .catch((err) => {
        Error(err.message);
      });
  }, [dispatch]);

  useEffect(() => {
    handleGetPlantAlerts();
  }, [handleGetPlantAlerts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotificationDropdownOpen(false);
      }
      if (
        helpDropdownRef.current &&
        !helpDropdownRef.current.contains(event.target as Node)
      ) {
        setIsHelpDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    clearSelectedPlant();
    setIsDropdownOpen(false);

    navigate("/login", { replace: true });

    dispatch(logout());
    Success("You have been logged out successfully.");
  };

  const getPageTitle = () => {
    const path = location.pathname;
    // const organization = localStorage.getItem("organization");

    if (path === "/devices") return "Devices";
    if (path === "/settings") return "Settings";
    if (path === "/users") return "Users";
    if (path === "/plant-layout") return "Plant Layout";
    if (path === "/notifications") return "Notifications";
    if (path.startsWith("/organization/")) return organizationName;
    if (path.startsWith("/plant/")) return organizationName || "";
    if (path.startsWith("/department/device/")) return organizationName || "";
    if (path.startsWith("/system/device/")) return organizationName || "";

    if (
      path.startsWith("/device-details/fm-device/") ||
      path.startsWith("/system/device/fm-device/")
    )
      return "FM Device";
    if (
      path.startsWith("/device-details/tank-device/") ||
      path.startsWith("/system/device/tank-device/")
    )
      return "Tank Device";
    if (
      path.startsWith("/device-details/brwhms-device/") ||
      path.startsWith("/system/device/brwhms-device/")
    )
      return "BRWHMS Device";
    if (
      path.startsWith("/device-details/arg-device/") ||
      path.startsWith("/system/device/arg-device/")
    )
      return "Rain Gauge Device";
    if (
      path.startsWith("/device-details/phmc-device/") ||
      path.startsWith("/system/device/phmc-device/")
    )
      return "PHMC Device";
    if (
      path.startsWith("/device-details/dwlr-device/") ||
      path.startsWith("/system/device/dwlr-device/")
    )
      return "DWLR Device";
    if (
      path.startsWith("/device-details/bdwfms-device/") ||
      path.startsWith("/system/device/bdwfms-device/")
    )
      return "BDWFMS Device";
    if (
      path.startsWith("/device-details/smart-device/") ||
      path.startsWith("/system/device/smart-device/")
    )
      return "Smart Device";
  };

  const handleViewAllNotifications = () => {
    navigate("/notifications");
    setIsNotificationDropdownOpen(false);
  };

  return (
    <div
      className={`bg-primary border-b border-border-primary px-4 py-3 flex items-center justify-between shadow-lg transition-all duration-300 ${
        isWaterBalanceRoute && isDiagramSidebarOpen ? "mr-85" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className={`p-2 rounded-md text-text-primary hover:text-foreground hover:bg-accent transition-colors ${
            location.pathname === "/plant-layout"
              ? "block"
              : sidebarOpen
                ? "hidden"
                : "lg:hidden"
          }`}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden md:block">
          <h1
            className={`text-2xl font-normal font-roboto ${
              getPageTitle() === organizationName
                ? "text-status-info"
                : "text-text-primary"
            }`}
          >
            {getPageTitle()}
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          className="p-2.5 rounded-xl text-text-secondary hover:bg-hover-bg-primary transition-colors cursor-pointer"
          onClick={toggleTheme}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>

        <div className="relative" ref={helpDropdownRef}>
          <button
            onClick={() => setIsHelpDropdownOpen(!isHelpDropdownOpen)}
            className="p-2.5 rounded-xl text-text-secondary hover:bg-hover-bg-primary transition-colors cursor-pointer"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {isHelpDropdownOpen && (
            <div className="absolute -left-27 sm:left-0 mt-2 w-72 bg-card border border-border-primary rounded-lg shadow-lg z-60">
              <div className="p-2">
                <div className="text-text-primary font-roboto text-base font-normal border-b border-border-primary pb-2">
                  Contact Us
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-3 px-3 py-1.5 rounded-lg hover:bg-hover-bg-primary transition-colors">
                    <Mail className="w-5 h-5 text-text-secondary" />
                    <div className="flex flex-col items-start">
                      <div className="text-text-secondary font-roboto text-xs">
                        Email
                      </div>
                      <a
                        href="mailto:support@bulfro.com"
                        className="text-text-primary font-roboto text-sm font-light hover:text-status-info transition-colors"
                      >
                        support@bulfro.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 px-3 py-1.5 rounded-lg hover:bg-hover-bg-primary transition-colors">
                    <Phone className="w-5 h-5 text-text-secondary" />
                    <div className="flex flex-col items-start">
                      <div className="text-text-secondary font-roboto text-xs">
                        Mobile
                      </div>
                      <a
                        href="tel:+918459004436"
                        className="text-text-primary font-roboto text-sm font-normal hover:text-status-info transition-colors"
                      >
                        +91 8459004436
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={notificationDropdownRef}>
          <button
            onClick={() =>
              setIsNotificationDropdownOpen(!isNotificationDropdownOpen)
            }
            className="relative p-2.5 rounded-xl text-text-secondary hover:bg-hover-bg-primary transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-status-danger text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-roboto">
              {plantAlerts.length}
            </span>
          </button>

          {isNotificationDropdownOpen && (
            <div className="absolute -left-48 md:-left-21 mt-2 w-80 bg-card border border-border-primary rounded-lg shadow-lg z-60 max-h-96 flex flex-col">
              <div className="text-text-secondary font-roboto text-sm font-normal border-b border-border-primary px-4 py-2 sticky top-0 bg-card z-10">
                Notifications
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto p-4 flex-1 min-h-0">
                {plantAlerts.length > 0 ? (
                  plantAlerts.map((alert, index) => (
                    <div
                      key={`${alert.device_id}-${alert.system_id}-${alert.plant_id}-${alert.department_id}-${alert.created_at}-${index}`}
                      className="p-3 rounded-lg hover:bg-hover-bg-primary bg-secondary transition-colors cursor-pointer border-b border-border-primary last:border-b-0"
                    >
                      <div className="text-text-primary font-roboto text-base font-normal">
                        {alert.alert_title}
                      </div>
                      <div className="text-text-secondary font-roboto text-sm mt-1">
                        {alert.alert_message}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-primary rounded-lg text-center">
                    <Bell className="w-10 h-10 text-text-secondary mb-4 opacity-50" />
                    <p className="text-text-secondary text-base font-roboto">
                      No notifications found
                    </p>
                  </div>
                )}
              </div>
              <div className="border-t border-border-primary bg-card p-4 flex items-center justify-center">
                <button
                  onClick={handleViewAllNotifications}
                  className="text-center text-text-primary font-roboto text-sm font-normal hover:text-status-info transition-colors cursor-pointer border border-border-primary rounded-lg p-2"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center space-x-3 pl-3 border-l border-border-primary px-2 rounded-lg hover:bg-hover-bg-primary transition-colors cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <User className="w-5 h-5 text-text-primary" />
            <div className="hidden md:block">
              <p className="text-base font-normal text-text-primary font-roboto">
                {user?.client_name}
              </p>
              <p className="text-sm text-text-secondary font-roboto">
                {userRole === "org_admin"
                  ? "Admin"
                  : userRole === "org_user"
                    ? "User"
                    : user?.plantsList[0].role === "org_admin"
                      ? "Admin"
                      : "User"}
              </p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-text-primary transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border-primary rounded-lg shadow-lg z-60">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-status-danger hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-3" />
                <span className="text-base font-normal font-roboto">
                  Logout
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
