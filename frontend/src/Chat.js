import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import ChatUi from './ChatUi';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage } from './store/store';

const ChatComponent = () => {
  const [name, setName] = useState('');
  const [socket, setSocket] = useState(null);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [userId, setUserId] = useState(null);
  const chatHistory = useSelector(state => state.chat.chatHistory);
  const dispatch = useDispatch();

  const getToken = () => {
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
    return null;
  };

  const fetchTokenAndSetState = () => {
    const token = getToken();
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        setUserId(tokenPayload.userId);
        setName(tokenPayload.name);
        setFriends(tokenPayload.friends);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  };

  useEffect(() => {
    fetchTokenAndSetState();

    if (userId) {
      // Initialize socket only if userId is available
      const newSocket = io('http://localhost:5500', { query: { userId } });
      setSocket(newSocket);

      // Listen for messages
      newSocket.on('message', handleMessage);

      // Emit joinRoom event
      newSocket.emit('joinRoom', { userId });
      
      // Cleanup socket on component unmount
      return () => {
        newSocket.off('message', handleMessage);
        newSocket.disconnect();
      };
    }
  }, [userId]); // Re-run effect if userId changes

  const handleFriendSelect = (member) => {
    setSelectedFriend(member);
  };

  const handleMessage = (message) => {
    console.log(message, "from the sender");
    dispatch(addMessage({
      neededId: message.senderId,
      message: {
        ...message,
        sentByCurrentUser: message.sender === name,
      },
    }));
  };

  const handleUserLeft = async () => {
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
    <div className="container-fluid vh-100 d-flex flex-column">
      <div className="row flex-grow-1">
        <div className={` ${selectedFriend ? 'col-md-4' : 'col-6 mx-auto'} p-3 bg-light border-end`}>
          <div className="mb-4">
            <h5>{name}</h5>
          </div>
          <ul className="list-group">
            {friends?.map((member, index) => (
              <li
                className={`list-group-item list-group-item-action ${selectedFriend === member ? 'active' : ''}`}
                key={index}
                onClick={() => handleFriendSelect(member)}
              >
                {member[1] + ' ' + member[2]}
              </li>
            ))}
          </ul>
          <button className="btn btn-danger mt-3" onClick={handleUserLeft}>Logout</button>
        </div>
        {selectedFriend &&
          <div className="col-md-8 p-3 d-flex flex-column">
            <ChatUi
              member={selectedFriend}
              userId={userId}
              name={name}
              socket={socket}
              History={chatHistory}
            />
          </div>
        }
      </div>
    </div>
  );
};
export default ChatComponent;
