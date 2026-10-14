import { addIngredient, removeIngredient } from '../../redux/orderSlice';
import { selectIngredientsOfPizza } from '../../redux/selectors';
import './PizzaIngredients.scss';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';

const ingredientsList = [
  'anchovy', 'bacon', 'basil', 'chili', 'mozzarella', 'mushroom',
  'olive', 'onion', 'pepper', 'pepperoni', 'sweetcorn', 'tomato',
] as const;

const PizzaIngredients = () => {
  const ingredients = useAppSelector(selectIngredientsOfPizza);
  const dispatch = useAppDispatch();

  const updateIngredient = (ingredient: (typeof ingredientsList)[number]) => {
    const existing = ingredients.find((x) => x.name === ingredient);
    if (existing) {
      dispatch(removeIngredient(existing.id));
    } else {
      const nextId = ingredients.reduce((max, ing) => Math.max(max, ing.id), 0) + 1;
      dispatch(addIngredient({ id: nextId, name: ingredient, quantity: 1 }));
    }
  };

  const hasIngredient = (ingredient: string): boolean =>
    ingredients.some((x) => x.name === ingredient);

  return (
    <div>
      <h2>Pizza Ingredients</h2>
      <div className="pizza-ingredients">
        {ingredientsList.map((ingredient) => (
          <label
            key={ingredient}
            className={`pizza-ingredient ${hasIngredient(ingredient) ? 'pizza-ingredient--active' : ''}`}
          >
            <input
              type="checkbox"
              name={ingredient}
              value={ingredient}
              checked={hasIngredient(ingredient)}
              onChange={() => updateIngredient(ingredient)}
            />
            <span className={`pizza-ingredient__icon pizza-ingredient__icon--${ingredient}`} />
            {ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}
          </label>
        ))}
      </div>
    </div>
  );
};

export default PizzaIngredients;
