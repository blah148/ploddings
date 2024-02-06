import { createStore, combineReducers, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk';

// Define a simple reducer that reacts to an action
const testReducer = (state = { test: false }, action) => {
  switch (action.type) {
    case 'TOGGLE_TEST':
      return { ...state, test: !state.test };
    default:
      return state;
  }
};

// Combine reducers
const rootReducer = combineReducers({
  test: testReducer,
});

// Create store with thunk middleware applied
const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

export default store;

