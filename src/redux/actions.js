export const ADD_PIZZA = 'ADD_PIZZA';
export const SET_ACTIVE_PIZZA = 'SET_ACTIVE_PIZZA';
export const ADD_INGREDIENT = 'ADD_INGREDIENT';
export const REMOVE_INGREDIENT = 'REMOVE_INGREDIENT';
export const UPDATE_PIZZA_SIZE = 'UPDATE_PIZZA_SIZE';

export const addPizza = (pizza) => ({
    type: ADD_PIZZA,
    payload: pizza,
});
export const setActivePizza = (pizzaId) => ({
    type: SET_ACTIVE_PIZZA,
    payload: pizzaId,
});

export const addIngredient = (ingredient) => ({
    type: ADD_INGREDIENT,
    payload: ingredient,
});

export const removeIngredient = (ingredientId) => ({
    type: REMOVE_INGREDIENT,
    payload: { ingredientId },
});

export const updatePizzaSize = (size) => ({
    type: UPDATE_PIZZA_SIZE,
    payload: size,
});
