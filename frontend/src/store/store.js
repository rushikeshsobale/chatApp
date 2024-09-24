import { configureStore, createSlice} from '@reduxjs/toolkit'
const chatSlice = createSlice({
    name: 'chat',
    initialState: {
      chatHistory: {},
    },
    reducers: {
      addMessage: (state, action) => {
        console.log(action, "actio")
        const { neededId, message } = action.payload;
        console.log('Action Payload:', action.payload);
        if (!state.chatHistory[neededId]) {
          state.chatHistory[neededId] = [];
        }
        state.chatHistory[neededId].push(message);
        console.log('Updated Chat History:', state.chatHistory); // Log the updated chat history
      },
      setInitialMessages: (state, messages) => {
        state.chatHistory = messages.payload;
        console.log(messages.payload,"messages")
      },
    },
  });
  
 export const { addMessage, setInitialMessages } = chatSlice.actions;
export const store = configureStore({
  
    reducer: {
        chat: chatSlice.reducer,
      },
  
})