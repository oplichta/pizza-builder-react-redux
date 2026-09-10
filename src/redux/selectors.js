// Shared reference so callers with no active pizza get a stable empty array
// instead of a new one on every call — react-redux's useSelector otherwise
// warns that the selector is "unstable" and re-renders on every store update.
const EMPTY_INGREDIENTS = [];

export const selectActivePizzaId = (state) => state.activePizzaId;
export const selectOrderPizzas = (state) => state.pizzas;
export const selectOrderTotalAmount = (state) => state.totalAmount;
export const selectOrderDetails = (state) => state.orderDetails;

export const selectActivePizza = (state) => {
    const activePizzaId = selectActivePizzaId(state);
    return selectOrderPizzas(state).find((pizza) => pizza.id === activePizzaId) ?? null;
};

export const selectIngredientsOfPizza = (state) => selectActivePizza(state)?.ingredients ?? EMPTY_INGREDIENTS;
export const selectSizeOfActivePizza = (state) => selectActivePizza(state)?.size ?? null;
