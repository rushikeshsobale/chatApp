import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import ChatUi from './ChatUi';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setInitialMessages } from './store/store';
import './Chat.css';
const ChatComponent = () => {
  const [name, setName] = useState('');
  const [socket, setSocket] = useState(null);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [userId, setUserId] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [msgCounts, setMsgCounts] = useState('');
  const chatHistory = useSelector(state => state.chat.chatHistory);
  const dispatch = useDispatch();
  console.log(activeUsers, 'activeUsers')
  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:5500/getUser', {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        const id = data._id
        // const newSocket = io('http://localhost:5500', { query: {id} });
        setSocket(io('http://localhost:5500', { query: { id } }))
        setUserId(data._id);
        setName(data.firstName);
        setFriends(data.friends);
      } else {
        console.error("Failed to fetch user data:", response.statusText);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  useEffect(() => {
    fetchUserData();
  }, []);
  useEffect(() => {
    if (userId) {
      socket.on('message', handleMessage);
      socket.on('restatus', (data) => {
        setActiveUsers(data)
      })
      socket.emit('joinRoom', { userId });
      socket.on('status', (data) => {
        setActiveUsers(prevActiveUsers => (
          [...prevActiveUsers, data]
        ));
      });
      socket.on('userLeft', (activeMembers) => {
     
        setActiveUsers(activeMembers);
      });
      return () => {
        socket.off('message', handleMessage);
        socket.off('status');
        socket.disconnect();
      };
    }
  }, [userId]);
  const handleFriendSelect = (member) => {
    setSelectedFriend(member);
  };
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5500/getMessages/${userId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const messages = await response.json();
        dispatch(setInitialMessages(messages));
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    if (userId) {
      fetchMessages();
    }
  }, [userId, dispatch]);
  const handleMessage = (message) => {
    setMsgCounts((prevCounts) => ({
      ...prevCounts,
      [message.senderId]: (prevCounts[message.senderId] || 0) + 1,
    }));
    if (message.senderId) {
      dispatch(addMessage({
        neededId: message.senderId,
        message: {
          ...message,
          sentByCurrentUser: message.sender === name,
        },
      }));
      console.log('Emitting recievedMsg with ID:', message.senderId);
      socket.emit('recievedMsg', { id: message.senderId,  });
    } else {
      console.error('Message does not have senderId:', message);
    }
  };
  useEffect(() => {
    console.log("socket", activeUsers)
  }, [activeUsers])
  return (
    <div className=" overlay" >
      <div className="row flex-grow-1 " >
        <div className={`${selectedFriend ? 'col-md-4' : 'col-6 mx-auto'} p-4 chat-box shEffect mx-5`} style={{ height: '600px', zIndex: '1', }}>
          <div className="mb-1 d-flex " style={{ color: '#fff' }}>
            <img
              src={'' || 'https://via.placeholder.com/100'}
              alt={`${name}'s Profile`}
              className="profile-image mx-3"
              style={{ borderRadius: '50%', border: '2px solid #fff' }}
            />
            <h5 className="mx-2 my-auto" style={{ color: '#fff' }}>{name}</h5>
          </div>
          <ul>
            {friends
              ?.filter(member => member.isFriend)
              .map((member, index) => (
                <li
                  className={`d-flex justify-content-between align-items-center ${selectedFriend === member ? 'active' : ''}`}
                  key={index}
                  onClick={() => handleFriendSelect(member)}
                >
                  <span className='mx-3'>
                    {activeUsers?.some(user => user.userId === member.friendId) && (
                      <span className="active-status" style={{ color: 'green' }}>&#8226;</span>
                    )}
                    {member.friendName}
                  </span>
                  <span className="message-count">
                    {msgCounts[member.friendId] || ''}
                  </span>
                </li>
              ))}
          </ul>
        </div>
        {selectedFriend && (
          <div className="col-md-7 d-flex flex-column shEffect chat-box " style={{ zIndex: 1 }}>
            <ChatUi
              member={selectedFriend}
              userId={userId}
              name={name}
              socket={socket}
              History={chatHistory}
              setMsgCounts={setMsgCounts}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatComponent;
