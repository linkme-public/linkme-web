import {
  ROUTER_DID_CHANGE,
  CHANGE_COMPOSER_MESSAGE,
  SUBMIT_COMPOSER_MESSAGE,
  EDIT_CONVERSATION_TITLE,
  CHANGE_CONVERSATION_TITLE,
  SAVE_CONVERSATION_TITLE,
  CANCEL_EDIT_CONVERSATION_TITLE,
  LOAD_MORE_MESSAGES
} from '../actions/messenger';

const initialState = {
  editingTitle: false,
  title: '',
  composerMessage: '',
  messagePagination: 30
};

export default function activeConversationReducer(state = initialState, action) {
  const { payload, type } = action;

  switch (type) {
    case ROUTER_DID_CHANGE:
      return initialState;
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
    case EDIT_CONVERSATION_TITLE:
      return {
        ...state,
        editingTitle: true
      };
    case CHANGE_CONVERSATION_TITLE:
      return {
        ...state,
        title: payload.title
      };
    case SAVE_CONVERSATION_TITLE:
      return {
        ...state,
        title: '',
        editingTitle: false
      };
    case CANCEL_EDIT_CONVERSATION_TITLE:
      return {
        ...state,
        editingTitle: false,
        title: ''
      };
    case LOAD_MORE_MESSAGES:
      return {
        ...state,
        messagePagination: state.messagePagination + 30
      };
    default:
      return state;
  }
}
