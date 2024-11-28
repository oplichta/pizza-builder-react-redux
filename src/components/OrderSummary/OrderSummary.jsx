import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectOrderPizzas, selectOrderTotalAmount } from '../../redux/selectors';
import './OrderSummary.scss';

const PizzaSize = ({ onGoToOrderForm, onGoToPayment, disabledContiniue }) => {
    const pizzas = useSelector((state) => selectOrderPizzas(state));
    const totalPrice = useSelector((state) => selectOrderTotalAmount(state));
    const [isShowForm, setIsShowForm] = useState(false);

    const goToForm = () => {
        if (isShowForm) {
            onGoToPayment();
        } else {
            setIsShowForm(true);
            onGoToOrderForm();
        }
    };

    const toTitleCase = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const formatCurrency = (value, currency = 'EUR', locale = 'en-US') => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
        }).format(value);
    };

    return (
        <div className="pizza-summary">
            <h2>Order Summary</h2>
            {pizzas.map((pizza, i) => (
                <div key={i} className="pizza-summary__pizza">
                    <h3>
                        {toTitleCase(pizza.size)} Pizza
                        <span className="pizza-summary__price">{formatCurrency(pizza.price)}</span>
                    </h3>

                    <div className="pizza-summary__ingredients">
                        {pizza.ingredients.map((ingredient, i) => (
                            <div key={i} className="pizza-summary__ingredient">
                                <i className="fa fa-plus"></i>
                                {toTitleCase(ingredient.name)}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <div className="pizza-summary__total-price">Total: {formatCurrency(totalPrice)}</div>
            <button onClick={() => goToForm()} className="pizza-summary__button" disabled={disabledContiniue}>
                Continiue
            </button>
        </div>
    );
};

export default PizzaSize;
