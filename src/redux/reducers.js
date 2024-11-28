import { ADD_INGREDIENT, ADD_PIZZA, REMOVE_INGREDIENT, SET_ACTIVE_PIZZA, UPDATE_PIZZA_SIZE } from './actions';

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

const calculatePizzaPrice = (pizza) => {
    const basePrice = prices[pizza.size]?.base || 0;
    const ingredientsPrice = pizza.ingredients.reduce((sum, item) => sum + (prices[pizza.size]?.ingredients || 0) * item.quantity, 0);
    return basePrice + ingredientsPrice;
};

const calculateTotalAmount = (pizzas) => pizzas.reduce((sum, pizza) => sum + pizza.price * pizza.quantity, 0);

const orderReducer = (state = initialOrderState, action) => {
    switch (action.type) {
        case SET_ACTIVE_PIZZA:
            return {
                ...state,
                activePizzaId: action.payload,
            };
        case ADD_PIZZA: {
            const pizzaPrice = calculatePizzaPrice(action.payload);
            const updatedPizza = { ...action.payload, price: pizzaPrice };
            const updatedPizzas = [...state.pizzas, updatedPizza];
            const updatedTotalAmount = calculateTotalAmount(updatedPizzas);
            return {
                ...state,
                pizzas: updatedPizzas,
                totalAmount: updatedTotalAmount,
            };
        }
        case ADD_INGREDIENT: {
            const updatedPizzas = state.pizzas.map((pizza) => {
                if (pizza.id === state.activePizzaId) {
                    const updatedIngredients = [...pizza.ingredients, action.payload];
                    const updatedPizza = {
                        ...pizza,
                        ingredients: updatedIngredients,
                        price: calculatePizzaPrice({ ...pizza, ingredients: updatedIngredients }),
                    };
                    return updatedPizza;
                }
                return pizza;
            });
            const updatedTotalAmount = calculateTotalAmount(updatedPizzas);
            return {
                ...state,
                pizzas: updatedPizzas,
                totalAmount: updatedTotalAmount,
            };
        }
        case REMOVE_INGREDIENT: {
            const updatedPizzas = state.pizzas.map((pizza) => {
                if (pizza.id === state.activePizzaId) {
                    const updatedIngredients = pizza.ingredients.filter((ingredient) => ingredient.id !== action.payload.ingredientId);
                    const updatedPizza = {
                        ...pizza,
                        ingredients: updatedIngredients,
                        price: calculatePizzaPrice({ ...pizza, ingredients: updatedIngredients }),
                    };
                    return updatedPizza;
                }
                return pizza;
            });
            const updatedTotalAmount = calculateTotalAmount(updatedPizzas);
            return {
                ...state,
                pizzas: updatedPizzas,
                totalAmount: updatedTotalAmount,
            };
        }
        case UPDATE_PIZZA_SIZE: {
            const updatedPizzas = state.pizzas.map((pizza) => {
                if (pizza.id === state.activePizzaId) {
                    const updatedPizza = {
                        ...pizza,
                        size: action.payload,
                        price: calculatePizzaPrice({ ...pizza, size: action.payload }),
                    };
                    return updatedPizza;
                }
                return pizza;
            });
            const updatedTotalAmount = calculateTotalAmount(updatedPizzas);
            return {
                ...state,
                pizzas: updatedPizzas,
                totalAmount: updatedTotalAmount,
            };
        }

        default:
            return state;
    }
};

export default orderReducer;
