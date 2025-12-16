import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import { handleApiError } from "../src/utils/errorHandler";
import type { OrganizationWaterBalanceDaywiseReportResponse } from "../model/organiztion-water-balance.interface";

interface OrganizationState {
  organization: [];
  loading: boolean;
  error: string | null;
  status: number;
  message: string;
  success: boolean;
}

const initialState: OrganizationState = {
  organization: [],
  loading: false,
  error: null,
  status: 0,
  message: "",
  success: false,
};

export const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    setOrganization: (state, action) => {
      state.organization = action.payload;
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
});

interface GetOrganizationWaterBalanceDaywiseReportPayload {
  organization_id: number;
  year: number;
  month: number;
}
export const getOrganizationWaterBalanceDaywiseReport = createAsyncThunk(
  "organization/getOrganizationWaterBalanceDaywiseReport",
  async (
    {
      organization_id,
      year,
      month,
    }: GetOrganizationWaterBalanceDaywiseReportPayload,
    thunkAPI
  ) => {
    try {
      const response =
        await api().post<OrganizationWaterBalanceDaywiseReportResponse>(
          `/organization/organization-month-report`,
          {
            organization_id,
            year,
            month,
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
