import { API, API_WHOAMI, API_IMAGE_URL } from '../constants/API';
import axios from 'axios';

import { logInAction, logOutAction } from '../redux/ducks/blogAuth';
import { uploadUserIDAction, uploadUsernameAction, uploadNicknameAction, uploadProfilePicAction, uploadCreatedAtAction } from '../redux/ducks/accountPref';

export default async function getLoggedInUser(dispatch, token) {
  try {
    const response = await axios.get(API + API_WHOAMI, {
      headers: { Authorization: `JWT ${token}` },
    });

    dispatch({...uploadUserIDAction(), payload: response.data.user_id})
    dispatch({...uploadUsernameAction(), payload: response.data.username})
    dispatch({...uploadNicknameAction(), payload: response.data.nickname})
    dispatch({...uploadProfilePicAction(), payload: API_IMAGE_URL + response.data.profilePic})
    dispatch({...uploadCreatedAtAction(), payload: new Date(response.data.createdAt * 1000).toDateString()})
  }
  catch (error) {
    if (error.response)
      console.log(error.response.data);

    dispatch({...logOutAction()})
  }
}
