// /src/store/tenureSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  filter: {
    selectedTypes: [],
    currentHover: null,
    attributes: null,
    timeRange: [1900, new Date().getFullYear()]
  },
  statistics: {
    tribal: 0,
    state: 0,
    freehold: 0,
    customary: 0
  },
  loading: false,
  error: null
};

const tenureSlice = createSlice({
  name: 'tenure',
  initialState,
  reducers: {
    updateTenureFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    setTenureTypes: (state, action) => {
      state.filter.selectedTypes = action.payload;
    },
    updateStatistics: (state, action) => {
      state.statistics = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetTenureFilter: (state) => {
      state.filter = initialState.filter;
    }
  }
});

// Thunk for loading tenure statistics
export const fetchTenureStatistics = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    // In a real app, this would be an API call
    const mockStats = {
      tribal: 48,
      state: 23,
      freehold: 6,
      customary: 23 // Customary rights on tribal land
    };
    dispatch(updateStatistics(mockStats));
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const { 
  updateTenureFilter,
  setTenureTypes,
  updateStatistics,
  setLoading,
  setError,
  resetTenureFilter
} = tenureSlice.actions;

export const selectTenureFilter = (state) => state.tenure.filter;
export const selectTenureStats = (state) => state.tenure.statistics;
export const selectTenureLoading = (state) => state.tenure.loading;

export default tenureSlice.reducer;