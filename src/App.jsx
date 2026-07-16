import './App.css';
import { useState, useCallback, lazy, Suspense } from 'react';
import { useDispatch } from 'react-redux';
import PizzaCreator from './components/PizzaCreator/PizzaCreator';
import PizzaPreview from './components/PizzaPreview/PizzaPreview';
import OrderSummary from './components/OrderSummary/OrderSummary';
import OrderForm from './components/OrderForm/OrderForm';
import { setOrderDetails } from './redux/actions';

// Lazy-loaded: pulls in mapbox-gl, which is too heavy to bundle into the initial chunk.
const Delivery = lazy(() => import('./components/Delivery/Delivery'));

const STEP = {
    BUILDER: 'builder',
    ORDER: 'order',
    DELIVERY: 'delivery',
};

function App() {
    const dispatch = useDispatch();
    const [step, setStep] = useState(STEP.BUILDER);
    const [orderForm, setOrderForm] = useState({ formData: {}, isValid: false });

    const handleOrderFormChange = useCallback((data) => setOrderForm(data), []);

    const goToOrder = () => setStep(STEP.ORDER);
    const goToBuilder = () => setStep(STEP.BUILDER);

    const goToDelivery = () => {
        dispatch(setOrderDetails(orderForm.formData));
        setStep(STEP.DELIVERY);
    };

    return (
        <>
            {step === STEP.BUILDER && (
                <div className="pizza-builder-container">
                    <PizzaPreview />

                    <div className="pizza-creator-container">
                        <PizzaCreator />
                        <OrderSummary />
                        <button onClick={goToOrder} className="pizza-summary__button">
                            Continiue
                        </button>
                    </div>
                </div>
            )}

            {step === STEP.ORDER && (
                <div className="pizza-builder-container">
                    <PizzaPreview />

                    <div className="pizza-creator-container">
                        <div className="order-header">
                            <button className="back-btn" type="button" onClick={goToBuilder}>
                                Go back
                            </button>
                            <h1>Place Your Order</h1>
                        </div>
                        <OrderForm onFormChange={handleOrderFormChange} />
                        <OrderSummary />
                        <button onClick={goToDelivery} className="pizza-summary__button" disabled={!orderForm.isValid}>
                            Continiue
                        </button>
                    </div>
                </div>
            )}

            {step === STEP.DELIVERY && (
                <div className="pizza-builder-container">
                    <Suspense fallback={null}>
                        <Delivery />
                    </Suspense>
                </div>
            )}
        </>
    );
}

export default App;
