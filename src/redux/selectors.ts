import type { Pizza, PizzaSizeValue, OrderDetails, Ingredient } from './types';
import type { RootState } from './store';

// Shared reference so callers with no active pizza get a stable empty array
// instead of a new one on every call — react-redux's useSelector otherwise
// warns that the selector is "unstable" and re-renders on every store update.
const EMPTY_INGREDIENTS: Ingredient[] = [];

export const selectActivePizzaId = (state: RootState): string | null => state.activePizzaId;

export const selectOrderPizzas = (state: RootState): Pizza[] => state.pizzas;

export const selectOrderTotalAmount = (state: RootState): number => state.totalAmount;

export const selectOrderDetails = (state: RootState): OrderDetails | null => state.orderDetails;

export const selectActivePizza = (state: RootState): Pizza | null => {
    const activePizzaId = selectActivePizzaId(state);
    return selectOrderPizzas(state).find((pizza) => pizza.id === activePizzaId) ?? null;
};

export const selectIngredientsOfPizza = (state: RootState): Pizza['ingredients'] =>
    selectActivePizza(state)?.ingredients ?? EMPTY_INGREDIENTS;

export const selectSizeOfActivePizza = (state: RootState): PizzaSizeValue | null =>
    selectActivePizza(state)?.size ?? null;
