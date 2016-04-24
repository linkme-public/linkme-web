import {
  ROUTER_DID_CHANGE,
  ADD_PARTICIPANT,
  REMOVE_PARTICIPANT,
  CHANGE_CONVERSATION_TITLE,
  CHANGE_COMPOSER_MESSAGE,
  SUBMIT_COMPOSER_MESSAGE
} from '../actions/messenger';

const initialState = {
  title: '',
  participants: [],
  composerMessage: ''
};

export default function newConversationReducer(state = initialState, action) {
  const { payload, type } = action;

  switch (type) {
    case ROUTER_DID_CHANGE:
      return initialState;
    case ADD_PARTICIPANT:
      return {
        ...state,
        participants: [
          ...state.participants,
          payload.userId
        ]
      };
    case REMOVE_PARTICIPANT:
      return {
        ...state,
        participants: state.participants.filter((participantId) => {
          return participantId !== payload.userId;
        })
      };
    case CHANGE_CONVERSATION_TITLE:
      return {
        ...state,
        title: payload.title
      };
    case CHANGE_COMPOSER_MESSAGE:
      return {
        ...state,
        composerMessage: payload.value
      };
    case SUBMIT_COMPOSER_MESSAGE:
      return {
        ...state,
        composerMessage: ''
      };
    default:
      return state;
  }
}
