import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type { BdwfmsDeviceResultItem } from "../model/bdwfms-device.interface";
import { handleApiError } from "../src/utils/errorHandler";

interface BdwfmsDeviceState {
  bdwfmsDevices: BdwfmsDeviceResultItem[];
  loading: boolean;
  error: string | null;
  status: number;
  message: string;
  success: boolean;
}

const initialState: BdwfmsDeviceState = {
  bdwfmsDevices: [],
  loading: false,
  error: null,
  status: 0,
  message: "",
  success: false,
};

export const bdwfmsDeviceSlice = createSlice({
  name: "bdwfmsDevice",
  initialState,
  reducers: {
    setBdwfmsDevices: (state, action) => {
      state.bdwfmsDevices = action.payload;
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
    builder.addCase(getDeviceBdwfmsLogs.pending, (state) => {
      state.loading = true;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getDeviceBdwfmsLogs.fulfilled, (state, action) => {
      state.loading = false;
      state.bdwfmsDevices = action.payload.data;
      state.status = action.payload.status;
      state.message = action.payload.message;
      state.success = action.payload.success;
    });
    builder.addCase(getDeviceBdwfmsLogs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || null;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getBdwfmsCustomReport.pending, (state) => {
      state.loading = true;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getBdwfmsCustomReport.fulfilled, (state, action) => {
      state.loading = false;
      state.bdwfmsDevices = action.payload.data;
      state.status = action.payload.status;
      state.message = action.payload.message;
      state.success = action.payload.success;
    });
    builder.addCase(getBdwfmsCustomReport.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || null;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
  },
});

interface GetDeviceBdwfmsLogsPayload {
  plantId: number;
  deviceId: number;
  date: string;
}

export const getDeviceBdwfmsLogs = createAsyncThunk(
  "bdwfmsDevice/getDeviceBdwfmsLogs",
  async ({ plantId, deviceId, date }: GetDeviceBdwfmsLogsPayload, thunkAPI) => {
    try {
      const response = await api().post(
        `/bdwfms/device/bdwfms-logs/${plantId}/${deviceId}`,
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

interface GetBdwfmsCustomReportPayload {
  plantId: number;
  deviceId: number;
  from_date: string;
  to_date: string;
  duration: string;
}

export const getBdwfmsCustomReport = createAsyncThunk(
  "bdwfmsDevice/getBdwfmsCustomReport",
  async (
    {
      plantId,
      deviceId,
      from_date,
      to_date,
      duration,
    }: GetBdwfmsCustomReportPayload,
    thunkAPI
  ) => {
    try {
      const response = await api().post(
        `/bdwfms/device/bdwfms-reports/${plantId}/${deviceId}`,
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
  setBdwfmsDevices,
  setLoading,
  setError,
  setStatus,
  setMessage,
  setSuccess,
} = bdwfmsDeviceSlice.actions;

export default bdwfmsDeviceSlice.reducer;
