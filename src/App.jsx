import './App.css';
import PizzaCreator from './components/PizzaCreator/PizzaCreator';
import PizzaPreview from './components/PizzaPreview/PizzaPreview';
import OrderSummary from './components/OrderSummary/OrderSummary';
import { useState } from 'react';

function App() {
    const [isContinueDisabled, setIsContinueDisabled] = useState(false);

    const handleGoToOrderForm = () => {
        console.log('Navigating to the order form...');
        alert('Your pizza is ready to order!');
    };

    const handleGoToPayment = () => {
        console.log('Navigating handleGoToPayment.');
    };

    const handleIsContinueDisabled = () => {
        setIsContinueDisabled(!isContinueDisabled);
    };

    return (
        <>
            <div className="pizza-builder-container">
                <PizzaPreview />

                <div className="pizza-creator-container">
                    <PizzaCreator />
                    <OrderSummary
                        onGoToOrderForm={handleGoToOrderForm}
                        onGoToPayment={handleGoToPayment}
                        disabledContiniue={isContinueDisabled}
                    />
                </div>
            </div>
        </>
    );
}

export default App;
