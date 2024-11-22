import { configureStore } from '@reduxjs/toolkit';
import orderReducer from './reducers';

const store = configureStore({
   reducer: orderReducer,
});

export default store;
