import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import orderReducer from '../../redux/orderSlice';
import PizzaIngredients from './PizzaIngredients';

const buildState = (ingredients = []) => ({
    pizzas: [{ id: 0, size: 'small', name: 'Pizza', price: 0, quantity: 1, ingredients }],
    activePizzaId: 0,
    totalAmount: 0,
    orderDetails: null,
});

const renderWithStore = (preloadedState) => {
    const store = configureStore({ reducer: orderReducer, preloadedState });
    render(
        <Provider store={store}>
            <PizzaIngredients />
        </Provider>
    );
    return store;
};

describe('PizzaIngredients', () => {
    it('adds an ingredient to the active pizza when its checkbox is checked', () => {
        const store = renderWithStore(buildState());

        fireEvent.click(screen.getByRole('checkbox', { name: /mozzarella/i }));

        expect(store.getState().pizzas[0].ingredients).toEqual([expect.objectContaining({ name: 'mozzarella' })]);
        expect(screen.getByRole('checkbox', { name: /mozzarella/i })).toBeChecked();
    });

    it('removes an ingredient from the active pizza when its checkbox is unchecked', () => {
        const store = renderWithStore(buildState([{ id: 1, name: 'mozzarella', quantity: 1 }]));

        fireEvent.click(screen.getByRole('checkbox', { name: /mozzarella/i }));

        expect(store.getState().pizzas[0].ingredients).toEqual([]);
        expect(screen.getByRole('checkbox', { name: /mozzarella/i })).not.toBeChecked();
    });
});
