import { configureStore, createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chatHistory: {},
  },
  reducers: {
    addMessage: (state, action) => {
      const { neededId, message } = action.payload;
      console.log(message , 'toimestamp')
      if (!state.chatHistory[neededId]) {
        state.chatHistory[neededId] = [];
      }
      state.chatHistory[neededId].push(message);
    },
    setInitialMessages: (state, action) => {
      state.chatHistory = action.payload;
    },
    updateMessageStatus: (state, action) => {
      const { sendId, userId } = action.payload;
      const messages = state.chatHistory[sendId];

      if (messages) {
        messages.forEach((message) => {
          // Assuming you want to mark all messages from the sender as read
          if (message.senderId === userId) {
            message.read = true; // Set read status
          }
        });
      }
    },
  },
});

export const { addMessage, setInitialMessages, updateMessageStatus } = chatSlice.actions;

export const store = configureStore({
  reducer: {
    chat: chatSlice.reducer,
  },
});
