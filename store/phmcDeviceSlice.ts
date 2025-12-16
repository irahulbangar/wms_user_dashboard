import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type { PhmcDeviceResultItem } from "../model/phmc-device.interface";
import { handleApiError } from "../src/utils/errorHandler";

interface PhmcDeviceState {
  phmcDevices: PhmcDeviceResultItem[];
  loading: boolean;
  error: string | null;
  status: number;
  message: string;
  success: boolean;
}

const initialState: PhmcDeviceState = {
  phmcDevices: [],
  loading: false,
  error: null,
  status: 0,
  message: "",
  success: false,
};

export const phmcDeviceSlice = createSlice({
  name: "phmcDevice",
  initialState,
  reducers: {
    setPhmcDevices: (state, action) => {
      state.phmcDevices = action.payload;
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
    builder.addCase(getDevicePhmcLogs.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getDevicePhmcLogs.fulfilled, (state, action) => {
      state.loading = false;
      state.phmcDevices = action.payload.data;
      state.status = action.payload.status;
      state.message = action.payload.message;
      state.success = action.payload.success;
    });
    builder.addCase(getDevicePhmcLogs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || null;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getPhmcCustomReport.pending, (state) => {
      state.loading = true;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getPhmcCustomReport.fulfilled, (state, action) => {
      state.loading = false;
      state.phmcDevices = action.payload.data;
      state.status = action.payload.status;
      state.message = action.payload.message;
      state.success = action.payload.success;
    });
    builder.addCase(getPhmcCustomReport.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || null;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
  },
});

interface GetDevicePhmcLogsPayload {
  plantId: number;
  deviceId: number;
  date: string;
}

export const getDevicePhmcLogs = createAsyncThunk(
  "phmcDevice/getDevicePhmcLogs",
  async ({ plantId, deviceId, date }: GetDevicePhmcLogsPayload, thunkAPI) => {
    try {
      const response = await api().post(
        `/phmc/device/phmc-logs/${plantId}/${deviceId}`,
        {
          date,
        },
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

interface GetPhmcCustomReportPayload {
  plantId: number;
  deviceId: number;
  from_date: string;
  to_date: string;
  duration: string;
}

export const getPhmcCustomReport = createAsyncThunk(
  "phmcDevice/getPhmcCustomReport",
  async (
    {
      plantId,
      deviceId,
      from_date,
      to_date,
      duration,
    }: GetPhmcCustomReportPayload,
    thunkAPI
  ) => {
    try {
      const response = await api().post(
        `/phmc/device/phmc-reports/${plantId}/${deviceId}`,
        {
          from_date,
          to_date,
          duration,
        },
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

export const { setPhmcDevices, setLoading, setError, setStatus, setMessage, setSuccess } = phmcDeviceSlice.actions;

export default phmcDeviceSlice.reducer;
