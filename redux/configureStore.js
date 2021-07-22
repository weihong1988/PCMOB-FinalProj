import { createStore, combineReducers } from 'redux';
import blogAuthReducer from "./ducks/blogAuth";
import accountPrefReducer from "./ducks/accountPref";

const overallReducer = combineReducers({
  auth: blogAuthReducer,
  account: accountPrefReducer,
})

const store = createStore(overallReducer);

export default store;
