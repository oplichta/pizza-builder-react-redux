export const selectActivePizzaId = (state) => state.activePizzaId;
export const selectOrderPizzas = (state) => state.pizzas;
export const selectIngredientsOfPizza = (state) => {
    const activePizzaId = selectActivePizzaId(state);
    const activePizza = state.pizzas.find(pizza => pizza.id === activePizzaId);
    return activePizza ? activePizza.ingredients : [];
  };
