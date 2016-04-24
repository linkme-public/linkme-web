import {
  CLIENT_READY,
  FETCH_USERS_SUCCESS
} from '../actions/messenger';

const initialState = {
  ready: false,
  clientReady: false,
  usersLoaded: false,
  users: []
};

export default function appReducer(state = initialState, action) {
  const { payload, type } = action;

  switch (type) {
    case CLIENT_READY:
      return {
        ...state,
        ready: state.usersLoaded,
        clientReady: true
      };
    case FETCH_USERS_SUCCESS:
      return {
        ...state,
        ready: state.clientReady,
        usersLoaded: true,
        users: payload.users
      };
    default:
      return state;
  }
}
