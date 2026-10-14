import { useSelector } from 'react-redux';
import './OrderSummary.scss';
import { selectOrderPizzas, selectOrderTotalAmount } from '../../redux/selectors';

const toTitleCase = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const formatCurrency = (value: number, currency = 'EUR', locale = 'en-US'): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);

const OrderSummary = () => {
  const pizzas = useSelector(selectOrderPizzas);
  const totalPrice = useSelector(selectOrderTotalAmount);

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
                <i className="fa fa-plus" />
                {toTitleCase(ingredient.name)}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="pizza-summary__total-price">Total: {formatCurrency(totalPrice)}</div>
    </div>
  );
};

export default OrderSummary;
