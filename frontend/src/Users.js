import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaUserPlus, FaUserCheck, FaUserFriends } from 'react-icons/fa'; // Import icons
import './index.css';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [userData, setUserData] = useState(null);
  const [disabledButtons, setDisabledButtons] = useState([]);

  useEffect(() => {
    if (!dataFetched) {
      const fetchUsers = async () => {
        try {
          const response = await fetch('http://localhost:5500/getUsers', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: "include"
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setUsers(data);
          setDataFetched(true);
        } catch (error) {
          console.error('There was a problem fetching users:', error);
        }
      };

      fetchUsers();
    }
  }, [dataFetched]);

  const addFriend = async (userId, index) => {
    try {
      const call = await fetch(`http://localhost:5500/sendRequest/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: "include"
      });

      if (call.ok) {
        console.log("Friend request sent successfully");
        setDisabledButtons([...disabledButtons, index]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(`http://localhost:5500/getUser`, {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else if (response.status === 401) {
        console.log("Unauthorized: Token not provided or invalid");
      } else {
        console.error("Failed to fetch user data:", response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const acceptFriendRequest = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5500/acceptFriendRequest/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });

      if (response.ok) {
        console.log("Friend request accepted successfully");
        setUserData(prevUserData => ({
          ...prevUserData,
          friends: prevUserData.friends.map(request => 
            request.friendId === requestId ? { ...request, isFriend: true } : request
          )
        }));
      } else {
        console.error("Failed to accept friend request:", response.statusText);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const declineFriendRequest = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5500/declineFriendRequest/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });

      if (response.ok) {
        console.log("Friend request declined successfully");
        setUserData(prevUserData => ({
          ...prevUserData,
          friends: prevUserData.friends.filter(request => request.senderId !== requestId)
        }));
      } else {
        console.error("Failed to decline friend request:", response.statusText);
      }
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  // Check the friend's status
  const getFriendStatus = (userId) => {
    if (userData) {
      const friend = userData.friends.find(friend => friend.friendId === userId);
      if (friend) {
        return friend.isFriend ? 'friends' : 'requested'; // Return status
      }
    }
    return 'not_friends'; // Default status
  };

  return (
    <div className="container mt-5">
      <div className="row">
        {/* Notifications Section */}
        <div className="col-md-8 mb-4">
          <h2 className="mb-4">Notifications</h2>
          <ul className="list-group">
            {userData && userData.friends.filter(request => !request.isFriend).map((request, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                {request.friendName} sent a friend request
                <div>
                  <button 
                    onClick={() => acceptFriendRequest(request.friendId)} 
                    className="btn btn-success btn-sm me-2"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => declineFriendRequest(request.friendId)} 
                    className="btn btn-danger btn-sm"
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Users List Section */}
        <div className="col-md-4">
          <h2 className="mb-4">Users</h2>
          <ul className="list-group">
            {users.map((user, index) => {
              const status = getFriendStatus(user._id);
              return (
                <li key={user._id} className="list-group-item d-flex justify-content-between align-items-center">
                  {user.firstName + ' ' + user.lastName}
                  {status === 'friends' ? (
                    <button className="btn btn-secondary btn-sm" disabled>
                      <FaUserFriends /> Friends
                    </button>
                  ) : status === 'requested' ? (
                    <button className="btn btn-warning btn-sm">
                      <FaUserCheck /> Requested
                    </button>
                  ) : (
                    <button 
                      onClick={() => addFriend(user._id, index)} 
                      className="btn btn-primary btn-sm"
                    >
                      <FaUserPlus /> Add Friend
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UsersList;
