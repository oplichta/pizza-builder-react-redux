import { useSelector } from 'react-redux';
import './PizzaPreview.scss';
import { selectActivePizzaId, selectIngredientsOfPizza, selectOrderPizzas } from '../../redux/selectors';

const PizzaPreview = () => {
    const activePizzaId = useSelector((state) => selectActivePizzaId(state));
    const pizzas = useSelector((state) => selectOrderPizzas(state));
    const ingredients = useSelector((state) => selectIngredientsOfPizza(state));

    return (
        <div className="pizza-preview">
            <div className="pizza-preview-table-side"></div>
            <div className="pizza-preview-table"></div>
            <span>{activePizzaId + 1}</span>

            {pizzas.map((pizza, i) => (
                <div key={i} className={`pizza ${activePizzaId === i ? 'pizza--active' : ''}`}>
                    <div className="pizza-board"></div>
                    <div className="pizza-base"></div>
                    <div className="pizza-ingredients-prev">
                        {ingredients.map((ingredient, index) => (
                            <div key={index} style={{ zIndex: index }} className={`pizza-ingredient-prev`}>
                                {[...Array(5)].map((_, idx) => (
                                    <div key={idx} className={`pizza-ingredient-prev pizza-ingredient-prev--${ingredient.name}`}></div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PizzaPreview;
