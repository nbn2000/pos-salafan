import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  shrink: boolean;
}

const initialState: UIState = {
  shrink: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleShrink: (state) => {
      state.shrink = !state.shrink;
    },
    setShrink: (state, action: PayloadAction<boolean>) => {
      state.shrink = action.payload;
    },
  },
});

export const { setShrink, toggleShrink } = uiSlice.actions;
export default uiSlice.reducer;
