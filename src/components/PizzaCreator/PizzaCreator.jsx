import { useSelector, useDispatch } from 'react-redux';
import { addPizza, setActivePizza } from '../../redux/actions';
import { selectActivePizzaId, selectOrderPizzas } from '../../redux/selectors';
import './PizzaCreator.scss';
import { useEffect } from 'react';
import PizzaIngredients from '../PizzaIngredients/PizzaIngredients';

const PizzaCreator = () => {
    const activePizzaId = useSelector((state) => selectActivePizzaId(state));
    const pizzas = useSelector((state) => selectOrderPizzas(state));
    const dispatch = useDispatch();

    const pizzaSizes = { Small: 'small', Medium: 'medium', Large: 'large' };
    const addPizzaHandler = () => {
        const pizzaId = pizzas.length;
        const pizza = {
            id: pizzaId,
            size: pizzaSizes.Small,
            name: 'Pizza',
            price: 1,
            quantity: 1,
            ingredients: [],
        };
        dispatch(addPizza(pizza));
        dispatch(setActivePizza(pizzaId));
    };

    useEffect(() => {
        if (activePizzaId === null) {
            addPizzaHandler();
        }
    }, [activePizzaId, dispatch]);

    const togglePizza = (index) => {
        const pizzaId = pizzas[index].id;
        dispatch(setActivePizza(pizzaId));
    };

    return (
        <div>
            <div className="pizza-creator">
                <h2>
                    Choose your pizzas
                    <button className="button" type="button" onClick={addPizzaHandler}>
                        <i className="fa fa-plus"></i>
                        Add pizza
                    </button>
                </h2>

                <div>
                    {pizzas.map((pizza, index) => (
                        <div key={index}>
                            <div className="pizza-creator__header" onClick={() => togglePizza(index)}>
                                <i
                                    className={`fa fa-fw pizza-creator__icon ${
                                        activePizzaId === pizza.id ? 'fa-chevron-up' : 'fa-chevron-down'
                                    }`}
                                ></i>
                                Pizza {index + 1}
                                <i className={`fa fa-fw pizza-creator__status ${pizza.valid ? 'fa-check' : 'fa-times'}`}></i>
                            </div>

                            <div className={activePizzaId === pizza.id ? 'pizza-creator__content--open' : 'pizza-creator__content'}>
                                {/*<h3> Select the size <span className="required">*</span></h3>
                                 <pizza-size> </pizza-size> */}

                                <h3>Pick your ingredients</h3>
                                <PizzaIngredients />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PizzaCreator;
