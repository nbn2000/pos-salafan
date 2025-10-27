import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer, { logout } from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import cartReducer from './slices/cartSlice';
import { baseApi } from '@/api';

const appReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  cart: cartReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

// 💥 Logout bo'lganda butun state'ni reset qilish uchun
const rootReducer = (state: any, action: any) => {
  if (action.type === logout.type) {
    // Bu faqat memory state uchun emas, persist uchun ham
    storage.removeItem('persist:root'); // 🧨 Shart emas, faqat precaution
    return appReducer(undefined, action); // <- state ni reset qil
  }
  return appReducer(state, action);
};

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'ui', 'cart'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      baseApi.middleware
    ),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
