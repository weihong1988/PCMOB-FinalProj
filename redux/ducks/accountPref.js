// Action types
const CHANGE_MODE = "change_mode";

const UPLOAD_USER_ID = "upload_user_id";
const UPLOAD_USERNAME = "upload_username";
const UPLOAD_NICKNAME = "upload_nickname";
const UPLOAD_PROFILEPIC = "upload_pic";
const UPLOAD_CREATEDAT = "upload_createdAt";

// Actions
export function changeModeAction() {
  return {type: CHANGE_MODE}
}

export function uploadUserIDAction() {
  return {type: UPLOAD_USER_ID}
}

export function uploadUsernameAction() {
  return {type: UPLOAD_USERNAME}
}

export function uploadNicknameAction() {
  return {type: UPLOAD_NICKNAME}
}

export function uploadProfilePicAction() {
  return {type: UPLOAD_PROFILEPIC}
}

export function uploadCreatedAtAction() {
  return {type: UPLOAD_CREATEDAT}
}

// State 
const initialState = {
  isDark: false,

  user_id: null,
  username: "",
  nickname: "",
  profilePicture: "",
  createdAt: "",
}

// Reducer 
export default function accountPrefReducer(state=initialState, action) {
  switch (action.type) {
    case CHANGE_MODE: 
      return { ...state, isDark: !state.isDark }

    case UPLOAD_USER_ID:
      return { ...state, user_id: action.payload }
    case UPLOAD_USERNAME: 
      return { ...state, username: action.payload }
    case UPLOAD_NICKNAME: 
      return { ...state, nickname: action.payload }
    case UPLOAD_PROFILEPIC: 
      return { ...state, profilePicture: action.payload }
    case UPLOAD_CREATEDAT: 
      return { ...state, createdAt: action.payload }

    default: 
      return state
  }
}