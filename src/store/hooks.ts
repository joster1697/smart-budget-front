import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./index";

// Hooks tipados para usar en lugar de useDispatch/useSelector directamente
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);
