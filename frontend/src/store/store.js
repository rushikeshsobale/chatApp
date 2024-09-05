import { configureStore, createSlice } from '@reduxjs/toolkit';

const dbName = 'ChatDatabase';
const storeName = 'ChatHistory';

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'neededId' });
        console.log("Object store created");
      }
    };

    request.onsuccess = function(event) {
      resolve(event.target.result);
    };

    request.onerror = function(event) {
      reject(event.target.errorCode);
    };
  });
}

async function saveChatHistory(neededId, messages) {
  try {
    const db = await openDb();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    const data = { neededId, messages };
    const request = store.put(data);

    request.onsuccess = function() {
      console.log('Chat history saved successfully.');
    };

    request.onerror = function(event) {
      console.error('Error saving chat history:', event.target.errorCode);
    };

    transaction.oncomplete = function() {
      console.log('Transaction completed.');
    };

  } catch (error) {
    console.error('Error opening database:', error);
  }
}

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chatHistory: {},
  },
  reducers: {
    addMessage: (state, action) => {
      const { neededId, message } = action.payload;
      console.log('Action Payload:', action.payload);
      if (!state.chatHistory[neededId]) {
        state.chatHistory[neededId] = [];
      }
      state.chatHistory[neededId].push(message);
      saveChatHistory(neededId, state.chatHistory[neededId]);
      console.log('Updated Chat History:', state.chatHistory); 
    },
  },
});

export const { addMessage } = chatSlice.actions;
export const store = configureStore({
  reducer: {
    chat: chatSlice.reducer,
  },
});
