import { SET_USER } from './action';

const initialState = {
  userId: null,
  name: '',
  friends: [],
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        userId: action.payload.userId,
        name: action.payload.name,
        friends: action.payload.friends,
      };
    default:
      return state;
  }
};

export default authReducer;
