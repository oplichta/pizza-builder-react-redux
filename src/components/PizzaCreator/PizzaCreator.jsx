import { useSelector, useDispatch } from 'react-redux';
import { addPizza, removePizza, setActivePizza } from '../../redux/orderSlice';
import { selectActivePizzaId, selectOrderPizzas } from '../../redux/selectors';
import './PizzaCreator.scss';
import { useCallback, useEffect, useRef } from 'react';
import PizzaIngredients from '../PizzaIngredients/PizzaIngredients';
import PizzaSize from '../PizzaSize/PizzaSize';

const PIZZA_SIZES = { Small: 'small', Medium: 'medium', Large: 'large' };

const PizzaCreator = () => {
    const activePizzaId = useSelector((state) => selectActivePizzaId(state));
    const pizzas = useSelector((state) => selectOrderPizzas(state));
    const dispatch = useDispatch();

    // addPizza generates the pizza's id itself and marks it active, so this handler
    // only needs to describe a fresh pizza's starting shape.
    const addPizzaHandler = useCallback(() => {
        dispatch(
            addPizza({
                size: PIZZA_SIZES.Small,
                name: 'Pizza',
                price: 0,
                quantity: 1,
                ingredients: [],
            })
        );
    }, [dispatch]);

    // Guards against React StrictMode's dev-only double-invocation of mount effects:
    // both invocations close over the same stale activePizzaId (null), so without this
    // ref the effect body would dispatch addPizza twice before either dispatch's state
    // update is reflected in a re-render.
    const hasRequestedPizzaRef = useRef(false);
    useEffect(() => {
        if (activePizzaId !== null) {
            hasRequestedPizzaRef.current = false;
            return;
        }
        if (hasRequestedPizzaRef.current) {
            return;
        }
        hasRequestedPizzaRef.current = true;
        addPizzaHandler();
    }, [activePizzaId, addPizzaHandler]);

    const togglePizza = (index) => {
        const pizzaId = pizzas[index].id;
        dispatch(setActivePizza(pizzaId));
    };

    const removePizzaHandler = (event, pizzaId) => {
        event.stopPropagation();
        dispatch(removePizza(pizzaId));
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
                        <div key={pizza.id}>
                            <div className="pizza-creator__header" onClick={() => togglePizza(index)}>
                                <i
                                    className={`fa fa-fw pizza-creator__icon ${
                                        activePizzaId === pizza.id ? 'fa-chevron-up' : 'fa-chevron-down'
                                    }`}
                                ></i>
                                Pizza {index + 1}
                                <i className={`fa fa-fw pizza-creator__status ${pizza.valid ? 'fa-check' : 'fa-times'}`}></i>
                                <button
                                    type="button"
                                    className="pizza-creator__delete"
                                    onClick={(event) => removePizzaHandler(event, pizza.id)}
                                    aria-label={`Remove pizza ${index + 1}`}
                                >
                                    <i className="fa fa-trash"></i>
                                </button>
                            </div>

                            <div className={activePizzaId === pizza.id ? 'pizza-creator__content--open' : 'pizza-creator__content'}>
                                <h3> Select the size <span className="required">*</span></h3>
                                 <PizzaSize />

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
