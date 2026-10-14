import { describe, expect, it } from 'vitest';
import { selectIngredientsOfPizza, selectSizeOfActivePizza } from './selectors';
import type { RootState } from './store';
import type { Pizza, Ingredient } from './types';

const makeState = (partial: Partial<RootState>): RootState => partial as RootState;

const makePizza = (overrides: Partial<Pizza> = {}): Pizza => ({
    id: 'pizza-1',
    size: 'small',
    name: 'Test Pizza',
    price: 0,
    quantity: 1,
    ingredients: [],
    ...overrides,
});

const makeIngredient = (overrides: Partial<Ingredient> = {}): Ingredient => ({
    id: 1,
    name: 'mozzarella',
    quantity: 1,
    ...overrides,
});

describe('selectIngredientsOfPizza selector', () => {
    it('should return the ingredients from the state', () => {
        const state = makeState({
            activePizzaId: 'pizza-1',
            pizzas: [
                {
                    ...makePizza({ id: 'pizza-1' }),
                    ingredients: [makeIngredient({ id: 1, name: 'mozzarella' }), makeIngredient({ id: 2, name: 'basil' })],
                },
            ],
        });

        expect(selectIngredientsOfPizza(state)).toEqual([
            { id: 1, name: 'mozzarella', quantity: 1 },
            { id: 2, name: 'basil', quantity: 1 },
        ]);
    });

    it('should return an empty array if the active pizza does not exist', () => {
        const state = makeState({
            activePizzaId: 'pizza-999',
            pizzas: [
                {
                    ...makePizza({ id: 'pizza-1' }),
                    ingredients: [makeIngredient({ id: 1, name: 'mozzarella' }), makeIngredient({ id: 2, name: 'basil' })],
                },
            ],
        });

        expect(selectIngredientsOfPizza(state)).toEqual([]);
    });

    it('should return an empty array if there are no ingredients', () => {
        const state = makeState({
            pizzas: [makePizza({ id: 'pizza-1', ingredients: [] })],
        });

        expect(selectIngredientsOfPizza(state)).toEqual([]);
    });
});

describe('selectSizeOfActivePizza selector', () => {
    it('should return the size of the active pizza', () => {
        const state = makeState({
            activePizzaId: 'pizza-1',
            pizzas: [makePizza({ id: 'pizza-1', size: 'large' })],
        });

        expect(selectSizeOfActivePizza(state)).toBe('large');
    });

    it('should return null if the active pizza does not exist', () => {
        const state = makeState({
            activePizzaId: 'pizza-999',
            pizzas: [makePizza({ id: 'pizza-1', size: 'large' })],
        });

        expect(selectSizeOfActivePizza(state)).toBeNull();
    });
});
