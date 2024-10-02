import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, updateMessageStatus } from './store/store';
import './Chat.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import MenuBar from './MenuBar';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { CiMenuKebab } from "react-icons/ci";
const ChatUi = ({ member, userId, name, socket, setMsgCounts }) => {
  const [messageInput, setMessageInput] = useState('');
  const sendId = member.friendId; // No need for a separate state here
  const [messageArray, setMessageArray] = useState([]);
  const chatHistory = useSelector(state => state.chat.chatHistory);
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const sendMessage = async () => {
    if (messageInput.trim() !== '') {
      const message = {
        text: messageInput,
        senderId: userId,
        senderName: name,
        read: false,
        pending: true,
        timestamp: new Date().toISOString()
      };
      await fetch('http://localhost:5500/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sendId, message: { ...message, sentByCurrentUser: true } }),
      });
      dispatch(addMessage({
        neededId: sendId,
        message: { ...message, sentByCurrentUser: true },
      }));
      socket.emit('sendMessage', { message: messageInput, userId: sendId, sender: name, myId: userId, timestamp: new Date().toISOString(), });
      setMessageInput('');
    }
  };
  useEffect(() => {
    if (socket && sendId) {
      const messages = chatHistory[sendId] ? Object.values(chatHistory[sendId]) : [];
      setMessageArray(messages);
    }
  }, [sendId, chatHistory, socket]);
  useEffect(() => {
    const handleSetStatus = async (data) => {
      console.log(data, 'stadata')
      const { messageId, userId } = data;
      await fetch('http://localhost:5500/updateMessageStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          messageId:messageId,
          status: 'read',
        }),
      });
      dispatch(updateMessageStatus({ sendId, userId }));
    };
    if (socket) {
      socket.on('setStatus', handleSetStatus);
    }
    return () => {
      if (socket) {
        socket.off('setStatus', handleSetStatus);
      }
    };
  }, [socket, userId, dispatch]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
    const resetMsgCount = () => {
      setMsgCounts((prevCounts) => ({
        ...prevCounts,
        [sendId]: 0,
      }));
    };

    resetMsgCount()

  }, [messageArray]);

  const clearChat = async () => {
    try {
      const response = await fetch('http://localhost:5500/deleteChat', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              userId: userId, // Replace with actual user ID
              messageId: sendId,      // ID of the chat/messages to clear
          }),
      });

      if (!response.ok) {
          throw new Error('Failed to clear chat');
      }


        // Dispatch action to update the state in the Redux store
        dispatch({ type: 'CLEAR_CHAT', payload: sendId });

        // Reset the local state for messages
        setMessageArray([]);
    } catch (error) {
        console.error('Error clearing chat:', error);
        // Handle error (e.g., show an error message to the user)
    }
};

  return (
    <div className="d-flex flex-column rounded  ">

      <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
        <h4 className="mb-0 text-white">{member.friendName}</h4>
        <div className="dropdown">
          <button 
            className="btn text-white p-0"
            type="button"
            id="dropdownMenuButton"
            data-bs-toggle="dropdown"
            aria-expanded="true"
            style={{ backgroundColor: 'transparent', fontSize:'20px' }}
          >
          <CiMenuKebab />
          </button>
          <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton" style={{ backgroundColor: 'white' }}>
            <li><a onClick={clearChat} className="dropdown-item" href="#">Clear chat</a></li>
            <li><a className="dropdown-item" href="#">Action 2</a></li>
            <li><a className="dropdown-item" href="#">Action 3</a></li>
          </ul>
        </div>
      </div>

      <div className="messages flex-grow-1 overflow-auto">
        {messageArray.length === 0 ? (
          <p className="text-center text-muted">Start a conversation!</p>
        ) : (
          messageArray.map((message, index) => (
            <div key={index} className={`bg-none d-flex ${message.sentByCurrentUser ? 'justify-content-end' : ''} mb-1`}>
              <div className="d-flex justify-content-between align-items-center border rounded gap-2 shadow-sm px-1 text-light">
                <p className="mb-0 mx-1 text-white " style={{ height: '40px', opacity: 1 }}>{message.text}</p>
                <span className="message-timestamp small" style={{ fontSize: '10px', alignSelf: 'flex-end' }}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
                {message.pending && !message.read && (
                  <span className="text-warning small" title="Message is pending" style={{ fontSize: '10px', alignSelf: 'flex-end' }}>
                    ⏳
                  </span>
                )}
                {(message.status=='read'|| message.read)&& (
                  <span className="text-success small" title="Message read" style={{ fontSize: '13px', alignSelf: 'flex-end' }}>
                    <FontAwesomeIcon icon={faCheckDouble} />
                  </span>
                )}
              </div>

            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input d-flex align-items-center p-2 border-top">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Type your message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
        />
        <div className="text-white px-3 py-2 border rounded" onClick={sendMessage}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </div>

      </div>
    </div>
  );
}

export default ChatUi;
