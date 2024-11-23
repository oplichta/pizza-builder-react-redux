import { describe, expect, it } from 'vitest';
import { selectIngredientsOfPizza } from './selectors';

describe('selectIngredientsOfPizza selector', () => {
    it('should return the ingredients from the state', () => {
      const state = {
        activePizzaId: 0,
        pizzas: [
          {
            id: 0,
            ingredients: [
              { id: 1, name: 'mozzarella' },
              { id: 2, name: 'basil' },
            ],
          },
        ],
      };

      const expectedIngredients = [
        { id: 1, name: 'mozzarella' },
        { id: 2, name: 'basil' },
      ];

        expect(selectIngredientsOfPizza(state)).toEqual(expectedIngredients);
    });

    it('should return an empty array if the active pizza does not exist', () => {
      const state = {
        activePizzaId: 1,
        pizzas: [
          {
            id: 0,
            ingredients: [
              { id: 1, name: 'mozzarella' },
              { id: 2, name: 'basil' },
            ],
          },
        ],
      };
  
      const expectedIngredients = [];
  
      expect(selectIngredientsOfPizza(state)).toEqual(expectedIngredients);
    });

    it('should return an empty array if there are no ingredients', () => {
        const state = {
            pizzas: [
                {
                    id: 0,
                    ingredients: [],
                },
            ],
        };

        const expectedIngredients = [];

        expect(selectIngredientsOfPizza(state)).toEqual(expectedIngredients);
    });
});
