import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  parcels: [],
  stats: {},
  loading: false,
  error: null
};

const landSlice = createSlice({
  name: 'land',
  initialState,
  reducers: {
    setLandData: (state, action) => {
      state.parcels = action.payload;
    },
    setLandStats: (state, action) => {
      state.stats = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetLandState: () => initialState
  }
});

export const {
  setLandData,
  setLandStats,
  setLoading,
  setError,
  resetLandState
} = landSlice.actions;

export default landSlice.reducer;