import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import { handleApiError } from "../src/utils/errorHandler";
import type { SystemResponse, SystemResult } from "../model/system.interface";
import type { SystemWaterBalanceDaywiseReportResponse } from "../model/system-water-balance.interface";

interface SystemState {
  systems: SystemResult[];
  loading: boolean;
  error: string | null;
  status: number;
  message: string;
  success: boolean;
}

const initialState: SystemState = {
  systems: [],
  loading: false,
  error: null,
  status: 0,
  message: "",
  success: false,
};

export const systemSlice = createSlice({
  name: "system",
  initialState,
  reducers: {
    setSystems: (state, action) => {
      state.systems = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setMessage: (state, action) => {
      state.message = action.payload;
    },
    setSuccess: (state, action) => {
      state.success = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getSystemsByPlantId.pending, (state) => {
      state.loading = true;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getSystemsByPlantId.fulfilled, (state, action) => {
      state.loading = false;
      state.systems = action.payload.data;
      state.status = 0;
      state.message = action.payload.message;
      state.success = action.payload.success;
    });
    builder.addCase(getSystemsByPlantId.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || null;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
  },
});

export const getSystemsByPlantId = createAsyncThunk(
  "system/getSystemsByPlantId",
  async (plantId: number, thunkAPI) => {
    try {
      const response = await api().get<SystemResponse>(
        `/system/user/system-plant/${plantId}`,
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

interface GetSystemWaterBalanceDaywiseReportPayload {
  system_id: number;
  year: number;
  month: string;
}
export const getSystemWaterBalanceDaywiseReport = createAsyncThunk(
  "system/getSystemWaterBalanceDaywiseReport",
  async (
    { system_id, year, month }: GetSystemWaterBalanceDaywiseReportPayload,
    thunkAPI
  ) => {
    try {
      const response =
        await api().post<SystemWaterBalanceDaywiseReportResponse>(
          `/system/system-month-report`,
          { system_id, year, month },
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

export const {
  setSystems,
  setLoading,
  setError,
  setStatus,
  setMessage,
  setSuccess,
} = systemSlice.actions;

export default systemSlice.reducer;
