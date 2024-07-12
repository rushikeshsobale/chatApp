import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './AuthForms.css'; // import your custom styles
import 'bootstrap/dist/css/bootstrap.min.css'; // import Bootstrap CSS

const AuthForms = () => {
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5500'); // Change the URL to your backend server URL
    setSocket(newSocket);

    return () => newSocket.close(); // Close socket connection when component unmounts
  }, []);

  const toggleForm = () => {
    setIsLoginForm(!isLoginForm);
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
   
    // Extract form data
    const formData = new FormData(event.target);
    const userData = {
      email: formData.get('email'),
      password: formData.get('password'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      birthdate: formData.get('birthdate'),
      phone: formData.get('phone'),
      username: formData.get('username'),
    };
    
    // Determine the endpoint based on the form type
    const endpoint = isLoginForm ? 'http://localhost:5500/login' : 'http://localhost:5500/register';

    try {
      // Send a POST request to the server
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      // Check if the request was successful
      if (response.ok) {
        const tokenData = await response.json();
        const token = tokenData.token;
        document.cookie = `token=${token}; path=/; SameSite=Lax`;
        
        // Emit username to backend using Socket.io upon successful login
        

        console.log("everything looks fine");
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData.message);
      }
    } catch (error) {
      console.error('Error:', error.message);
      console.error('Error parsing JSON response:', error);
    }
  };

  return (
    <div className="auth-forms bg-dark w-100">
      <div className="form-container">
        <div className="form-header">
          <h2>{isLoginForm ? 'Login' : 'Register'}</h2>
         
        </div>
        <form onSubmit={handleSubmit}>
          <div className="row ">
            {!isLoginForm && (
              <>
                <div className="col-md-6">
                  <div className="form-group input-group-sm">
                    <label htmlFor="register-firstName">First Name:</label>
                    <input type="text" id="register-firstName" name="firstName" className="form-control" required />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group input-group-sm">
                    <label htmlFor="register-lastName">Last Name:</label>
                    <input type="text" id="register-lastName" name="lastName" className="form-control" required />
                  </div>
                </div>
                <div className="col-md-6">
              <div className="form-group input-group-sm">
                <label htmlFor="register-birthdate">Birthdate:</label>
                <input type="date" id="register-birthdate" name="birthdate" className="form-control" required />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group input-group-sm">
                <label htmlFor="register-phone">Phone No:</label>
                <input type="tel" id="register-phone" name="phone" className="form-control" required />
              </div>
            </div>
              </>
            )}
            
          </div>
         
          <hr />
          <div className="form-group input-group-sm">
            <label htmlFor="register-email">Email:</label>
            <input type="email" id="register-email" name="email" className="form-control" required />
          </div>
          <div className="form-group input-group-sm">
            <label htmlFor="register-password">Password:</label>
            <input type="password" id="register-password" name="password" className="form-control" required />
          </div>
          {!isLoginForm && (
            <div className="form-group input-group-sm">
              <label htmlFor="register-conf-password">Confirm Password:</label>
              <input type="password" id="register-conf-password" name="confPassword" className="form-control" required />
            </div>
          )}
          <div className="row">
            <div className="col-md-6">
              <div className="form-group input-group-sm">
                <button type="submit" className="btn btn-primary">{isLoginForm ? 'Login' : 'Register'}</button>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group switch-form ">
                <p className="input-group-sm"> <button type="button" className="btn btn-link" onClick={toggleForm}>{isLoginForm ? 'Register here' : 'Login here'}</button> {isLoginForm ? "Don't have an account?" : "Already have an account?"} </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForms;
