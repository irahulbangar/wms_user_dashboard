// redux toolkit store
import {
  configureStore,
  createListenerMiddleware,
} from "@reduxjs/toolkit/react";
import { useDispatch, useSelector } from "react-redux";
import rootReducer from "./rootReducers";

const listenerMiddlewareInstance = createListenerMiddleware({
  onError: () => console.error,
});

// Initialize store with authentication state from localStorage
const getInitialState = () => {
  try {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");

    if (token && user) {
      const userData = JSON.parse(user);
      return {
        user: {
          user: userData,
          token: token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
      };
    }
  } catch (error) {
    console.error("Error restoring auth state:", error);
    localStorage.clear();
  }

  return {};
};

const store = configureStore({
  reducer: rootReducer,
  preloadedState: getInitialState(),
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
        ignoredActionPaths: [],
        ignoredPaths: [
          "plant.plants",
          "device.devices",
          "system.systems",
          "department.departments",
        ],
        warnAfter: 128,
      },
    }).prepend(listenerMiddlewareInstance.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootStateType = ReturnType<typeof store.getState>;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootStateType) => T) =>
  useSelector<RootStateType, T>(selector);

export default store;
