import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaUserEdit, FaUserFriends } from 'react-icons/fa'; // Import icons
import './index.css';

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:5500/getUser', {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          setFriends(data.friends);
        } else {
          console.error("Failed to fetch user data:", response.statusText);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleEditProfile = () => {
    // Logic for editing user profile
    console.log("Edit profile clicked");
  };

  return (
    <div className="container mt-5">
      {userData ? (
        <div className="card">
          <img
            src="https://via.placeholder.com/800x200?text=Cover+Image" // Default cover image
            alt="Cover"
            className="card-img-top"
            style={{ height: '200px', objectFit: 'cover' }}
          />
          <div className="card-body text-center">
            <img
              src={userData.profilePicture || 'https://via.placeholder.com/150?text=Profile+Picture'} // Default profile image
              alt="Profile"
              className="rounded-circle"
              style={{ width: '150px', height: '150px', border: '3px solid white' }}
            />
            <h1 className="mt-3">{userData.firstName} {userData.lastName}</h1>
            <h4 className="text-muted">{userData.email}</h4>
            <button onClick={handleEditProfile} className="btn btn-primary mt-2">
              <FaUserEdit /> Edit Profile
            </button>
          </div>

          <div className="card-body">
            <h2 className="mb-4">
              Friends <FaUserFriends />
            </h2>
            <div className="d-flex flex-wrap justify-content-center">
              {friends.length > 0 ? (
                friends.map(friend => (
                  <div key={friend.friendId} className="card m-2" style={{ width: '120px' }}>
                    <img src={friend.profilePicture || 'https://via.placeholder.com/100?text=Friend'} alt="Friend" className="card-img-top rounded-circle" style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                    <div className="card-body text-center">
                      <h5 className="card-title">{friend.friendName}</h5>
                    </div>
                  </div>
                ))
              ) : (
                <p>No friends yet!</p>
              )}
            </div>
          </div>

          {/* Notifications or Friend Requests Section */}
          <div className="card-body">
            <h3>Notifications</h3>
            {/* You can implement a similar logic here to show notifications */}
          </div>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default ProfilePage;
