import { nanoid } from 'nanoid'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { OrderState, Pizza, Ingredient, PizzaSizeValue, OrderDetails } from './types'



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

const calculatePizzaPrice = (pizza: Pizza) => {
    const basePrice = prices[pizza.size]?.base || 0;
    const ingredientsPrice = pizza.ingredients.reduce((sum, item) => sum + (prices[pizza.size]?.ingredients || 0) * item.quantity, 0);
    return basePrice + ingredientsPrice;
};

const calculateTotalAmount = (pizzas: Pizza[]) => pizzas.reduce((sum, pizza) => sum + pizza.price * pizza.quantity, 0);

const initialState: OrderState = {
    pizzas: [],
    activePizzaId: null,
    totalAmount: 0,
    orderDetails: null,
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        setActivePizza: (state: OrderState, action: PayloadAction<string | null>) => {
            state.activePizzaId = action.payload;
        },
        addPizza: {
            reducer: (state: OrderState, action: PayloadAction<Omit<Pizza, 'id'>>) => {
                const pizza = { ...action.payload, id: nanoid() };
                state.pizzas.push({ ...pizza, price: calculatePizzaPrice(pizza) });
                state.activePizzaId = pizza.id;
                state.totalAmount = calculateTotalAmount(state.pizzas);
            },
            // ID is generated here (not by the caller) so it can never collide with an
            // existing or previously-removed pizza's id.
            prepare: (pizza) => ({ payload: pizza }),
        },
        removePizza: (state: OrderState, action: PayloadAction<string>) => {
            const pizzaId = action.payload;
            state.pizzas = state.pizzas.filter((pizza) => pizza.id !== pizzaId);
            state.totalAmount = calculateTotalAmount(state.pizzas);
            if (state.activePizzaId === pizzaId) {
                state.activePizzaId = state.pizzas[0]?.id ?? null;
            }
        },
        addIngredient: (state: OrderState, action: PayloadAction<Ingredient>) => {
            const pizza = state.pizzas.find((pizza) => pizza.id === state.activePizzaId);
            if (!pizza) {
                return;
            }
            pizza.ingredients.push(action.payload);
            pizza.price = calculatePizzaPrice(pizza);
            state.totalAmount = calculateTotalAmount(state.pizzas);
        },
        removeIngredient: (state: OrderState, action: PayloadAction<number>) => {
            const pizza = state.pizzas.find((pizza) => pizza.id === state.activePizzaId);
            if (!pizza) {
                return;
            }
            pizza.ingredients = pizza.ingredients.filter((ingredient) => ingredient.id !== action.payload);
            pizza.price = calculatePizzaPrice(pizza);
            state.totalAmount = calculateTotalAmount(state.pizzas);
        },
        updatePizzaSize: (state: OrderState, action: PayloadAction<PizzaSizeValue>) => {
            const pizza = state.pizzas.find((pizza) => pizza.id === state.activePizzaId);
            if (!pizza) {
                return;
            }
            pizza.size = action.payload;
            pizza.price = calculatePizzaPrice(pizza);
            state.totalAmount = calculateTotalAmount(state.pizzas);
        },
        setOrderDetails: (state: OrderState, action: PayloadAction<OrderDetails | null>) => {
            state.orderDetails = action.payload;
        },
    },
});

export const { addPizza, removePizza, setActivePizza, addIngredient, removeIngredient, updatePizzaSize, setOrderDetails } =
    orderSlice.actions;
export default orderSlice.reducer;
