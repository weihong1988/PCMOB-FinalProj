// Action types
const LOG_IN = "log_in";
const LOG_OUT = "log_out";

// Actions
export function logInAction() {
  return {type: LOG_IN}
}

export function logOutAction() {
    return {type: LOG_OUT}
  }

// State 
const initialState = {
  token: null,
}

// Reducer 
export default function blogAuthReducer(state=initialState, action) {
  switch (action.type) {
    case LOG_IN: 
      return { ...state, token: action.payload }
    case LOG_OUT: 
      return { ...state, token: null }
    default: 
      return state
  }
}