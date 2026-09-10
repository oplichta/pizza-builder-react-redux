import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import orderReducer from '../../redux/orderSlice';
import PizzaSize from './PizzaSize';

const buildState = (size) => ({
    pizzas: [{ id: 0, size, name: 'Pizza', price: 0, quantity: 1, ingredients: [] }],
    activePizzaId: 0,
    totalAmount: 0,
    orderDetails: null,
});

const renderWithStore = (preloadedState) => {
    const store = configureStore({ reducer: orderReducer, preloadedState });
    render(
        <Provider store={store}>
            <PizzaSize />
        </Provider>
    );
    return store;
};

describe('PizzaSize', () => {
    // Regression test: the size used to live in local useState and started at null,
    // so a pizza already priced as "small" in Redux rendered with no radio selected.
    it('reflects the active pizza size already stored in Redux on first render', () => {
        renderWithStore(buildState('large'));

        expect(screen.getByRole('radio', { name: /large/i })).toBeChecked();
        expect(screen.getByRole('radio', { name: /small/i })).not.toBeChecked();
    });

    it('updates the store when a different size is selected', () => {
        const store = renderWithStore(buildState('small'));

        fireEvent.click(screen.getByRole('radio', { name: /medium/i }));

        expect(store.getState().pizzas[0].size).toBe('medium');
    });
});
