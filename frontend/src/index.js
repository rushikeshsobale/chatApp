import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
//import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import Navbar from './Nav.js';
import AuthForms from './AuthForms.js';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import Users from './Users.js';
import ChatComponent from './Chat.js';
import { store } from './store/store'
import { Provider } from 'react-redux'
import ProfilePage from './ProfilePage.js';
const root = ReactDOM.createRoot(document.getElementById('root'));


root.render(
<Provider store={store}>
    <div >
    <BrowserRouter>
    <Navbar/>
    <Routes>
         
          <Route path="/" element={<ChatComponent/>}></Route>
          <Route path="/AuthForms" element={<AuthForms/>}></Route>
          <Route path="/Users" element={<Users/>}></Route>
          <Route path="/ProfilePage" element={<ProfilePage/>}></Route>
         
        </Routes>
    
    </BrowserRouter>
    
  </div>
  </Provider>
);

reportWebVitals();
