import { useSelector, useDispatch } from "react-redux";
import { addIngredient, removeIngredient } from "../../redux/actions";
import { selectIngredientsOfPizza } from "../../redux/selectors";
import "./PizzaIngredients.scss";

const PizzaIngredients = () => {
  const ingredientsList = [
    "anchovy",
    "bacon",
    "basil",
    "chili",
    "mozzarella",
    "mushroom",
    "olive",
    "onion",
    "pepper",
    "pepperoni",
    "sweetcorn",
    "tomato",
  ];

  const ingredients = useSelector((state) => selectIngredientsOfPizza(state));
  const dispatch = useDispatch();

  const updateIngredient = (ingredient) => {
    const existingIngredient = ingredients.find((x) => x.name === ingredient);
    if (existingIngredient) {
      dispatch(removeIngredient(existingIngredient.id));
    } else {
      const ingredientId = ingredients.length + 1;
      const ingredientObj = {
        id: ingredientId,
        name: ingredient,
        quantity: 1,
      };

      dispatch(addIngredient(ingredientObj));
    }
  };

  const checkIngredient = (ingredient) => {
    return ingredients.some((x) => x.name === ingredient);
  };

  return (
    <div>
      <h2>Pizza Ingredients</h2>
      {/* <pre>
        selected ingredients{" "}
        {ingredients.map((ingredient) => (
          <span key={ingredient.id}>{ingredient.name}</span>
        ))}
      </pre> */}

      <div className="pizza-ingredients">
        {ingredientsList.map((ingredient) => (
          <label
            key={ingredient}
            className={`pizza-ingredient ${
              checkIngredient(ingredient) ? "pizza-ingredient--active" : ""
            }`}
          >
            <input
              type="checkbox"
              name={ingredient}
              value={ingredient}
              checked={checkIngredient(ingredient)}
              onChange={() => updateIngredient(ingredient)}
            />
            <span
              className={`pizza-ingredient__icon pizza-ingredient__icon--${ingredient}`}
            ></span>
            {ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}
          </label>
        ))}
      </div>
    </div>
  );
};

export default PizzaIngredients;
