import React, { useEffect, useState } from "react";
import { useAppDispatch } from "../../store/store";
import { checkAuthStatus } from "../../store/usersSlice";

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initializeAuth = () => {
      try {
        dispatch(checkAuthStatus());
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();

    const tokenValidationInterval = setInterval(
      () => {
        dispatch(checkAuthStatus());
      },
      5 * 60 * 1000,
    );

    return () => {
      clearInterval(tokenValidationInterval);
    };
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthInitializer;
