import { configureStore } from '@reduxjs/toolkit';
import orderReducer from './orderSlice';

const store = configureStore({
   reducer: orderReducer,
});

export default store;
