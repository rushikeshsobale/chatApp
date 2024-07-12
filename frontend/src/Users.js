import React, { useState, useEffect } from 'react';
import './index.css'; // Import CSS file for styling

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);
  const [userData, setUserData] = useState(null); // Initialize userData state
  const [disabledButtons, setDisabledButtons] = useState([]); // Initialize state for disabled buttons

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
        setDisabledButtons([...disabledButtons, index]); // Add index to disabledButtons array
      }
    } catch (error) {
      console.log(error);
    }
  }

  const fun = async () => {
    try {
      const response = await fetch(`http://localhost:5500/getUser`, {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUserData(data); // Set userData state with fetched data
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
    fun();
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
        // Remove the accepted request from the userData.requests array
        setUserData(prevUserData => ({
          ...prevUserData,
          requests: prevUserData.requests.filter(request => request[0] !== requestId)
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
        // Remove the declined request from the userData.requests array
        setUserData(prevUserData => ({
          ...prevUserData,
          requests: prevUserData.requests.filter(request => request[0] !== requestId)

        }));
      } else {
        console.error("Failed to decline friend request:", response.statusText);
      }
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };


  return (
    <div className="users-container">
      <div className="row">
        <div className="col-12 col-sm-8">
          <h1>Notifications</h1>
          <ul className="users-list">
            {userData && userData.requests && userData.requests.map((request, index) => (
              <li key={index} className="user-item">
                {request[1]} sent friend request
                <button onClick={() => acceptFriendRequest(request[0])} className="add-friend-btn fs-11">Accept</button>
                <button onClick={() => declineFriendRequest(request[0])} className="add-friend-btn fs-11">Decline</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-12 col-sm-4">
          <h2>Users</h2>
          <ul className="users-list">
            {users
              .map((user, index) => (
                <li key={user._id} className="user-item">
                  {user.firstName + ' ' + user.lastName}
                  <button onClick={() => addFriend(user._id, index)} className="add-friend-btn fs-11" disabled={disabledButtons.includes(index)}>Add Friend</button>
                </li>
              ))}
          </ul>

        </div>
      </div>
    </div>
  );
};

export default UsersList;
