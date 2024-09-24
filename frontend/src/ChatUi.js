import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage } from './store/store';
import './Chat.css';
const ChatUi = ({ member, userId, name, socket }) => {
  const [messageInput, setMessageInput] = useState('');
  const [sendId, setSendId] = useState(member[0]);
  const [messageArray, setMessageArray] = useState([]);
  const chatHistory = useSelector(state => state.chat.chatHistory);

  const dispatch = useDispatch();

  const sendMessage = async() => {
    if (messageInput.trim() !== '') {
      const message = {
        text: messageInput,
        senderId:userId,
        senderName: name,
      };

    const response =  await fetch('http://localhost:5500/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({sendId,   message: { ...message, sentByCurrentUser: message.senderName === name }}),
      });

      if(response){
        console.log(response, "response")
      }
      dispatch(addMessage({
        neededId: sendId,
        message: { ...message, sentByCurrentUser: message.senderName === name },
      }));
      socket.emit('sendMessage', { message: messageInput, userId: sendId, sender: name, myId: userId });
      setMessageInput('');
    }
  };

  useEffect(() => {
    if (socket && sendId) {
      console.log(chatHistory,'history')
      setSendId(member[0]);
      const messages = chatHistory[sendId] ? Object.values(chatHistory[sendId]) : [];
      setMessageArray(messages);
    }
  }, [sendId, chatHistory, member, socket]);

  return (
    <div className="chat-box d-flex flex-column rounded shadow">
      <div className="chat-header bg-primary text-white p-3 rounded-top">
        <h4 className="mb-0">{member[1]}</h4>
      </div>
      <div className="messages flex-grow-1 p-3 overflow-auto">
        {messageArray.length === 0 ? (
          <p className="text-center text-muted">Start a conversation!</p>
        ) : (
          messageArray.map((message, index) => (
            <div key={index} className={`message ${!message.sentByCurrentUser ? 'received' : 'sent'}`}>
              <div className="message-content">
                <p>{message.text}</p>
                <span className="message-sender">{message.senderName}</span>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="message-input d-flex align-items-center p-2 border-top">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Type your message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
        />
        <button className="btn btn-primary" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatUi;
