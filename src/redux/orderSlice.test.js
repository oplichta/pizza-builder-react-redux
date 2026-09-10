import { describe, it, expect } from 'vitest';
import orderReducer, {
    addIngredient,
    addPizza,
    removeIngredient,
    removePizza,
    setActivePizza,
    setOrderDetails,
    updatePizzaSize,
} from './orderSlice';

const initialState = {
    pizzas: [],
    activePizzaId: null,
    totalAmount: 0,
    orderDetails: null,
};

const buildPizza = (overrides = {}) => ({
    size: 'small',
    name: 'Pizza',
    price: 0,
    quantity: 1,
    ingredients: [],
    ...overrides,
});

describe('orderSlice reducer', () => {
    it('adds a pizza, prices it from its size and makes it the active pizza', () => {
        const state = orderReducer(initialState, addPizza(buildPizza()));

        expect(state.pizzas).toHaveLength(1);
        expect(state.pizzas[0].price).toBeCloseTo(9.99, 2);
        expect(state.totalAmount).toBeCloseTo(9.99, 2);
        expect(state.activePizzaId).toBe(state.pizzas[0].id);
    });

    it('generates a fresh id for every pizza, even after earlier ones were removed', () => {
        let state = orderReducer(initialState, addPizza(buildPizza()));
        const firstId = state.pizzas[0].id;
        state = orderReducer(state, removePizza(firstId));
        state = orderReducer(state, addPizza(buildPizza()));

        expect(state.pizzas[0].id).not.toBe(firstId);
    });

    it('ignores an addPizza action whose id already exists in state', () => {
        // The public addPizza() action creator always generates a fresh id via its
        // prepare callback, so a collision can only be simulated by dispatching a raw
        // action directly — this is what the reducer's own defensive check guards against.
        const pizza = { ...buildPizza(), id: 'fixed-id' };
        const stateWithPizza = orderReducer(initialState, { type: addPizza.type, payload: pizza });
        const state = orderReducer(stateWithPizza, { type: addPizza.type, payload: { ...pizza, size: 'large' } });

        expect(state.pizzas).toHaveLength(1);
        expect(state.pizzas[0].size).toBe('small');
    });

    it('sums prices of multiple pizzas into totalAmount', () => {
        let state = orderReducer(initialState, addPizza(buildPizza({ size: 'small' })));
        state = orderReducer(state, addPizza(buildPizza({ size: 'medium' })));

        expect(state.totalAmount).toBeCloseTo(9.99 + 12.99, 2);
    });

    it('sets the active pizza id', () => {
        const state = orderReducer(initialState, setActivePizza(3));
        expect(state.activePizzaId).toBe(3);
    });

    it('removes a pizza and recalculates totalAmount', () => {
        let state = orderReducer(initialState, addPizza(buildPizza({ size: 'small' })));
        const pizzaId = state.pizzas[0].id;

        state = orderReducer(state, removePizza(pizzaId));

        expect(state.pizzas).toHaveLength(0);
        expect(state.totalAmount).toBe(0);
    });

    it('clears the active pizza id when the only pizza is removed', () => {
        let state = orderReducer(initialState, addPizza(buildPizza()));
        const pizzaId = state.pizzas[0].id;

        state = orderReducer(state, removePizza(pizzaId));

        expect(state.activePizzaId).toBeNull();
    });

    it('falls back to another existing pizza as active when the active one is removed', () => {
        let state = orderReducer(initialState, addPizza(buildPizza({ size: 'small' })));
        const firstId = state.pizzas[0].id;
        // addPizza always activates the newest pizza, so the second one is now active.
        state = orderReducer(state, addPizza(buildPizza({ size: 'medium' })));
        const secondId = state.pizzas[1].id;

        state = orderReducer(state, removePizza(secondId));

        expect(state.activePizzaId).toBe(firstId);
    });

    it('leaves the active pizza id untouched when removing a different pizza', () => {
        let state = orderReducer(initialState, addPizza(buildPizza({ size: 'small' })));
        const firstId = state.pizzas[0].id;
        state = orderReducer(state, addPizza(buildPizza({ size: 'medium' })));
        const secondId = state.pizzas[1].id;

        state = orderReducer(state, removePizza(firstId));

        expect(state.activePizzaId).toBe(secondId);
        expect(state.pizzas).toHaveLength(1);
    });

    it('adds an ingredient to the active pizza and recalculates its price', () => {
        // addPizza() already activates the pizza it creates.
        let state = orderReducer(initialState, addPizza(buildPizza()));
        state = orderReducer(state, addIngredient({ id: 1, name: 'mozzarella', quantity: 1 }));

        expect(state.pizzas[0].ingredients).toEqual([{ id: 1, name: 'mozzarella', quantity: 1 }]);
        expect(state.pizzas[0].price).toBeCloseTo(9.99 + 0.69, 2);
        expect(state.totalAmount).toBeCloseTo(9.99 + 0.69, 2);
    });

    it('does nothing when adding an ingredient with no matching active pizza', () => {
        const state = orderReducer(initialState, addIngredient({ id: 1, name: 'mozzarella', quantity: 1 }));
        expect(state).toEqual(initialState);
    });

    it('removes an ingredient from the active pizza and recalculates its price', () => {
        let state = orderReducer(initialState, addPizza(buildPizza()));
        state = orderReducer(state, addIngredient({ id: 1, name: 'mozzarella', quantity: 1 }));
        state = orderReducer(state, addIngredient({ id: 2, name: 'basil', quantity: 1 }));

        state = orderReducer(state, removeIngredient(1));

        expect(state.pizzas[0].ingredients).toEqual([{ id: 2, name: 'basil', quantity: 1 }]);
        expect(state.pizzas[0].price).toBeCloseTo(9.99 + 0.69, 2);
    });

    it('updates the size of the active pizza and reprices it per the new size', () => {
        let state = orderReducer(initialState, addPizza(buildPizza({ size: 'small' })));

        state = orderReducer(state, updatePizzaSize('large'));

        expect(state.pizzas[0].size).toBe('large');
        expect(state.pizzas[0].price).toBeCloseTo(16.99, 2);
        expect(state.totalAmount).toBeCloseTo(16.99, 2);
    });

    it('stores order details', () => {
        const details = { name: 'Jan Kowalski', email: 'jan@example.com' };
        const state = orderReducer(initialState, setOrderDetails(details));
        expect(state.orderDetails).toEqual(details);
    });
});
