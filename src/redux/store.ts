import { configureStore } from '@reduxjs/toolkit';
import orderReducer from './orderSlice';

const store = configureStore({
   reducer: orderReducer,
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
