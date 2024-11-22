import { ADD_INGREDIENT, REMOVE_INGREDIENT } from './actions';

const initialState = {
    ingredients: [],
};

const orderReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_INGREDIENT:
            return {
                ...state,
                ingredients: [...state.ingredients, action.payload],
            };
        case REMOVE_INGREDIENT:
            return {
                ...state,
                ingredients: state.ingredients.filter(
                    (ingredient) => ingredient.id !== action.payload.ingredientId
                ),
            };
        default:
            return state;
    }
};

export default orderReducer;
