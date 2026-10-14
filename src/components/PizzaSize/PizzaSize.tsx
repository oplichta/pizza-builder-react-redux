import './PizzaSize.scss';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { updatePizzaSize } from '../../redux/orderSlice';
import { selectSizeOfActivePizza } from '../../redux/selectors';
import type { PizzaSizeValue } from '../../redux/types';

interface SizeOption { type: PizzaSizeValue; centimeters: number }

const sizes: SizeOption[] = [
  { type: 'small', centimeters: 30 },
  { type: 'medium', centimeters: 40 },
  { type: 'large', centimeters: 50 },
];

const toTitleCase = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const PizzaSize = () => {
  const dispatch = useAppDispatch();
  const selectedType = useAppSelector(selectSizeOfActivePizza);

  const onChange = (size: PizzaSizeValue) => {
    dispatch(updatePizzaSize(size));
  };

  return (
    <div className="pizza-size section">
      {sizes.map((size) => (
        <label
          key={size.type}
          className={`pizza-size__item ${selectedType === size.type ? 'pizza-size__item--active' : ''}`}
        >
          <input
            type="radio"
            name="size"
            value="size.type"
            onChange={() => onChange(size.type)}
            checked={selectedType === size.type}
          />
          <div className="pizza-size__plate">
            <div className={`pizza-size__pizza pizza-size__pizza--${size.type}`}>
              <div className="pizza-size__pizza__line" />
              <div className="pizza-size__pizza__line" />
              <div className="pizza-size__pizza__line" />
              <div className="pizza-size__pizza__line" />
            </div>
          </div>
          <div className={`type-text ${sizes.indexOf(size) === 0 ? 'first' : ''}`}>
            {toTitleCase(size.type)} ({size.centimeters}cm)
          </div>
        </label>
      ))}
    </div>
  );
};

export default PizzaSize;
