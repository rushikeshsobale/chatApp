// ChatUi.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage } from './store/store.js';
import './Chat.css';
import io from 'socket.io-client';

const ChatUi = ({ member, userId, name, socket }) => {
  const [messageInput, setMessageInput] = useState('');
  const [sendid, setSendId] = useState(member[0]);
  const [array, setArray] = useState([]);
  const chatHistory = useSelector(state => state.chat.chatHistory);
  const dispatch = useDispatch();


  const sendMessage = () => {
    if (messageInput.trim() !== '') {
      console.log("Sent message:", messageInput);
      const obj = {
        text: messageInput,
        sender: name,
      };
      dispatch(addMessage({
        neededId: sendid,
        message: { ...obj, sentByCurrentUser: obj.sender === name },
      }));
      socket.emit('sendMessage', { message: messageInput, userId: sendid, sender: name, myId: userId });
      setMessageInput('');
    }
  };

  useEffect(() => {
    if (socket) {
      console.log(member, "member")
      setSendId(member[0]);
      const array = chatHistory[sendid] ? Object.values(chatHistory[sendid]) : [];
      setArray(array);
    }
  }, [sendid, chatHistory, member, socket]);

  useEffect(() => {
    if (socket) {
  
    }
  }, [socket]);

  return (
    <div className="chat-box mx-1 rounded ">
      <div className="bg-dark py-2 m-1 rounded text-white" >
        <h4 className="mt-1 mx-3">{member[1]}</h4>
      </div>
      <div className="messages bg-light" style={{ height: '77%' }}>
        {array && array.map((message, index) => (
          <div key={index} className={`p-2 message ${!message.sentByCurrentUser ? 'received' : 'sent'}`}>
            <p>{message.text}</p>
            <span>{message.sender}</span>
          </div>
        ))}
      </div>
      <div className="message-input bottom-element">
        <input
          type="text"
          placeholder="Type your message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatUi;
