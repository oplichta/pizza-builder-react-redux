import { ADD_INGREDIENT, ADD_PIZZA, REMOVE_INGREDIENT, SET_ACTIVE_PIZZA } from './actions';

const initialOrderState = {
    pizzas: [],
    activePizzaId: null,
    totalAmount: 0,
};

const PizzaSize = {
  Small: 'small',
  Medium: 'medium',
  Large: 'large',
};

const prices = {
  [PizzaSize.Small]: { base: 9.99, ingredients: 0.69 },
  [PizzaSize.Medium]: { base: 12.99, ingredients: 0.99 },
  [PizzaSize.Large]: { base: 16.99, ingredients: 1.29 },
};

const orderReducer = (state = initialOrderState, action) => {
    switch (action.type) {
        case SET_ACTIVE_PIZZA:
            return {
                ...state,
                activePizzaId: action.payload,
            };
        case ADD_PIZZA:
            return {
                ...state,
                pizzas: [...state.pizzas, action.payload],
            };
        case ADD_INGREDIENT:
            return {
                ...state,
                pizzas: state.pizzas.map((pizza) => {
                    if (pizza.id === state.activePizzaId) {
                        const newIngredients = [...pizza.ingredients, action.payload];
                        const totalAmount = newIngredients.reduce(
                            (acc, ingredient) => acc + prices[pizza.size].ingredients,
                            prices[pizza.size].base
                        );
                        return {
                            ...pizza,
                            ingredients: newIngredients,
                            price: totalAmount,
                        };
                    }
                    return pizza;
                }),
                totalAmount: state.pizzas.reduce(
                    (acc, pizza) => acc + pizza.price,
                    0
                ),
            };
        case REMOVE_INGREDIENT:
            return {
                ...state,
                pizzas: state.pizzas.map((pizza) => {
                    if (pizza.id === state.activePizzaId) {
                        const newIngredients = pizza.ingredients.filter(
                            (ingredient) => ingredient.id !== action.payload.ingredientId
                        );
                        const totalAmount = newIngredients.reduce(
                            (acc, ingredient) => acc + prices[pizza.size].ingredients,
                            prices[pizza.size].base
                        );
                        return {
                            ...pizza,
                            ingredients: newIngredients,
                            price: totalAmount,
                        };
                    }
                    return pizza;
                }),
                totalAmount: state.pizzas.reduce(
                    (acc, pizza) => acc + pizza.price,
                    0
                ), 
            };
        default:
            return state;
    }
};

export default orderReducer;
