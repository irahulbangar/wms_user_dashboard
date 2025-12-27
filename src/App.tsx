import Login from "./Components/Login";
import AuthInitializer from "./Components/AuthInitializer";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import {
  Navigate,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import store from "../store/store";
import RootLayout from "./Components/Layout/RootLayout";
import Dashboard from "./Components/Dashboard/Dashboard";
import WaterBalance from "./Components/WtareBalance/WaterBalance";
import Devices from "./Components/Devices/Devices";
import OrganizationRouteGuard from "./Components/OrganizationRouteGuard";
import Users from "./Components/Users";
import TankDevice from "./Components/Devices/TankDevice";
import DepartmentDevices from "./Components/Department/DepartmentDevices";
import FmDevice from "./Components/Devices/FmDevice";
import SystemDevices from "./Components/System/SystemDevices";
import BrwhmsDevice from "./Components/Devices/BrwhmsDevice";
import ArgDevice from "./Components/Devices/ArgDevice";
import PhmcDevice from "./Components/Devices/PhmcDevice";
import Notifications from "./Components/Notifications";
import Setting from "./Components/Setting";
import Reports from "./Components/Report/Reports";
import HomeRedirect from "./Components/HomeRedirect";
import DwlrDevice from "./Components/Devices/DwlrDevice";
import BdwfmsDevice from "./Components/Devices/BdwfmsDevice";
import SmartDevice from "./Components/Devices/SmartDevice";

function ThemedToast() {
  const { theme } = useTheme();
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme === "dark" ? "dark" : "light"}
    />
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "/", element: <HomeRedirect /> },
      { path: "/login", element: <Login /> },
      {
        path: "/organization/:organizationId",
        element: <OrganizationRouteGuard />,
      },
      { path: "/plant/:plantId", element: <Dashboard /> },
      { path: "/plant-layout", element: <WaterBalance /> },
      { path: "/devices", element: <Devices /> },
      { path: "/device-details/fm-device/:device_id", element: <FmDevice /> },
      {
        path: "/system/device/fm-device/:device_id",
        element: <FmDevice />,
      },
      {
        path: "/device-details/tank-device/:device_id",
        element: <TankDevice />,
      },
      {
        path: "/system/device/tank-device/:device_id",
        element: <TankDevice />,
      },
      {
        path: "/device-details/brwhms-device/:device_id",
        element: <BrwhmsDevice />,
      },
      {
        path: "/system/device/brwhms-device/:device_id",
        element: <BrwhmsDevice />,
      },
      { path: "/device-details/arg-device/:device_id", element: <ArgDevice /> },
      {
        path: "/system/device/arg-device/:device_id",
        element: <ArgDevice />,
      },
      {
        path: "/device-details/phmc-device/:device_id",
        element: <PhmcDevice />,
      },
      {
        path: "/system/device/phmc-device/:device_id",
        element: <PhmcDevice />,
      },
      {
        path: "/device-details/dwlr-device/:device_id",
        element: <DwlrDevice />,
      },
      {
        path: "/system/device/dwlr-device/:device_id",
        element: <DwlrDevice />,
      },
      {
        path: "/device-details/bdwfms-device/:device_id",
        element: <BdwfmsDevice />,
      },
      {
        path: "/system/device/bdwfms-device/:device_id",
        element: <BdwfmsDevice />,
      },
      {
        path: "/device-details/smart-device/:device_id",
        element: <SmartDevice />,
      },
      {
        path: "/system/device/smart-device/:device_id",
        element: <SmartDevice />,
      },
      { path: "/users", element: <Users /> },
      { path: "/notifications", element: <Notifications /> },
      { path: "/settings", element: <Setting /> },
      {
        path: "/department/device/:organizationId/:plantId/:departmentId",
        element: <DepartmentDevices />,
      },
      {
        path: "/system/device/:organizationId/:plantId/:systemId",
        element: <SystemDevices />,
      },
      { path: "/reports", element: <Reports /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider>
      <Provider store={store}>
        <AuthInitializer>
          <RouterProvider router={router} />

          {/* Toast Container */}
          <ThemedToast />
        </AuthInitializer>
      </Provider>
    </ThemeProvider>
  );
}

export default App;
