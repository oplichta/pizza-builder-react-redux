import { describe, expect, it } from 'vitest';
import { selectIngredientsOfPizza } from './selectors';

describe('selectIngredientsOfPizza selector', () => {
  it('should return the ingredients from the state', () => {
    const state = {
      ingredients: [
        { id: 1, name: 'mozzarella' },
        { id: 2, name: 'basil' },
      ],
    };

    const expectedIngredients = [
      { id: 1, name: 'mozzarella' },
      { id: 2, name: 'basil' },
    ];

    expect(selectIngredientsOfPizza(state)).toEqual(expectedIngredients);
  });

  it('should return an empty array if there are no ingredients', () => {
    const state = {
      ingredients: [],
    };

    const expectedIngredients = [];

    expect(selectIngredientsOfPizza(state)).toEqual(expectedIngredients);
  });
});