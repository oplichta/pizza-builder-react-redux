import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Use throughout your app instead of standard useDispatch and useSelector
export const useAppDispatch = useDispatch as unknown as () => AppDispatch;
export const useAppSelector = useSelector as <TResult>(selector: (state: RootState) => TResult, equals?: (a: TResult, b: TResult) => boolean) => TResult;
