import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './App.scss';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Homepage from './pages/Homepage';
import Login from './pages/Login';


ReactDOM.render(
  <Router>
    <Routes>
      <Route path="/login" element={<Login isSignUp={false} />} />
      <Route path="/signup" element={<Login isSignUp={true} />} />
      <Route path="/" element={<Homepage />} />

    </Routes>
  </Router>,
  document.getElementById('root')
);