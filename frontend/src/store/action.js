// Action Types
export const SET_USER = 'SET_USER';
export const ADD_MESSAGE = 'ADD_MESSAGE';

// Action Creators

// Action to set user information
export const setUser = (userId, name, friends) => {
  return {
    type: SET_USER,
    payload: {
      userId,
      name,
      friends,
    },
  };
};

// Action to add a message to the chat
export const addMessage = (neededId, message) => {
  return {
    type: ADD_MESSAGE,
    payload: {
      neededId,
      message,
    },
  };
};
