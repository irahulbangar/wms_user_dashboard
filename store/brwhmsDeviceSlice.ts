import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type { BrwhmsDeviceResultItem } from "../model/brwhms-device.interface";
import { handleApiError } from "../src/utils/errorHandler";

interface BrwhmsDeviceState {
  brwhmsDevices: BrwhmsDeviceResultItem[];
  loading: boolean;
  error: string | null;
  status: number;
  message: string;
  success: boolean;
}

const initialState: BrwhmsDeviceState = {
  brwhmsDevices: [],
  loading: false,
  error: null,
  status: 0,
  message: "",
  success: false,
};

export const brwhmsDeviceSlice = createSlice({
  name: "brwhmsDevice",
  initialState,
  reducers: {
    setBrwhmsDevices: (state, action) => {
      state.brwhmsDevices = action.payload;
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
    builder.addCase(getDeviceBrwhmsLogs.pending, (state) => {
      state.loading = true;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getDeviceBrwhmsLogs.fulfilled, (state, action) => {
      state.loading = false;
      state.brwhmsDevices = action.payload.data;
      state.status = action.payload.status;
      state.message = action.payload.message;
      state.success = action.payload.success;
    });
    builder.addCase(getDeviceBrwhmsLogs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || null;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getBrwhmsCustomReport.pending, (state) => {
      state.loading = true;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getBrwhmsCustomReport.fulfilled, (state, action) => {
      state.loading = false;
      state.brwhmsDevices = action.payload.data;
      state.status = action.payload.status;
      state.message = action.payload.message;
      state.success = action.payload.success;
    });
    builder.addCase(getBrwhmsCustomReport.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || null;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
  },
});

interface GetDeviceBrwhmsLogsPayload {
  plantId: number;
  deviceId: number;
  date: string;
}

export const getDeviceBrwhmsLogs = createAsyncThunk(
  "brwhmsDevice/getDeviceBrwhmsLogs",
  async ({ plantId, deviceId, date }: GetDeviceBrwhmsLogsPayload, thunkAPI) => {
    try {
      const response = await api().post(
        `/brwhms/device/brwhms-logs/${plantId}/${deviceId}`,
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

interface GetBrwhmsCustomReportPayload {
  plantId: number;
  deviceId: number;
  from_date: string;
  to_date: string;
  duration: string;
}

export const getBrwhmsCustomReport = createAsyncThunk(
  "brwhmsDevice/getBrwhmsCustomReport",
  async (
    {
      plantId,
      deviceId,
      from_date,
      to_date,
      duration,
    }: GetBrwhmsCustomReportPayload,
    thunkAPI
  ) => {
    try {
      const response = await api().post(
        `/brwhms/device/brwhms-reports/${plantId}/${deviceId}`,
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

export const {
  setBrwhmsDevices,
  setLoading,
  setError,
  setStatus,
  setMessage,
  setSuccess,
} = brwhmsDeviceSlice.actions;

export default brwhmsDeviceSlice.reducer;
