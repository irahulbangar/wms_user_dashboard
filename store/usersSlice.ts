import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import { jwtDecode } from "jwt-decode";
import type { ClientUsersResponse, PlantsList } from "../model/users.interface";
import type { UsersPlantIdResponse } from "../model/users-plantId.interface";
import { handleApiError } from "../src/utils/errorHandler";

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

interface LoginResponse {
  success: boolean;
  token: string;
  user: UserPayload;
  message: string;
  status: number;
}

interface AdminState {
  user: UserPayload | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.clear();
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    checkAuthStatus: (state) => {
      try {
        const token = localStorage.getItem("accessToken");
        const user = localStorage.getItem("user");

        if (token && user) {
          const decodedToken = jwtDecode<{ exp: number }>(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp && decodedToken.exp < currentTime) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.clear();
            window.location.reload();
          } else {
            state.user = JSON.parse(user);
            state.token = token;
            state.isAuthenticated = true;
          }
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.clear();
        localStorage.clear();
      }
    },
  },
});

export interface LoginPayload {
  client_email: string;
  client_password: string;
}

export const loginUser = createAsyncThunk(
  "clients/login",
  async (data: LoginPayload, thunkAPI) => {
    try {
      thunkAPI.dispatch(setLoading(true));
      const response = await api().post<LoginResponse>("/clients/login", data);
      if (response.data.success || response.data.status === 200) {
        const decodedToken = jwtDecode<UserPayload>(response.data.token);

        if (
          decodedToken.status === "Inactive" ||
          decodedToken.status === "inactive"
        ) {
          return thunkAPI.rejectWithValue(
            "Access denied. Your account is inactive. Please contact your administrator."
          );
        }

        if (!decodedToken.plantsList || decodedToken.plantsList.length === 0) {
          return thunkAPI.rejectWithValue(
            "Access denied. Please contact your administrator."
          );
        }

        localStorage.setItem("LAST_LOGIN", new Date().toLocaleString());
        localStorage.setItem("accessToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(decodedToken));
        localStorage.setItem(
          "organizationId",
          decodedToken.organization_id.toString()
        );
        thunkAPI.dispatch(setUser(decodedToken));
        thunkAPI.dispatch(setToken(response.data.token));
      }
      return response.data;
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
    } finally {
      thunkAPI.dispatch(setLoading(false));
    }
  }
);

// Get all users by plant id
export const getAllUsersByPlantId = createAsyncThunk(
  "clients/getAllUsersByPlantId",
  async (plantId: number, thunkAPI) => {
    try {
      const response = await api().get<UsersPlantIdResponse>(
        `/clients/all-clients/${plantId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
    }
  }
);

export interface AddUserPayload {
  client_email: string;
  client_name: string;
  client_phone: string;
  client_password: string;
  status: string;
  organization_id: number;
  plant_id: number;
}

export interface UpdateUserPayload extends AddUserPayload {
  client_id: number;
}

// add user
export const addUser = createAsyncThunk(
  "clients/addUser",
  async (payload: AddUserPayload, thunkAPI) => {
    try {
      const response = await api().post<ClientUsersResponse>(
        "/clients/register-client",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
    }
  }
);

// update user
export const updateUser = createAsyncThunk(
  "clients/updateUser",
  async (payload: UpdateUserPayload, thunkAPI) => {
    try {
      const response = await api().put<ClientUsersResponse>(
        `/clients/update-client/${payload.client_id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
    }
  }
);

// get subdomain
export const getSubdomain = createAsyncThunk(
  "organization/getSubdomain",
  async (_, thunkAPI) => {
    try {
      const response = await api().get("/organization/welcome");
      return response.data;
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
    }
  }
);

export const { setUser, setToken, logout, setLoading, checkAuthStatus } =
  usersSlice.actions;

export default usersSlice.reducer;
