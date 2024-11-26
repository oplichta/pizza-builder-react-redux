import './App.css';
import PizzaCreator from './components/PizzaCreator/PizzaCreator';
import PizzaPreview from './components/PizzaPreview/PizzaPreview';

function App() {
    return (
        <>
            <div className="pizza-builder-container">
                <PizzaPreview />

                <div className="pizza-creator-container">
                    <PizzaCreator />
                </div>
            </div>
        </>
    );
}

export default App;
