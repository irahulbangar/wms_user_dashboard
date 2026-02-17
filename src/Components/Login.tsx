import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Error, Success } from "../utils/toast";
import { Eye, EyeOff, Loader2, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  loginUser,
  setUser,
  setToken,
  setLoading,
  logout,
  getSubdomain,
} from "../../store/usersSlice";
import Loader from "./Loader";
import BackgroundImage from "../assets/images/background.jpg";
import { ApiError } from "../utils/errorHandler";
import { jwtDecode } from "jwt-decode";
import type { PlantsList } from "../../model/users.interface";

interface TokenPayload {
  client_id?: number;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  status?: string;
  organization_id?: number;
  created_at?: string;
  updated_at?: string;
  plantsList?: PlantsList[];
  exp?: number;
  iat?: number;
}

interface UserPayload {
  id: string;
  client_email: string;
  client_name: string;
  client_phone: string;
  role: string;
  status: string;
  organization_id: number;
  created_at: string;
  updated_at: string;
  plantsList: PlantsList[];
}

const Login: React.FC = () => {
  const [client_email, setClientEmail] = useState("");
  const [client_password, setClientPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated, user } = useAppSelector(
    (state) => state.user,
  );

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }

    dispatch(getSubdomain())
      .unwrap()
      .then((res) => {
        if (res.success || res.status === 200) {
          const data = res.data || res;
          const logo = data.logo || data.logo_url || data.logoUrl;
          const organization =
            data.organization_name ||
            data.organizationName ||
            data.organization;

          if (logo) {
            localStorage.setItem("logo", logo);
          } else {
            console.warn(
              "Logo is missing in API response. Available keys:",
              Object.keys(data),
            );
          }

          if (organization) {
            localStorage.setItem("organization", organization);
          } else {
            console.warn(
              "Organization name is missing in API response. Available keys:",
              Object.keys(data),
            );
          }
        } else {
          Error(res.message || "Error getting subdomain.");
        }
      })
      .catch((err) => {
        console.error("Error getting subdomain:", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTokenLogin = useCallback(
    async (token: string) => {
      try {
        dispatch(setLoading(true));

        const tokenFromUrl = token.trim();

        if (!tokenFromUrl || tokenFromUrl.split(".").length !== 3) {
          Error("Invalid token format. Please login again.");
          searchParams.delete("token");
          setSearchParams(searchParams);
          dispatch(setLoading(false));
          return;
        }

        const logo = localStorage.getItem("logo");
        const organization = localStorage.getItem("organization");

        localStorage.clear();

        if (logo) {
          localStorage.setItem("logo", logo);
        }
        if (organization) {
          localStorage.setItem("organization", organization);
        }

        let decodedToken: TokenPayload;
        try {
          decodedToken = jwtDecode<TokenPayload>(tokenFromUrl);
        } catch (decodeError) {
          console.error("Token decode error:", decodeError);
          Error("Invalid token format. Please login again.");
          searchParams.delete("token");
          setSearchParams(searchParams);
          dispatch(setLoading(false));
          return;
        }

        if (
          decodedToken.status === "Inactive" ||
          decodedToken.status === "inactive"
        ) {
          Error(
            "Access denied. Your account is inactive. Please contact your administrator.",
          );
          searchParams.delete("token");
          setSearchParams(searchParams);
          dispatch(setLoading(false));
          return;
        }

        if (!decodedToken.plantsList || decodedToken.plantsList.length === 0) {
          Error("Access denied. Please contact your administrator.");
          searchParams.delete("token");
          setSearchParams(searchParams);
          dispatch(setLoading(false));
          return;
        }

        const userPayload: UserPayload = {
          id: decodedToken.client_id?.toString() || "",
          client_email: decodedToken.client_email || "",
          client_name: decodedToken.client_name || "",
          client_phone: decodedToken.client_phone || "",
          role: decodedToken.plantsList[0]?.role || "",
          status: decodedToken.status || "active",
          organization_id: decodedToken.organization_id || 0,
          created_at: decodedToken.created_at || "",
          updated_at: decodedToken.updated_at || "",
          plantsList: decodedToken.plantsList || [],
        };

        localStorage.setItem("LAST_LOGIN", new Date().toLocaleString());
        localStorage.setItem("accessToken", tokenFromUrl);
        localStorage.setItem("user", JSON.stringify(userPayload));

        const savedToken = localStorage.getItem("accessToken");
        if (savedToken !== tokenFromUrl) {
          localStorage.setItem("accessToken", tokenFromUrl);
        }

        if (userPayload.organization_id) {
          localStorage.setItem(
            "organizationId",
            userPayload.organization_id.toString(),
          );
        }

        dispatch(setUser(userPayload));
        dispatch(setToken(tokenFromUrl));

        searchParams.delete("token");
        setSearchParams(searchParams);

        Success("You are logged in successfully..!!");
      } catch (error) {
        console.error("Error processing token login:", error);
        Error("Invalid token. Please login again.");
        searchParams.delete("token");
        setSearchParams(searchParams);
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, searchParams, setSearchParams],
  );

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      const logo = localStorage.getItem("logo");
      const organization = localStorage.getItem("organization");

      localStorage.clear();
      dispatch(logout());

      if (logo) {
        localStorage.setItem("logo", logo);
      }
      if (organization) {
        localStorage.setItem("organization", organization);
      }

      const tokenFromUrl = token.trim();

      if (tokenFromUrl && tokenFromUrl.split(".").length === 3) {
        handleTokenLogin(tokenFromUrl);
      } else {
        console.error(
          "Invalid token format from URL. Token parts:",
          tokenFromUrl?.split(".").length,
        );
        Error("Invalid token format. Please login again.");
        searchParams.delete("token");
        setSearchParams(searchParams);
      }
    }
  }, [searchParams, handleTokenLogin, setSearchParams, dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const userRole = user.role || user.plantsList?.[0]?.role;
      const organizationId = user.organization_id;

      if (userRole === "org_admin") {
        navigate(`/organization/${organizationId}`);
      } else if (
        userRole === "org_user" &&
        user.plantsList &&
        user.plantsList.length > 0
      ) {
        const firstPlantId = user.plantsList[0].plant_id;
        navigate(`/plant/${firstPlantId}`);
      } else {
        if (user.plantsList && user.plantsList.length > 0) {
          const firstPlantId = user.plantsList[0].plant_id;
          navigate(`/plant/${firstPlantId}`);
        }
      }
    }
  }, [isAuthenticated, user, navigate]);

  if (isAuthenticated || isLoading) {
    return <Loader />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const logo = localStorage.getItem("logo");
    const organization = localStorage.getItem("organization");

    localStorage.clear();

    if (logo) {
      localStorage.setItem("logo", logo);
    }
    if (organization) {
      localStorage.setItem("organization", organization);
    }

    try {
      const result = await dispatch(
        loginUser({ client_email, client_password }),
      ).unwrap();

      if (result.success || result.status === 200) {
        Success(result.message || "You are logged in successfully..!!");
      } else {
        Error(result.message || "Login failed. Please try again.");
      }
    } catch (error) {
      // Handle different error types
      let errorMessage = "Login failed. Please try again.";

      if (error instanceof ApiError) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage =
          typeof error.message === "string"
            ? error.message
            : "Login failed. Please try again.";
      }

      Error(errorMessage);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden animate-pan-background"
      style={{
        backgroundImage: `url(${BackgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/50 bg-opacity-40"></div>
      <div className="max-w-md w-full relative z-10 bg-primary rounded-lg shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col mb-6">
            <h2 className="text-3xl font-normal text-text-primary mb-1 font-roboto">
              Welcome Back
            </h2>
            <p className="text-text-secondary font-roboto">
              Sign in to your WMS Dashboard
            </p>
          </div>
          <button
            className="p-2.5 rounded-xl text-text-primary bg-secondary hover:bg-hover-bg-primary transition-colors cursor-pointer absolute top-4 right-4"
            onClick={toggleTheme}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <label
            htmlFor="client_email"
            className="block text-sm font-normal text-text-secondary mb-2 font-roboto"
          >
            Email
          </label>
          <input
            name="client_email"
            type="email"
            value={client_email}
            onChange={(e) => setClientEmail(e.target.value)}
            className="w-full px-3 py-1.5 border border-border-primary text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none focus:ring-1 focus:ring-status-success focus:border-status-success/50 transition-colors font-roboto"
            placeholder="Enter your email"
          />

          <label
            htmlFor="client_password"
            className="block text-sm font-normal text-text-secondary mb-2 font-roboto"
          >
            Password
          </label>
          <div className="relative">
            <input
              name="client_password"
              type={showPassword ? "text" : "password"}
              value={client_password}
              onChange={(e) => setClientPassword(e.target.value)}
              className="w-full px-3 py-1.5 pr-10 border border-border-primary text-text-primary rounded-md placeholder-text-text-secondary focus:outline-none focus:ring-1 focus:ring-status-success focus:border-status-success/50 transition-colors font-roboto"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-end">
            {/* <div className="flex items-center">
              <input
                name="remember-me"
                value="remember-me"
                type="checkbox"
                className="h-4 w-4 text-status-info focus:ring-status-info border-border-primary rounded cursor-pointer font-roboto"
              />
              <label className="ml-2 block text-sm text-text-secondary font-roboto">
                Remember me
              </label>
            </div> */}

            <div className="text-sm">
              <a
                href="#"
                className="font-normal text-status-info hover:text-status-info/80 font-roboto"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full flex justify-center py-1.5 px-4 text-sm font-normal rounded-md bg-linear-to-r text-white hover:shadow-lg transition-all duration-200 cursor-pointer font-roboto"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 font-roboto">
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </div>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
