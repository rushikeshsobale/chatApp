import { ADD_MESSAGE } from './action';

const initialState = {
  chatHistory: {},
};

const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_MESSAGE:
      const { neededId, message } = action.payload;
      return {
        ...state,
        chatHistory: {
          ...state.chatHistory,
          [neededId]: [...(state.chatHistory[neededId] || []), message],
        },
      };
    default:
      return state;
  }
};

export default chatReducer;
