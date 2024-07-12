import React, { useState, useEffect } from 'react';
import './Chat.css'; // Import your custom styles
import io from 'socket.io-client';
import ChatUi from './ChatUi.js';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage } from './store/store.js';

const ChatComponent = () => {
  const [name, setName] = useState('');
  const [socket, setSocket] = useState(null);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [userId, setUserid] = useState(null);
  const [isChatUiMounted, setIsChatUiMounted] = useState(false);
  const chatHistory = useSelector((state) => state.chat.chatHistory);
  const dispatch = useDispatch();

  const getToken = () => {
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
    return null;
  };

  const fetchTokenAndSetState = async () => {
    const token = getToken();
    console.log("fetching token")
    try {
      if (token) {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const userId = tokenPayload.userId;
        const name = tokenPayload.name;
        const friends = tokenPayload.friends;
        if (name) {
          setUserid(userId);
          setName(name);
          setFriends(friends);
          const newSocket = io('http://localhost:5500', { query: { userId: tokenPayload.userId } });
          setSocket(newSocket);
          newSocket.emit('joinRoom', { userId });
          console.log("roomJoined")
          newSocket.on('message', handleMessage);
        // newSocket.on("userLeft", handleUserLeft )
        }
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  };

  useEffect(() => {
    fetchTokenAndSetState();
  }, []);

  useEffect(()=>{
    if (socket) {
      socket.on("userLeft", handleUserLeft)
    }
  }, []);
  const handleFriendSelect = (member) => {
    const memberArray = Object.values(member);
    setSelectedFriend(memberArray); 
  };
  const handleMessage = (message) => {
      console.log('Received message in chat.jss:', message);
      dispatch(addMessage({
        neededId: message.neededId,
        message: {
          ...message,
          sentByCurrentUser: message.sender === name,
        },
      }));
  };

  const handleUserLeft = async () => {
    console.log(chatHistory);
    try {
      const response = await fetch("http://localhost:5500/postMessages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chatHistory),
      });
      console.log("disconnect response", response);
    } catch (error) {
      console.error('Error posting messages:', error);
    }
  };
    
  return (
    <div className="bg-dark row">
      <div className="chat-component col-12 col-md-6" style={{ height: '500px' }}>
        <div className="sidebar">
          <div className="bg-dark px-3 py-1 text-white rounded">
            <h3>{name}</h3>
          </div>
          <ul>
            {friends.map((member, index) => (
              <li className="bg-light rounded px-3" key={index} onClick={() => handleFriendSelect(member)}>
                {member[1] + ' ' + member[2]}
              </li>
            ))}
          </ul>
          <button className=" btn bg-info rounded" onClick={()=>handleUserLeft()} >HIT</button>
        </div>
        
        {selectedFriend && (
          <ChatUi
            member={selectedFriend}
            userId={userId}
            name={name}
            onFriendSelect={handleFriendSelect}
            socket={socket}
            History={chatHistory}
            
          />
        )}
      
      </div>
    </div>
  );
};

export default ChatComponent;