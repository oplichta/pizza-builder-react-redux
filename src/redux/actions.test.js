import { ADD_INGREDIENT, addIngredient } from './actions';
import { describe, it, expect } from 'vitest';

describe('addIngredient action', () => {
  it('should create an action to add an ingredient', () => {
    const ingredient = 'mozzarella';
    const expectedAction = {
      type: ADD_INGREDIENT,
      payload: ingredient,
    };

    expect(addIngredient(ingredient)).toEqual(expectedAction);
  });
});