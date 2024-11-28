import { useDispatch } from 'react-redux';
import './PizzaSize.scss';
import { updatePizzaSize } from '../../redux/actions';
import { useState } from 'react';

const PizzaSize = () => {
    const dispatch = useDispatch();
    const [selectedType, setSelectedType] = useState(null);

    const sizes = [
        { type: 'small', centimeters: 30 },
        { type: 'medium', centimeters: 40 },
        { type: 'large', centimeters: 50 },
    ];

    const onChange = (size) => {
        setSelectedType(size);
        dispatch(updatePizzaSize(size));
    };

    const toTitleCase = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    return (
        <div className="pizza-size section">
            {sizes.map((size, i) => (
                <label
                    key={size.type}
                    className={`pizza-size__item 
                        ${selectedType === size.type ? 'pizza-size__item--active' : ''} `}
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
                            <div className="pizza-size__pizza__line"></div>
                            <div className="pizza-size__pizza__line"></div>
                            <div className="pizza-size__pizza__line"></div>
                            <div className="pizza-size__pizza__line"></div>
                        </div>
                    </div>
                    <div className={`type-text ${i === 0 ? 'first' : ''}`}>
                        {toTitleCase(size.type)} ({size.centimeters}cm)
                    </div>
                </label>
            ))}
        </div>
    );
};

export default PizzaSize;
